import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import Home from './pages/Home'
import Works2D from './pages/Works2D'
import ShaderWorks from './pages/ShaderWorks'
import About from './pages/About'
import BackgroundShader from './components/BackgroundShader'

function AppContent() {
  const location = useLocation()

  return (
    <>
      {/* 常に背面で描画されるWebGL / シェーダー層 */}
      <div className="canvas-layer">
        <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
          <BackgroundShader pathname={location.pathname} />
        </Canvas>
      </div>

      {/* 前面のコンテンツ層（UIキャンバスのような役割） */}
      <div className="content-layer">
        <nav>
          <h1>My Portfolio</h1>
          <div className="links">
            <Link to="/">Top</Link>
            <Link to="/2d-works">2D Works</Link>
            <Link to="/shader-works">Shader Works</Link>
            <Link to="/about">About</Link>
          </div>
        </nav>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/2d-works" element={<Works2D />} />
            <Route path="/shader-works" element={<ShaderWorks />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
