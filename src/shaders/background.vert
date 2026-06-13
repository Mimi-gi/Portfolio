varying vec2 vUv;
void main() {
  vUv = uv; // uv座標(0.0 ~ 1.0)をフラグメントシェーダーへ送る
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
