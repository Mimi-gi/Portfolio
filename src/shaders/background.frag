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


float getFishDistance(vec2 coord,float tailScale){
  float d=10000.;
  for(int i=0;i<JOINT_COUNT-1;i++){
    float baseRadius=mix(18.,2.,float(i)/float(JOINT_COUNT-1));
    float scale=i==0?1.:tailScale;
    float r=max(baseRadius*scale,.001);
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
  vec3 bloomColor=vec3(0.4,0.9,0.5)*glowIntensity*glowFactor;
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
  vec3 sphereColor=vec3(0.82,0.95,0.85);
  vec3 col=mix(vec3(0.),sphereColor,alpha);
  col+=vec3(0.3,0.8,0.45)*exp(-max(0.,d)*0.16)*0.45;
  return col;
}

vec3 getAboutEffect(vec2 coord,float tailScale){
  float d=getFishDistance(coord,tailScale);
  vec3 fishColor=vec3(.6,.8,.6);
  if(d<-4.){
    fishColor=vec3(.8,1.,.8);
  }
  vec3 currentEffect=shadeFishFromDistance(d,fishColor);
  return applyTrail(coord,currentEffect,0.9);
}

vec3 getWorks2DEffect(vec2 coord){
  // TODO: 宇宙背景（星雲/星）を追加予定
  float pixelSize=8.;
  vec2 pixelCoord=floor(coord/pixelSize)*pixelSize+pixelSize*0.5;
  float d=getFishDistance(pixelCoord,1.);
  vec3 fish=shadeFishFromDistance(d,vec3(.62,.92,.72));

  vec2 gridUv=floor(coord/pixelSize);
  float checker=mod(gridUv.x+gridUv.y,2.);
  vec3 bg=mix(vec3(0.02,0.03,0.05),vec3(0.03,0.04,0.08),checker);
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
  