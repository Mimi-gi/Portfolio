type SkillItem = {
  icon: string
  iconSrc?: string
  iconAlt: string
  name: string
  summary: string
}

const SKILL_NAME_FONT_SIZE = '1.2rem'
const SKILL_SUMMARY_FONT_SIZE = '0.7rem'

const skills: SkillItem[] = [
  {
    icon: 'GM',
    // 例: '/images/icons/skills/game-dev.png'
    iconSrc: '/images/icons/Unity.png',
    iconAlt: 'Game Development icon',
    name: 'Unity',
    summary: 'ゲーム制作で使用',
  },
    {
    icon: 'GM',
    // 例: '/images/icons/skills/game-dev.png'
    iconSrc: '/images/icons/logo_csharp.png',
    iconAlt: 'C# icon',
    name: 'C#',
    summary: 'ゲーム制作で使用',
  },
    {
    icon: 'GM',
    // 例: '/images/icons/skills/game-dev.png'
    iconSrc: '/images/icons/Unity.png',
    iconAlt: 'Game Development icon',
    name: 'VFXGraph',
    summary: 'Unityのパーティクル表現で使用',
  },
    {
    icon: 'GM',
    // 例: '/images/icons/skills/game-dev.png'
    iconSrc: '/images/icons/Cysharp.png',
    iconAlt: 'R3 icon',
    name: 'R3',
    summary: 'イベント駆動の設計をする際に使用',
  },
  {
    icon: 'GM',
    // 例: '/images/icons/skills/game-dev.png'
    iconSrc: '/images/icons/Cysharp.png',
    iconAlt: 'Cysharp icon',
    name: 'UniTask',
    summary: '非同期のアニメーションなどで使用',
  },
  {
    icon: 'GM',
    // 例: '/images/icons/skills/game-dev.png'
    iconSrc: '/images/icons/Unity.png',
    iconAlt: 'Unity icon',
    name: 'LitMotion',
    summary: 'トゥイーンアニメーション制作に使用',
  },
  {
    icon: 'SH',
    // 例: '/images/icons/skills/shader.png'
    iconSrc: '/images/icons/Shader.png',
    iconAlt: 'Shaders icon',
    name: 'GLSL/HLSL',
    summary: 'Unityでのシェーダー制作やShaderToyで使用',
  },
  {
    icon: 'SH',
    // 例: '/images/icons/skills/shader.png'
    iconSrc: '/images/icons/PixelComposer.png',
    iconAlt: 'PixelComposer icon',
    name: 'PixelComposer',
    summary: 'ピクセルアニメーションやエフェクト制作で使用',
  },
]

export default function About() {
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
      <h2>About</h2>

      {/* 自己紹介ブロック（長文） */}
      <div style={{ marginTop: '0.8rem' }}>
        <h3>Introduction</h3>
        <p style={{ marginTop: '0.5rem' }}>
          Mimiと言います。情報系の大学生です。興味のある事をつまみ食いしながら生きています。
        </p>
        <p style={{ marginTop: '0.6rem' }}>
          高校の頃に遊んだ「Leap year」「洞窟物語」に感化され、大学に入ってゲーム制作を始めました。
          <br />
          好きなゲームジャンルとしては、アート的な観点では「インタラクティブなピクセルアートのゲーム」、ゲームデザイン的な観点では「知識ゲート」が好きです。
          <br />
          趣味は漫画、映画、アニメ鑑賞です。
        </p>
      </div>
      
      {/* Skillsカードグリッド */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Skills</h3>
        <div
          style={{
            marginTop: '0.9rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {skills.map((skill) => (
            <article
              key={skill.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.8rem 0.95rem',
                border: '1px solid rgba(220, 220, 220, 0.95)',
                borderRadius: '18px',
                background: 'rgba(255, 255, 255, 0.06)',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.75)',
                  color: '#111111',
                  fontWeight: 700,
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                {skill.iconSrc ? (
                  <img
                    src={skill.iconSrc}
                    alt={skill.iconAlt}
                    width={52}
                    height={52}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  skill.icon
                )}
              </div>
              <div>
                <p style={{ fontSize: SKILL_NAME_FONT_SIZE, lineHeight: 1.1 }}>{skill.name}</p>
                <p style={{ marginTop: '0.2rem', opacity: 0.9, fontSize: SKILL_SUMMARY_FONT_SIZE }}>
                  {skill.summary}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
