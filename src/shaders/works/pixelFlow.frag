#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 frag = vUv * u_resolution;

  float px = 8.0;
  vec2 cell = floor(frag / px);
  vec2 gridUv = fract(frag / px);

  float t = u_time * 1.25;
  float n = hash(cell + floor(t));

  float stripe = smoothstep(0.2, 0.8, sin((cell.y * 0.55 + t * 2.0) + n * 6.2831) * 0.5 + 0.5);
  float pulse = smoothstep(0.15, 0.0, abs(gridUv.y - 0.5)) * 0.25;

  vec3 bg = vec3(0.02, 0.04, 0.08);
  vec3 c1 = vec3(0.10, 0.78, 0.58);
  vec3 c2 = vec3(0.62, 0.90, 0.35);

  vec3 col = mix(bg, mix(c1, c2, n), stripe * 0.9);
  col += vec3(0.85, 1.0, 0.9) * pulse;

  gl_FragColor = vec4(col, 1.0);
}
