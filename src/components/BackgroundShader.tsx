import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree, createPortal } from '@react-three/fiber'
import * as THREE from 'three'

// 外部GLSLファイルを読み込み
import vertexShader from '../shaders/background.vert'
import fragmentShader from '../shaders/background.frag'

// === 節の数をここで一括管理 ===
const JOINT_COUNT = 15;

export default function BackgroundShader({ scrollIndex }: { scrollIndex: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const scrollIndexRef = useRef(scrollIndex)
  
  // 実際のマウス位置と、Lerp（滑らかな追従）用のマウス位置
  const currentMouse = useMemo(() => new THREE.Vector2(0, 0), [])
  const targetMouse = useMemo(() => new THREE.Vector2(0, 0), [])
  const { size, camera, gl } = useThree()

  // --- FBO (Ping-Pong) setup ---
  const bufferScene = useMemo(() => new THREE.Scene(), [])
  const displayMaterialRef = useRef<THREE.MeshBasicMaterial>(null)

  const [rtA, rtB] = useMemo(() => {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth * dpr;
    const h = window.innerHeight * dpr;
    const opts: THREE.RenderTargetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType
    };
    return [new THREE.WebGLRenderTarget(w, h, opts), new THREE.WebGLRenderTarget(w, h, opts)];
  }, []);

  const fbTarget = useRef(rtA);
  const fbRead = useRef(rtB);

  // Resize handling for FBOs
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    rtA.setSize(size.width * dpr, size.height * dpr);
    rtB.setSize(size.width * dpr, size.height * dpr);
  }, [size, rtA, rtB]);

  const pageIndex = useRef(scrollIndex);

  useEffect(() => {
    scrollIndexRef.current = scrollIndex
  }, [scrollIndex])

  // --- 手続き型アニメーション(IK)用の状態 ---
  // 節の座標を保持
  const joints = useMemo(() => Array.from({ length: JOINT_COUNT }, () => new THREE.Vector2(0, 0)), []);
  const headAngle = useRef(0); // 頭の向いている角度

  // マテリアルの uniforms が再レンダリングの度に初期化されないように useMemo で保持する
  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    u_mouse: { value: new THREE.Vector2(0, 0) },
    u_gridSize: { value: 50.0 }, // C#側のハードコード値
    u_glowStrength: { value: 8.0 },
    u_colorGrid: { value: new THREE.Color(1.0, 1.0, 1.0) },
    u_pageIndex: { value: scrollIndex },
    u_joints: { value: joints }, // GPUに渡す関節配列
    u_prevFrame: { value: null }
  }), [joints]); // 初回のみ生成

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

    // 簡易的なLerpでマウス追従を滑らかにする
    targetMouse.x = THREE.MathUtils.lerp(targetMouse.x, currentMouse.x, 0.1)
    targetMouse.y = THREE.MathUtils.lerp(targetMouse.y, currentMouse.y, 0.1)
    materialRef.current.uniforms.u_mouse.value.copy(targetMouse)

    // --- Procedural Animation (IK) の計算 ---
    const dpr = window.devicePixelRatio;
    const speed = 30.0 * dpr; // マウスを追いかける基本スピード
    const segmentLength = 15.0 * dpr; // 節と節の間の長さ

    const head = joints[0];
    const dx = targetMouse.x - head.x;
    const dy = targetMouse.y - head.y;
    const distToMouse = Math.hypot(dx, dy);

    // 【1. 頭部の移動(車のステアリング的)】
    if (distToMouse > 1.0) { // マウスから少し離れている場合のみ動く
      const targetAngle = Math.atan2(dy, dx);
      // ±180度の範囲で最短ルートで回転させる
      let angleDiff = targetAngle - headAngle.current;
      angleDiff = ((angleDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
      
      // 徐々に目標角度へ向かわせる (旋回力)
      headAngle.current += angleDiff * 0.15;
    }

    // 向いている方向(headAngle)に沿って前進
    // 距離が近い時はスピードを落とす
    const actualSpeed = Math.min(speed, distToMouse * 0.1);
    head.x += Math.cos(headAngle.current) * actualSpeed;
    head.y += Math.sin(headAngle.current) * actualSpeed;

    // 【2. 後続の節の移動 (Forward IK)】
    for (let i = 1; i < joints.length; i++) {
        const prev = joints[i - 1];
        const cur = joints[i];
        
        const diffX = cur.x - prev.x;
        const diffY = cur.y - prev.y;
        const dist = Math.hypot(diffX, diffY);
        
        if (dist > 0) {
            // 前の節から `segmentLength` 離れた点に現在の節を引き寄せる
            cur.x = prev.x + (diffX / dist) * segmentLength;
            cur.y = prev.y + (diffY / dist) * segmentLength;
        }
    }

    // スクロール進行度(0..3)を補間してシェーダー遷移を滑らかにする
    pageIndex.current = THREE.MathUtils.lerp(pageIndex.current, scrollIndexRef.current, 0.08)
    materialRef.current.uniforms.u_pageIndex.value = pageIndex.current;

    // 前のフレームをシェーダーに渡す
    materialRef.current.uniforms.u_prevFrame.value = fbRead.current.texture;

    // FBOへレンダリング
    gl.setRenderTarget(fbTarget.current);
    gl.render(bufferScene, camera);
    gl.setRenderTarget(null);

    // バッファの入れ替え
    const temp = fbTarget.current;
    fbTarget.current = fbRead.current;
    fbRead.current = temp;

    // メイン画面出力用のテクスチャを更新
    if (displayMaterialRef.current) {
        displayMaterialRef.current.map = fbRead.current.texture;
    }
  })

  return (
    <>
      {createPortal(
        <mesh>
          {/* PlaneGeometryのサイズをウィンドウのサイズに追従させる */}
          {/* Orthographicカメラの視野角と合わせて、ピクセルパーフェクトな2D描画を実現する */}
          <planeGeometry args={[size.width, size.height]} />
          {/* GLSLシェーダーマテリアル */}
          <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
          />
        </mesh>,
        bufferScene
      )}

      {/* 画面に描画して反映する用 */}
      <mesh>
        <planeGeometry args={[size.width, size.height]} />
        <meshBasicMaterial ref={displayMaterialRef} map={fbRead.current.texture} />
      </mesh>
    </>
  )
}
