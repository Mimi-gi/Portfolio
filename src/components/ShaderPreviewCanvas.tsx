import { useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import vertexShader from '../shaders/background.vert'

type ShaderPreviewCanvasProps = {
  fragmentShader: string
}

function ShaderPlane({ fragmentShader }: ShaderPreviewCanvasProps) {
  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_clickPos: { value: new THREE.Vector2(-9999, -9999) },
      u_clickTime: { value: -1000 },
      u_clickSeed: { value: 0 },
      // Shadertoy風の命名でも書けるように同時に渡す
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(1, 1, 1) },
      iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
    }),
    [],
  )

  useFrame((state) => {
    const dpr = window.devicePixelRatio || 1
    const width = size.width * dpr
    const height = size.height * dpr

    uniforms.u_time.value = state.clock.elapsedTime
    uniforms.u_resolution.value.set(width, height)

    uniforms.iTime.value = state.clock.elapsedTime
    uniforms.iResolution.value.set(width, height, 1)
  })

  return (
    <mesh
      onPointerDown={(e) => {
        const uv = e.uv
        if (!uv) return

        const px = uv.x * uniforms.u_resolution.value.x
        const py = (1 - uv.y) * uniforms.u_resolution.value.y

        uniforms.u_clickPos.value.set(px, py)
        uniforms.u_clickTime.value = uniforms.u_time.value
        uniforms.u_clickSeed.value = Math.random() * 1000

        uniforms.iMouse.value.set(px, py, px, py)
      }}
      onPointerMove={(e) => {
        const uv = e.uv
        if (!uv) return

        const px = uv.x * uniforms.u_resolution.value.x
        const py = (1 - uv.y) * uniforms.u_resolution.value.y

        uniforms.u_mouse.value.set(px, py)
        uniforms.iMouse.value.x = px
        uniforms.iMouse.value.y = py
      }}
    >
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  )
}

export default function ShaderPreviewCanvas({ fragmentShader }: ShaderPreviewCanvasProps) {
  return (
    <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
      <ShaderPlane fragmentShader={fragmentShader} />
    </Canvas>
  )
}
