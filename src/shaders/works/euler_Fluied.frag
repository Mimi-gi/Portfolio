#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_clickPos;
uniform float u_clickTime;
uniform float u_clickSeed;

varying vec2 vUv;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

vec2 toNdc(vec2 pixelPos) {
  vec2 ndc = (pixelPos / max(u_resolution, vec2(1.0))) * 2.0 - 1.0;
  ndc.x *= u_resolution.x / max(u_resolution.y, 1.0);
  return ndc;
}

vec2 clickDivergence(vec2 p, float t) {
  float elapsed = t - u_clickTime;
  if (elapsed < 0.0 || elapsed > 3.0) return vec2(0.0);

  vec2 c = toNdc(u_clickPos);
  vec2 d = p - c;
  float r = length(d);

  float radius = 0.95;
  float envelope = exp(-elapsed * 1.35) * smoothstep(radius, 0.0, r);

  vec2 grid = floor((p - c) * 20.0);
  float rnd = hash21(grid + vec2(u_clickSeed, u_clickSeed * 1.73));
  float ang = rnd * 6.2831853 + t * 0.25;

  vec2 radial = normalize(d + vec2(1e-5));
  vec2 swirl = vec2(cos(ang), sin(ang));
  vec2 dir = normalize(radial * 0.7 + swirl * 0.3);

  return dir * envelope * 1.2;
}

vec2 velocityField(vec2 p, float t) {
  vec2 base = vec2(
    sin(2.1 * p.y + t * 0.9) + cos(1.4 * p.x - t * 0.6),
    cos(2.0 * p.x - t * 0.8) - sin(1.7 * p.y + t * 0.5)
  );
  base *= 0.34;

  vec2 clickBurst = clickDivergence(p, t);
  return base + clickBurst;
}

float pressureAt(vec2 p, float t) {
  vec2 q = p;
  float dt = 0.13;

  for (int i = 0; i < 6; i++) {
    vec2 v = velocityField(q, t);
    q -= v * dt;
  }

  float eps = 0.018;
  vec2 vx1 = velocityField(q + vec2(eps, 0.0), t);
  vec2 vx2 = velocityField(q - vec2(eps, 0.0), t);
  vec2 vy1 = velocityField(q + vec2(0.0, eps), t);
  vec2 vy2 = velocityField(q - vec2(0.0, eps), t);

  float divergence = ((vx1.x - vx2.x) + (vy1.y - vy2.y)) / (2.0 * eps);
  return 0.5 + 0.5 * tanh(divergence * 2.4);
}

vec3 pressureColor(float p) {
  vec3 low = vec3(0.10, 0.32, 0.95);
  vec3 mid = vec3(0.08, 0.10, 0.16);
  vec3 high = vec3(0.98, 0.32, 0.14);

  vec3 coldToMid = mix(low, mid, smoothstep(0.0, 0.5, p));
  vec3 midToHot = mix(mid, high, smoothstep(0.5, 1.0, p));
  return mix(coldToMid, midToHot, step(0.5, p));
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= u_resolution.x / max(u_resolution.y, 1.0);

  float pressure = pressureAt(uv, u_time);
  vec3 col = pressureColor(pressure);

  vec2 c = toNdc(u_clickPos);
  float clickGlow = smoothstep(0.16, 0.0, length(uv - c));
  col += vec3(0.9, 0.95, 1.0) * clickGlow * 0.2;

  gl_FragColor = vec4(col, 1.0);
}
