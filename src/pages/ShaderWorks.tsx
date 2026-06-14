import ShaderPreviewCanvas from '../components/ShaderPreviewCanvas'

import eulerFluiedFrag from '../shaders/works/euler_Fluied.frag'
import pixelFlowFrag from '../shaders/works/pixelFlow.frag'

type ShaderWorkItem = {
  title: string
  fragmentShader: string
  description?: string
  sourceUrl?: string
}

const shaderWorks: ShaderWorkItem[] = [
  {
    title: 'Euler Fluid Burst',
    fragmentShader: eulerFluiedFrag,
    description: '圧力を色で可視化し、クリック地点からランダム発散を発生。',
  },
  {
    title: 'Pixel Flow',
    fragmentShader: pixelFlowFrag,
    description: 'ピクセルグリッド上で流れる帯を表現したシェーダー。',
  },
]

export default function ShaderWorks() {
  return (
    <div
      style={{
        width: '80%',
        maxWidth: '1940px',
        minHeight: '78vh',
        marginTop: '0.5rem',
        marginLeft: '1rem',
        padding: '0.8rem',
        background: 'rgba(57, 57, 136, 0.41)',
        border: '1px solid rgba(220, 220, 220, 0.9)',
      }}
    >
      {/* セクション見出し */}
      <h2>Shader Works</h2>

      {/* セクション説明文 */}
      <p></p>

      {/* 作品プレビュー領域 */}
      <div
        style={{
          marginTop: '1.4rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
        }}
      >
        {shaderWorks.map((work) => (
          <article
            key={work.title}
            style={{
              border: '1px solid rgba(220, 220, 220, 0.9)',
              borderRadius: '14px',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ width: '100%', aspectRatio: '16 / 9', background: 'rgba(0, 0, 0, 0.35)' }}>
              <ShaderPreviewCanvas fragmentShader={work.fragmentShader} />
            </div>

            <div style={{ padding: '0.7rem 0.8rem 0.85rem' }}>
              <p style={{ fontSize: '1rem', fontWeight: 700 }}>{work.title}</p>
              {work.description ? <p style={{ marginTop: '0.35rem', opacity: 0.9 }}>{work.description}</p> : null}
              {work.sourceUrl ? (
                <a
                  href={work.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    marginTop: '0.5rem',
                    display: 'inline-block',
                    color: '#dfe7ff',
                    textDecoration: 'underline',
                  }}
                >
                  View Source
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {/* 追加方法: 1) src/shaders/works に .frag を作成 2) import 3) shaderWorks に登録 */}
    </div>
  )
}
