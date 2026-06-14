#ifdef GL_ES
precision mediump float;
#endif

// 独立プレビュアー(glsl-canvasなど)のために標準的な変数を用意
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;// 自動でプレビュアーから渡されます

// React側からの独自カスタマイズ変数
uniform float u_gridSize;
uniform float u_glowStrength;
uniform vec3 u_colorGrid;
uniform float u_pageIndex;// 現在のページ（0.0: Index, 1.0: 2D Works, 2.0: Shader Works, 3.0: About）
uniform sampler2D u_prevFrame;// 前のフレームの描画結果

// ノイズ関数（トランジション用）
float rand(vec2 n){
  return fract(sin(dot(n,vec2(12.9898,4.1414)))*43758.5453);
}

// ドット絵風のトランジション用ノイズ (モザイクブロック単位で評価)
float blockNoise(vec2 coord,float blockSize){
  vec2 block=floor(coord/blockSize);
  return rand(block);
}

// === 節の数をここで共通化 ===
#define JOINT_COUNT 15

uniform vec2 u_joints[JOINT_COUNT];// React(CPU)から渡される関節座標

// 線分(カプセル)までの距離を測るSDF
float sdCapsule(vec2 p,vec2 a,vec2 b,float r){
  vec2 pa=p-a,ba=b-a;
  float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);
  return length(pa-ba*h)-r;
}

// 複数のSDFを粘っこく融合させる (Smooth Minimum)
float smin(float a,float b,float k){
  float h=clamp(.5+.5*(b-a)/k,0.,1.);
  return mix(b,a,h)-k*h*(1.-h);
}

// 1. GenerativeAnimation (Indexページ) のエフェクト (SDF + IK魚)
vec3 getEffect0(vec2 coord){
  vec2 uv=fract(coord/40.);
  // シンプルなグリッドライン
  
  
  float d=10000.;
  for(int i=0;i<JOINT_COUNT-1;i++){
    // 頭側を太く、尻尾側を細くする
    float r=mix(18.,2.,float(i)/float(JOINT_COUNT-1));
    float dist=sdCapsule(coord,u_joints[i],u_joints[i+1],r);
    d=smin(d,dist,30.);// k=15.0 でなめらかに融合
  }
  
  // 魚の本体色 (ハイライトをつける)
  vec3 fishColor=vec3(.6,.8,.6);
  if(d<-4.){
    fishColor=vec3(.8,1.,.8);// 内側を少し明るく
  }
  
  // dが0以下の部分を魚として描画し、境界を滑らかにする(アンチエイリアス)
  float alpha=smoothstep(1.,0.,d);
  vec3 col = mix(vec3(0.0), fishColor, alpha);

  // 距離(d)を利用して、魚の周囲（外側）にグロー（Bloom）効果を追加する
  // 魚の外側（d > 0.0）かつ、一定距離以内（例えば d < 30.0）ならば光らせる
  float glowWidth = 50.0;
  float glowIntensity = .5; // 光の強さ
  
  // 魚の外側に向かって減衰する光（指数関数的に減衰するとよりBloomらしくなります）
  // d <= 0.0（魚の内部）では関係ないため max(0.0, d) としています
  float glowFactor = exp(-max(0.0, d) * (5.0 / glowWidth)); 
  
  // Bloomの色は本体の色より少し緑・黄みを強くして発光感を出す
  vec3 bloomColor = vec3(0.4, 0.9, 0.5) * glowIntensity * glowFactor;
  
  // 背景と合成された色の上に、加算合成(足し算)で光を乗せる
  col += bloomColor;

  // ==== ここから残像（トレイル）の処理 ====
  // 前フレームの同じ座標の色を取得
  vec2 trailUv = coord / u_resolution.xy;
  vec3 prevColor = texture2D(u_prevFrame, trailUv).rgb;
  
  // 背景色（ベースとなる色）
  vec3 baseBg = vec3(0.05, 0.06, 0.05);

  // 今回のフレームで新しく描画された魚や光の色を計算
  vec3 currentEffect = col;

  // 前フレームの色に 0.99 を掛けて少し暗くする（減衰させる）
  // baseBg よりも暗くならないように max で下限を設定します
  vec3 trail = max(prevColor * 0.9, baseBg);

  // もし今回のフレームで魚や光が新しく描画されていればそちらを優先し、
  // それ以外（背景部分）であれば前フレームの残像を表示します。
  // currentEffect（新規描画）と trail（残像）を加算やmaxで合成して返します。
  return max(currentEffect, trail);
}

