export default function Home() {
  return (
    <div>
      <h2>Home</h2>
      <p>こんにちは、[あなたの名前]です。</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h3>Skills</h3>
        <ul>
          <li>Game Development (Unity, C#)</li>
          <li>Shaders (GLSL, HLSL)</li>
          <li>Pixel Art</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Career / About</h3>
        <p>ゲーム開発の経験を活かし、ドット絵とインタラクティブな表現を組み合わせた作品を作っています。</p>
      </div>
    </div>
  )
}
