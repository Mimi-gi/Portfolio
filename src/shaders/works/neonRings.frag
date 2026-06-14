#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

varying vec2 vUv;

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  gl_FragColor = vec4(abs(uv.xyx), 1.0);
}
