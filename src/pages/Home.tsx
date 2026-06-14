type HomeSettings = {
  container: {
    width: string
    maxWidth: string
    minHeight: string
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
  links: Array<{
    label: string
    iconSrc: string
    href: string
  }>
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
    minHeight: '70vh',
    marginTop: '0.5rem',
    marginLeft: '1rem',
    gap: '0.9rem',
  },
  colors: {
    cardBackground: 'rgba(57, 57, 136, 0.41)',
    primaryText: '#dddeff',
    secondaryText: '#cbcdef',
    introText: '#dddeff',
    iconBorder: '#dcdcdc',
  },
  text: {
    name: 'Mimi',
    handle: '東京科学大学　情報理工学院　数理計算科学系　B2\n東京科学大学デジタル創作同好会 traP',
    intro: 'ゲーム制作を中心に色々やっています。ピクセルアートとシェーダーを組み合わせたインタラクティブな表現が好き。', 
  },
  links: [
    {
      label: 'X',
      iconSrc: 'https://www.google.com/s2/favicons?domain=x.com&sz=64',
      href: 'https://x.com/Min_minda_ha',
    },
    {
      label: 'unityroom',
      iconSrc: 'https://www.google.com/s2/favicons?domain=unityroom.com&sz=64',
      href: 'https://unityroom.com/users/i7zd98o0gubs3pq6rayc',
    },
    {
      label: 'shaderToy',
      iconSrc: 'https://www.google.com/s2/favicons?domain=shadertoy.com&sz=64',
      href: 'https://www.shadertoy.com/user/Mimi',
    },
  ],
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
        minHeight: settings.container.minHeight,
        marginTop: settings.container.marginTop,
        marginLeft: settings.container.marginLeft,
        padding: '0.8rem',
        background: settings.colors.cardBackground,
        border: `1px solid ${settings.colors.iconBorder}`,
      }}
    >
      {/* アイコン + 名前/所属のヒーロー行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: settings.container.gap }}>
        {/* プロフィールアイコン枠 */}
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
          {/* 画像があれば表示、なければプレースホルダー表示 */}
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

        {/* 名前と所属情報 */}
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

      {/* 自己紹介テキスト */}
      <p
        style={{
          marginTop: '0.7rem',
          fontSize: settings.fontSizes.intro,
          color: settings.colors.introText,
        }}
      >
        {settings.text.intro}
      </p>

      {/* 各種リンクボタン */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginTop: '1.0rem',
        }}
      >
        {settings.links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              minWidth: '160px',
              padding: '0.4rem 0.8rem',
              borderRadius: '999px',
              border: `1px solid ${settings.colors.iconBorder}`,
              background: 'rgba(255, 255, 255, 0.18)',
              color: settings.colors.primaryText,
              fontSize: '0.85rem',
              lineHeight: 1,
              textDecoration: 'none',
            }}
          >
            <img
              src={link.iconSrc}
              alt=""
              width={20}
              height={20}
              style={{
                borderRadius: '4px',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
            <span>{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
