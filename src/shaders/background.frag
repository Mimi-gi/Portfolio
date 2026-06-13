#ifdef GL_ES
precision mediump float;
#endif

// 独立プレビュアー(glsl-canvasなど)のために標準的な変数を用意
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution; // 自動でプレビュアーから渡されます

// React側からの独自カスタマイズ変数
uniform float u_gridSize; // 画面分割数ではなく、1マスの「ピクセルサイズ」に変更
uniform float u_glowStrength;
uniform vec3 u_colorGrid;



void main() {
  // u_gridSizeなどにプレビュアー環境用のフォールバック値を設定
  float gridSize = u_gridSize > 0.0 ? u_gridSize : 50.0;
  float glowStrength = u_glowStrength > 0.0 ? u_glowStrength : 8.0;
  float smallGridDividion = 6.0; // 小さいグリッドの分割数
  vec3 colorGrid = length(u_colorGrid) > 0.0 ? u_colorGrid : vec3(0.4627, 0.4235, 0.0);

  // ピクセル座標をそのまま使うことで、画面サイズに依存せずグリッドの大きさを一定に保つ
  vec2 coord = gl_FragCoord.xy;

  // ピクセル座標ベースでグリッドを計算
  vec2 gridId = floor(coord / gridSize)+vec2(0.5); // グリッドIDを0.5ずらして、ラインがピクセルの中心に来るように
  vec2 gridUv = fract(coord / gridSize);
  vec2 smallGridId = floor(gridUv*smallGridDividion)/smallGridDividion; // 小さいグリッドのUV
  
  // マウスとの距離計算。画面高さ(u_resolution.y)で割って正規化することで、
  // 画面スケールが変わっても発光の大きさ(glowStrengthの効き具合)を保つ
  float dist = distance(gridId * gridSize, u_mouse.xy) / u_resolution.y;
  dist *= 3.;
  
  // マウスが近づくほど強く光る
  float glow = exp(-dist*dist * glowStrength);
  

  float p=2.0;
  float gridCol = 1.0-pow(pow(abs((vec2(0.5)-smallGridId).x), p)+pow(abs((vec2(0.5)-smallGridId).y), p), 1.0/p); // グリッドラインを鋭くするためにべき乗
  // 色の合成
  vec3 baseColor = vec3(0.0, 0.0, 0.0); // 暗い緑
  vec3 gridColor = gridCol *vec3(0.2314, 0.2157, 0.0118);
  vec3 interactColor = colorGrid * glow ;

  vec3 finalColor = baseColor + gridColor + interactColor;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
