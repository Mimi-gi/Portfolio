type WorkItem = {
  title: string
  src: string
  type: 'image' | 'video'
  description?: string
}

const works: WorkItem[] = [
  // ここに作品を追加してください（/public 配下のパスを指定）
  // { title: 'Pixel Scene', src: '/images/works/pixel-scene.png', type: 'image' },
  // { title: 'Character Loop', src: '/images/works/character.gif', type: 'image' },
  // { title: 'Battle Demo', src: '/images/works/battle-demo.mp4', type: 'video' },
  { title: 'WaterFall', src: '/images/2DWorks/WaterFall.mp4', type: 'video' },
  { title: '物干し竿ドラゴン', src: '/images/2DWorks/MonohoshiDragon.png', type: 'image' },
  { title: 'Plant', src: '/images/2DWorks/plant.gif', type: 'image' },
  { title: 'Beam', src: '/images/2DWorks/Beam.gif', type: 'image' },
]

export default function Works2D() {
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
      <h2>Feature 2D Works</h2>

      {/* セクション説明文 */}
      <p></p>

      {works.length === 0 ? (
        <p style={{ marginTop: '1rem', opacity: 0.9 }}>
          まだ作品がありません。`src/pages/Works2D.tsx` の `works` 配列に追加すると表示されます。
        </p>
      ) : (
        <div
          style={{
            marginTop: '1.4rem',
            display: 'grid',
            // 縦2行を基本にし、作品数が増えたら横に伸びる
            gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
            gridAutoFlow: 'column',
            gridAutoColumns: 'minmax(280px, 1fr)',
            gap: '1rem',
            overflowX: 'auto',
            paddingBottom: '0.35rem',
          }}
        >
          {works.map((work) => (
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
                {work.type === 'image' ? (
                  <img
                    src={work.src}
                    alt={work.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                ) : (
                  <video
                    src={work.src}
                    controls
                    preload="metadata"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                )}
              </div>

              <div style={{ padding: '0.7rem 0.8rem 0.85rem' }}>
                <p style={{ fontSize: '1rem', fontWeight: 700 }}>{work.title}</p>
                {work.description ? (
                  <p style={{ marginTop: '0.35rem', opacity: 0.9 }}>{work.description}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
