import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// 外部GLSLファイルを読み込み
import vertexShader from '../shaders/background.vert'
import fragmentShader from '../shaders/background.frag'

export default function BackgroundShader() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  
  // 実際のマウス位置と、Lerp（滑らかな追従）用のマウス位置
  const currentMouse = useMemo(() => new THREE.Vector2(0, 0), [])
  const targetMouse = useMemo(() => new THREE.Vector2(0, 0), [])
  const { size } = useThree()

  // Canvasが前面のUI要素に覆われていてイベントを拾えないため、
  // ウィンドウ全体のmousemoveイベントから座標を直接取得する
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 修正箇所1: モニターのスケーリング(DPR)を掛けて「物理ピクセル」に揃える
      const dpr = window.devicePixelRatio
      currentMouse.x = e.clientX * dpr
      currentMouse.y = (window.innerHeight - e.clientY) * dpr
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [currentMouse])

  // 毎フレーム呼ばれる処理
  useFrame((state) => {
    if (!materialRef.current) return

    // 画面サイズと時間の更新 (GLSL Canvasと同じ環境を作る)
    materialRef.current.uniforms.u_time.value = state.clock.elapsedTime
    // 修正箇所2: 解像度にもDPRを掛けて物理ピクセルサイズにする
    materialRef.current.uniforms.u_resolution.value.set(
      size.width * window.devicePixelRatio, 
      size.height * window.devicePixelRatio
    )

    // 簡易的なLerpでマウス追従を少し滑らかにする
    targetMouse.x = (currentMouse.x ) 
    targetMouse.y = (currentMouse.y )

    materialRef.current.uniforms.u_mouse.value.copy(targetMouse)
  })

  return (
    <mesh>
      {/* PlaneGeometryのサイズをウィンドウのサイズに追従させる */}
      {/* Orthographicカメラの視野角と合わせて、ピクセルパーフェクトな2D描画を実現する */}
      <planeGeometry args={[size.width, size.height]} />
      {/* GLSLシェーダーマテリアル */}
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          u_time: { value: 0 },
          u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          u_mouse: { value: new THREE.Vector2(0, 0) },
          u_gridSize: { value: 50.0 }, // C#側のハードコード値
          u_glowStrength: { value: 8.0 },
          u_colorGrid: { value: new THREE.Color(1.0, 1.0, 1.0) } // ここが緑になっていたので白色(1.0, 1.0, 1.0)に修正
        }}
      />
    </mesh>
  )
}
