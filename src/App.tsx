import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import Home from './pages/Home'
import Works2D from './pages/Works2D'
import ShaderWorks from './pages/ShaderWorks'
import BackgroundShader from './components/BackgroundShader'

function App() {
  return (
    <BrowserRouter>
      {/* 常に背面で描画されるWebGL / シェーダー層（SceneManagerのような役割のルート） */}
      <div className="canvas-layer">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <BackgroundShader />
        </Canvas>
      </div>

      {/* 前面のコンテンツ層（UIキャンバスのような役割） */}
      <div className="content-layer">
        <nav>
          <h1>My Portfolio</h1>
          <div className="links">
            <Link to="/">Home</Link>
            <Link to="/2d-works">2D Works</Link>
            <Link to="/shader-works">Shader Works</Link>
          </div>
        </nav>

        {/* ページ（シーン）の中身がここで切り替わる */}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/2d-works" element={<Works2D />} />
            <Route path="/shader-works" element={<ShaderWorks />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
