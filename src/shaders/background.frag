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
uniform float u_pageIndex;// 現在のページ（0.0: Home, 1.0: About, 2.0: 2D Works, 3.0: Shader Works）
uniform sampler2D u_prevFrame;// 前のフレームの描画結果

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

float hash21(vec2 p){
  p=fract(p*vec2(123.34,345.45));
  p+=dot(p,p+34.345);
  return fract(p.x*p.y);
}

vec2 hash22(vec2 p){
  float n1=hash21(p+vec2(13.37,41.79));
  float n2=hash21(p+vec2(97.13,11.53));
  return vec2(n1,n2);
}

float triangularLife(float t,float peak,float halfWidth){
  float w=max(halfWidth,0.0001);
  return max(0.,1.-abs(t-peak)/w);
}

float voronoiStar(vec2 uv,float cellScale,vec2 jitter){
  vec2 g=uv*cellScale;
  vec2 base=floor(g);

  float minDist=1e9;
  vec2 nearestCell=vec2(0.);

  for(int oy=-1;oy<=1;oy++){
    for(int ox=-1;ox<=1;ox++){
      vec2 cell=base+vec2(float(ox),float(oy));
      vec2 samplePoint=cell+hash22(cell+jitter);
      float d=length(g-samplePoint);
      if(d<minDist){
        minDist=d;
        nearestCell=cell;
      }
    }
  }

  float loopT=mod(u_time,5.0);
  float peak=hash21(nearestCell+jitter+vec2(1.7,9.3))*5.0;
  float lifeWidth=mix(0.25,0.5,hash21(nearestCell+jitter+vec2(4.2,8.8))); // 0.5s~1.0sの幅
  float life=triangularLife(loopT,peak,lifeWidth);

  float maxRadius=mix(0.03,0.1,hash21(nearestCell+jitter+vec2(7.1,2.4)));
  float radius=maxRadius*life;
  float core=smoothstep(radius,0.,minDist);

  return core*life;
}

vec3 getSpaceBaseBackground(vec2 uv){
  // うっすらとした宇宙の下地
  vec2 p=uv*2.-1.;
  p.x*=u_resolution.x/max(u_resolution.y,1.);
  float cloud=0.5+0.5*sin(p.x*2.1+p.y*2.7+u_time*0.06);
  return mix(vec3(0.01,0.015,0.05),vec3(0.03,0.05,0.11),cloud*0.35+0.2);
}

float getStarIntensity(vec2 uv){
  // Voronoiセルごとのランダム点を使った瞬き星
  float stars=0.;
  stars+=voronoiStar(uv,55.,vec2(0.17,0.31))*0.9;
  stars+=voronoiStar(uv+vec2(0.37,0.19),85.,vec2(0.71,0.53))*0.6;
  return stars;
}

vec3 getSpaceBackground(vec2 coord){
  vec2 uv=coord/u_resolution.xy;
  vec3 bg=getSpaceBaseBackground(uv);
  float stars=getStarIntensity(uv);

  vec3 starCol=vec3(0.78,0.87,1.)*stars;
  vec3 bloom=vec3(1.)*pow(stars,3.)*0.35;
  return bg+starCol+bloom;
}

vec3 getPixelatedSpaceBackground(vec2 coord,float pixelSize){
  vec2 cellMin=floor(coord/pixelSize)*pixelSize;
  vec2 center=cellMin+pixelSize*0.5;
  vec2 uv=center/u_resolution.xy;

  // ピクセル化: セル中心で1回だけ評価
  vec3 col=getSpaceBaseBackground(uv);
  float levels=6.;
  col=floor(col*levels)/levels;

  // 星描画: ピクセル化後の座標で星を評価
  float stars=getStarIntensity(uv);
  float starAlpha=smoothstep(0.02,0.22,stars);
  return mix(col,vec3(0.8667,0.8588,1.0),starAlpha);
}

float divideLerp(int N,int n,float t)
{
  if(N <= 0 || n < 0 || n >= N) return 0.;

  if(t <= float(n)/float(N)) return 0.;
  if(t >= float(n + 1)/float(N)) return 1.;
  return (1.-t)*float(n)/float(N) + t*float(n + 1)/float(N);
}

