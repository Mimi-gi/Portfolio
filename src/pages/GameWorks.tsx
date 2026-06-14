import { useState } from 'react'

type GameWorkItem = {
  title: string
  description: string
  media:
    | {
        kind: 'video'
        src: string
        poster?: string
      }
    | {
        kind: 'slides'
        images: string[]
      }
}

const gameWorks: GameWorkItem[] = [
  {
    title: 'Altile-Land',
    description: '個人制作中の3D倉庫番パズルゲーム。様々なタイルを駆使し、島を動かしてゴールを目指せ。',
    media: {
      kind: 'video',
      // 例: /public/images/games/intro.mp4
      src: '/images/GameWorks/Altile-Land.mp4',
    },
  },
    {
    title: 'Loop',
    description: '個人制作中の2D倉庫番パズルゲーム。"LOOP"を作り、障壁を突破せよ。',
    media: {
      kind: 'video',
      // 例: /public/images/games/intro.mp4
      src: '/images/GameWorks/Loop.mp4',
    },
  },
  /*{
    title: 'Sample Game Screens',
    description: 'こちらは動画の代わりにスクリーンショットをスライド表示する例です。',
    media: {
      kind: 'slides',
      // 例: /public/images/games/shot1.png
      images: ['/images/games/shot1.png', '/images/games/shot2.png', '/images/games/shot3.png'],
    },
  },*/
]

function SlideViewer({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0)

  if (images.length === 0) {
    return <p style={{ opacity: 0.85 }}>画像がありません。</p>
  }

  const prev = () => setIndex((current) => (current - 1 + images.length) % images.length)
  const next = () => setIndex((current) => (current + 1) % images.length)

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <img
        src={images[index]}
        alt={`${title} screenshot ${index + 1}`}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            style={{
              position: 'absolute',
              left: '0.6rem',
              top: '50%',
              transform: 'translateY(-50%)',
              border: '1px solid rgba(220, 220, 220, 0.85)',
              borderRadius: '999px',
              background: 'rgba(10, 10, 20, 0.55)',
              color: '#ffffff',
              width: '2rem',
              height: '2rem',
              cursor: 'pointer',
            }}
          >
            {'<'}
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            style={{
              position: 'absolute',
              right: '0.6rem',
              top: '50%',
              transform: 'translateY(-50%)',
              border: '1px solid rgba(220, 220, 220, 0.85)',
              borderRadius: '999px',
              background: 'rgba(10, 10, 20, 0.55)',
              color: '#ffffff',
              width: '2rem',
              height: '2rem',
              cursor: 'pointer',
            }}
          >
            {'>'}
          </button>

          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '0.55rem',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '0.35rem',
            }}
          >
            {images.map((_, dotIndex) => (
              <span
                key={dotIndex}
                style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '50%',
                  background: dotIndex === index ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                }}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default function GameWorks() {
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
      <h2>Feature Game Works</h2>

      <div
        style={{
          marginTop: '1.2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
        }}
      >
        {gameWorks.map((work) => (
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
              {work.media.kind === 'video' ? (
                <video
                  src={work.media.src}
                  poster={work.media.poster}
                  controls
                  preload="metadata"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <SlideViewer images={work.media.images} title={work.title} />
              )}
            </div>

            <div style={{ padding: '0.9rem 1rem 1rem' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{work.title}</p>
              <p style={{ marginTop: '0.8rem', fontSize: '1.05rem', opacity: 0.95 }}>{work.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
