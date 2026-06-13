import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ============================================
// 1. 頂点シェーダー (Vertex Shader)
// ============================================
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv; // uv座標(0.0 ~ 1.0)をフラグメントシェーダーへ送る
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// ============================================
// 2. フラグメントシェーダー (Fragment Shader)
// ============================================
const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  void main() {
    // uvをベースに格子状のグリッドを作成
    vec2 gridCount = vec2(30.0, 15.0);
    vec2 gridId = floor(vUv * gridCount);
    vec2 gridUv = fract(vUv * gridCount);
    
    // マウスカーソルとの距離を計算 (uMouseは 0.0 ~ 1.0 の範囲)
    // 画面のアスペクト比補正は今回は簡易化のため省略
    float dist = distance(vUv, uMouse);
    
    // マウスが近づくほど強く光る（波及効果）
    float glow = exp(-dist * 8.0);
    
    // 時間と位置でサイン波を作り、流体・波のような揺らぎを追加
    float wave = sin(gridId.x * 0.5 + uTime * 2.0) * sin(gridId.y * 0.5 + uTime * 2.0);
    
    // 基本の格子ラインを描画 (太さ調整用)
    float lineThickness = 0.9 - (glow * 0.2); 
    float line = step(lineThickness, gridUv.x) + step(lineThickness, gridUv.y);
    
    // 色の合成
    vec3 baseColor = vec3(0.05, 0.1, 0.05); // 暗い緑
    vec3 lineColor = vec3(0.2, 0.5, 0.2) * line;
    vec3 interactColor = vec3(0.1, 0.8, 0.3) * glow * (wave * 0.5 + 0.5);

    vec3 finalColor = baseColor + lineColor + interactColor;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

export default function BackgroundShader() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  
  // 状態の毎フレーム生成を避けるため useMemo を使用
  const targetMouse = useMemo(() => new THREE.Vector2(0.5, 0.5), [])

  // useThreeを利用して、ウィンドウ全体のポインターを取得
  const { pointer } = useThree()

  // 毎フレーム呼ばれる処理 (Unityでの Update() に相当)
  useFrame((state) => {
    if (!materialRef.current) return

    // Time変数の更新
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime

    // pointer変数は -1.0 ~ 1.0 の範囲で返ってくるため、
    // シェーダー(UV座標の 0.0 ~ 1.0)に合わせて変換する
    const currentMouseX = (pointer.x + 1) / 2
    const currentMouseY = (pointer.y + 1) / 2

    // 簡易的なLerpでマウス追従を少し滑らかにする
    targetMouse.x += (currentMouseX - targetMouse.x) * 0.1
    targetMouse.y += (currentMouseY - targetMouse.y) * 0.1

    materialRef.current.uniforms.uMouse.value.copy(targetMouse)
  })

  return (
    <mesh>
      {/* 画面全体を覆う板(Plane) */}
      <planeGeometry args={[2, 2]} />
      {/* GLSLシェーダーマテリアル */}
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) }
        }}
        // 常に前面に描画させたい場合は depthWrite={false} など適宜
      />
    </mesh>
  )
}