float getFishDistance(vec2 coord,float tailScale){
  float d=10000.;
  for(int i=0;i<JOINT_COUNT-1;i++){
    float baseRadius=mix(18.,2.,float(i)/float(JOINT_COUNT-1));
    float scale=i==0?1.:divideLerp(JOINT_COUNT-1,i,tailScale);
    float r=max(baseRadius*scale,.0);
    float dist=sdCapsule(coord,u_joints[i],u_joints[i+1],r);
    d=smin(d,dist,30.);
  }
  return d;
}

vec3 shadeFishFromDistance(float d,vec3 fishColor){
  float alpha=smoothstep(1.,0.,d);
  vec3 col=mix(vec3(0.),fishColor,alpha);

  float glowWidth=50.;
  float glowIntensity=.5;
  float glowFactor=exp(-max(0.,d)*(5./glowWidth));
  vec3 bloomColor=vec3(0.4, 0.5333, 0.902)*glowIntensity*glowFactor;
  return col+bloomColor;
}

vec3 applyTrail(vec2 coord,vec3 currentEffect,float decay){
  vec2 trailUv=coord/u_resolution.xy;
  vec3 prevColor=texture2D(u_prevFrame,trailUv).rgb;
  vec3 baseBg=vec3(0.);
  vec3 trail=max(prevColor*decay,baseBg);
  return max(currentEffect,trail);
}

vec3 getHomeEffect(vec2 coord){
  vec2 head=u_joints[0];
  float d=length(coord-head)-20.;
  float alpha=smoothstep(1.,0.,d);
  vec3 sphereColor=vec3(0.8275, 0.8196, 0.949);
  vec3 col=mix(vec3(0.),sphereColor,alpha);
  col+=vec3(0.4, 0.5333, 0.902)*exp(-max(0.,d)*0.16)*0.45;
  return col;
}

vec3 getAboutEffect(vec2 coord,float tailScale){
  float d=getFishDistance(coord,tailScale);
  vec3 fishColor=vec3(0.4, 0.5333, 0.902);
  if(d<-4.){
    fishColor=vec3(0.4, 0.5333, 0.902);
  }
  vec3 currentEffect=shadeFishFromDistance(d,fishColor);
  vec3 trailEffect=applyTrail(coord,currentEffect,0.9);
  vec3 stars=getSpaceBackground(coord);
  return max(stars,trailEffect);
}

vec3 getWorks2DEffect(vec2 coord){
  float pixelSize=8.;
  vec2 pixelCoord=floor(coord/pixelSize)*pixelSize+pixelSize*0.5;
  float d=getFishDistance(pixelCoord,1.);
  vec3 fish=shadeFishFromDistance(d,vec3(0.6196, 0.7255, 0.9216));

  vec3 bg=getPixelatedSpaceBackground(coord,pixelSize);
  return max(bg,fish*0.95);
}

vec3 getShaderWorksEffect(vec2 coord){
  // TODO: GPGPUのセルオートマトン/パーティクルを追加予定
  float d=getFishDistance(coord,1.);
  vec3 fish=shadeFishFromDistance(d,vec3(.55,.9,.75));

  vec2 uv=coord/u_resolution.xy;
  float shimmer=0.02*sin((uv.x+uv.y)*180.+u_time*4.);
  vec3 particlesHint=vec3(shimmer*0.4,shimmer,shimmer*0.6);
  return max(fish+particlesHint,vec3(0.));
}

void main(){
  vec2 coord=gl_FragCoord.xy;

  float t=fract(u_pageIndex);
  vec3 finalColor=vec3(0.);

  if(u_pageIndex<1.){
    // Home -> About
    // 遷移中は頭(節0)以外の半径をtで成長させる
    vec3 homeCol=getHomeEffect(coord);
    vec3 aboutCol=getAboutEffect(coord,t);
    finalColor=mix(homeCol,aboutCol,t);
  }else if(u_pageIndex<2.){
    // About -> 2D Works
    vec3 aboutCol=getAboutEffect(coord,1.);
    vec3 works2DCol=getWorks2DEffect(coord);
    finalColor=mix(aboutCol,works2DCol,t);
  }else if(u_pageIndex<3.){
    // 2D Works -> Shader Works
    vec3 works2DCol=getWorks2DEffect(coord);
    vec3 shaderWorksCol=getShaderWorksEffect(coord);
    finalColor=mix(works2DCol,shaderWorksCol,t);
  }else{
    finalColor=getShaderWorksEffect(coord);
  }

  gl_FragColor=vec4(finalColor,1.);
}
  