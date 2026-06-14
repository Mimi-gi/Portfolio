type HomeSettings = {
  container: {
    width: string
    maxWidth: string
    marginTop: string
    marginLeft: string
    gap: string
  }
  colors: {
    cardBackground: string
    primaryText: string
    secondaryText: string
    introText: string
    iconBorder: string
  }
  text: {
    name: string
    handle: string
    intro: string
  }
  fontSizes: {
    name: string
    handle: string
    intro: string
    iconLabel: string
  }
  icon: {
    src?: string
    alt: string
    width: string
    height: string
    borderRadius: string
    fit: 'cover' | 'contain'
  }
}

const settings: HomeSettings = {
  container: {
    width: '80%',
    maxWidth: '1940px',
    marginTop: '2rem',
    marginLeft: '1rem',
    gap: '0.9rem',
  },
  colors: {
    cardBackground: 'rgba(188, 255, 161, 0.41)',
    primaryText: '#ffffff',
    secondaryText: '#d8d8d8',
    introText: '#efefef',
    iconBorder: '#dcdcdc',
  },
  text: {
    name: 'Mimi',
    handle: '東京科学大学　情報理工学院　数理計算科学系　B2\n東京科学大学デジタル創作同好会 traP',
    intro: 'ゲーム制作を中心に色々やっています。ピクセルアートとシェーダーを組み合わせたインタラクティブな表現が好き。', 
  },
  fontSizes: {
    name: '3rem',
    handle: '1rem',
    intro: '1.2rem',
    iconLabel: '0.75rem',
  },
  icon: {
    // 例: '/images/icon.png'
    src: '/images/icons/XBack.png',
    alt: 'プロフィールアイコン',
    width: '256px',
    height: '256px',
    borderRadius: '4px',
    fit: 'cover',
  },
}

export default function Home() {
  return (
    <div
      style={{
        width: settings.container.width,
        maxWidth: settings.container.maxWidth,
        marginTop: settings.container.marginTop,
        marginLeft: settings.container.marginLeft,
        padding: '0.8rem',
        background: settings.colors.cardBackground,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: settings.container.gap }}>
        <div
          style={{
            width: settings.icon.width,
            height: settings.icon.height,
            borderRadius: settings.icon.borderRadius,
            border: `1px solid ${settings.colors.iconBorder}`,
            overflow: 'hidden',
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          {settings.icon.src ? (
            <img
              src={settings.icon.src}
              alt={settings.icon.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: settings.icon.fit,
              }}
            />
          ) : (
            <span
              style={{
                color: settings.colors.primaryText,
                fontSize: settings.fontSizes.iconLabel,
                textAlign: 'center',
                lineHeight: 1.2,
                whiteSpace: 'pre-line',
              }}
            >
              {'アイコン\n画像(png)'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2
            style={{
              margin: 0,
              fontSize: settings.fontSizes.name,
              color: settings.colors.primaryText,
              textShadow: 'none',
              lineHeight: 1.1,
            }}
          >
            {settings.text.name}
          </h2>
          <p
            style={{
              margin: '0.15rem 0 0 0',
              fontSize: settings.fontSizes.handle,
              color: settings.colors.secondaryText,
              whiteSpace: 'pre-line',
            }}
          >
            {settings.text.handle}
          </p>
        </div>
      </div>

      <p
        style={{
          marginTop: '0.7rem',
          fontSize: settings.fontSizes.intro,
          color: settings.colors.introText,
        }}
      >
        {settings.text.intro}
      </p>
    </div>
  )
}
