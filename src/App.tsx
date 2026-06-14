import { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Home from './pages/Home'
import Works2D from './pages/Works2D'
import ShaderWorks from './pages/ShaderWorks'
import About from './pages/About'
import BackgroundShader from './components/BackgroundShader'

type Section = {
  id: string
  label: string
  render: JSX.Element
}

// 1ページ分のスクロール(0.0〜1.0)を「補間なし」と「補間あり」に分割する
// 例: 0.5 なら前半50%は固定、後半50%で次ページへ補間
const HOLD_ZONE_RATIO = 0.8

function mapScrollToTransitionIndex(rawIndex: number, maxIndex: number) {
  const clamped = Math.min(Math.max(rawIndex, 0), maxIndex)

  if (clamped >= maxIndex) return maxIndex

  const basePage = Math.floor(clamped)
  const local = clamped - basePage

  if (local <= HOLD_ZONE_RATIO) {
    return basePage
  }

  const blendRange = Math.max(1 - HOLD_ZONE_RATIO, Number.EPSILON)
  const blendT = (local - HOLD_ZONE_RATIO) / blendRange
  return Math.min(basePage + blendT, maxIndex)
}

function App() {
  const sections: Section[] = useMemo(
    () => [
      { id: 'home', label: 'Top', render: <Home /> },
      { id: 'about', label: 'About', render: <About /> },
      { id: 'works2d', label: '2D Works', render: <Works2D /> },
      { id: 'shaderworks', label: 'Shader Works', render: <ShaderWorks /> },
    ],
    [],
  )

  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null)
  const [scrollIndex, setScrollIndex] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const container = scrollContainer
    if (!container) return

    const updateScrollState = () => {
      const viewHeight = Math.max(container.clientHeight, 1)
      const maxIndex = sections.length - 1
      const rawIndex = container.scrollTop / viewHeight
      const transitionIndex = mapScrollToTransitionIndex(rawIndex, maxIndex)

      setScrollIndex(transitionIndex)
      setActiveIndex(Math.min(Math.round(transitionIndex), maxIndex))
    }

    updateScrollState()
    container.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    return () => {
      container.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [scrollContainer, sections.length])

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* 常に背面で描画されるWebGL / シェーダー層 */}
      <div className="canvas-layer">
        <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
          <BackgroundShader scrollIndex={scrollIndex} />
        </Canvas>
      </div>

      {/* 前面のコンテンツ層（UIキャンバスのような役割） */}
      <div className="content-layer" ref={setScrollContainer}>
        <nav>
          <h1>My Portfolio</h1>
          <div className="links">
            {sections.map((section, index) => (
              <button
                key={section.id}
                type="button"
                className={index === activeIndex ? 'active' : ''}
                onClick={() => scrollToSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="page-content">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="page-section">
              {section.render}
            </section>
          ))}
        </div>
      </div>
    </>
  )
}

export default App