// 2D Works ページのエフェクト（ドット・ピクセル風のレトロ背景）
  vec3 getEffect1(vec2 coord){
    float pixelSize=8.;
    vec2 pcoord=floor(coord/pixelSize);
    
    // ななめにスクロールする動き
    pcoord.y-=u_time*15.;
    pcoord.x-=u_time*10.;
    
    float modX=mod(pcoord.x,6.);
    float modY=mod(pcoord.y,6.);
    
    // 背景色（暗い緑系のレトロカラー）
    vec3 bgColor=vec3(.05,.08,.05);
    vec3 dotColor=vec3(.12,.25,.15);
    
    float dist=distance(coord,u_mouse.xy)/u_resolution.y;
    
    // シンプルなドット・チェッカーパターン
    if(modX<1.||modY<1.){
      return mix(dotColor,bgColor,min(dist*1.5,1.));
    }
    
    // 少し走査線のようなニュアンスを追加
    float scanline=sin(coord.y*.1+u_time*2.)*.01;
    return bgColor+vec3(scanline);
  }
  
  // Shader Works ページのエフェクト（流体・プラズマのようなアートな背景）
  vec3 getEffect2(vec2 coord){
    vec2 uv=coord/u_resolution.y;// 縦アスペクト比で正規化
    vec2 m=u_mouse.xy/u_resolution.y;
    
    vec2 p=uv*4.;
    for(int i=1;i<4;i++){
      vec2 newp=p;
      newp.x+=.8/float(i)*sin(float(i)*p.y+u_time*.4+.3);
      newp.y+=.8/float(i)*cos(float(i)*p.x+u_time*.4+.3);
      p=newp;
    }
    
    float f=cos(p.y+p.x);
    // 少しサイバーな感じの色味
    vec3 color=vec3(f*.1,f*.4+.1,f*.3+.05);
    
    // マウス位置でのインタラクション
    float dist=distance(uv,m);
    color+=vec3(.1,.6,.4)*exp(-dist*8.);
    
    // トーンを抑える
    return color*.8;
  }
  
  // 3. 通常 (Aboutページ) のエフェクト (無機質なグリッド)
  vec3 getEffect3(vec2 coord){
    float gridSize=u_gridSize>0.?u_gridSize:50.;
    float glowStrength=u_glowStrength>0.?u_glowStrength:8.;
    float smallGridDividion=6.;
    vec3 colorGrid=length(u_colorGrid)>0.?u_colorGrid:vec3(.4627,.4235,0.);
    
    vec2 gridId=floor(coord/gridSize)+vec2(.5);
    vec2 gridUv=fract(coord/gridSize);
    vec2 smallGridId=floor(gridUv*smallGridDividion)/smallGridDividion;
    
    float dist=distance(gridId*gridSize,u_mouse.xy)/u_resolution.y;
    dist*=3.;
    
    float glow=exp(-dist*dist*glowStrength);
    
    float p=2.;
    float gridCol=1.-pow(pow(abs((vec2(.5)-smallGridId).x),p)+pow(abs((vec2(.5)-smallGridId).y),p),1./p);
    
    vec3 baseColor=vec3(0.,0.,0.);
    vec3 gridColor=gridCol*vec3(.2314,.2157,.0118);
    vec3 interactColor=colorGrid*glow*.3;// Aboutは無機質な感じということで発光を弱めに
    
    return baseColor+gridColor+interactColor;
  }
  
  void main(){
    vec2 coord=gl_FragCoord.xy;
    
    vec3 col0=getEffect0(coord);
    vec3 col1=getEffect1(coord);
    vec3 col2=getEffect2(coord);
    vec3 col3=getEffect3(coord);
    
    vec3 finalColor=vec3(0.);
    
    float t=fract(u_pageIndex);
    
    // ブロックノイズを作って、ピクセルアートらしい遷移にする
    // progress (t) に応じて、ノイズでスパッと色が切り替わる
    float noise=blockNoise(coord,32.);// 32ピクセル単位のブロック
    // tの少し前後の幅で smoothstep（あるいは step）を行う
    float stepEdge=smoothstep(t-.1,t+.1,noise);
    
    // u_pageIndex の値に沿って、各エフェクトをブレンドする
    if(u_pageIndex<1.){
      // 0 -> 1: Generative -> 2D Works
      // noiseが高いブロックから先に col1(次) に切り替わる
      finalColor=mix(col1,col0,stepEdge);
    }else if(u_pageIndex<2.){
      // 1 -> 2: 2D Works -> Shader Works
      finalColor=mix(col2,col1,stepEdge);
    }else if(u_pageIndex<3.){
      // 2 -> 3: Shader Works -> About
      // 3は無機質なページなので、オシャレな遷移をせずシンプルなフェードやスワイプにする
      finalColor=mix(col2,col3,t);// ここは単純なクロスフェード
    }else{
      finalColor=col3;
    }
    
    gl_FragColor=vec4(finalColor,1.);
  }
  