export default function ShaderWorks() {
  return (
    <div>
      <h2>Shader Works</h2>
      <p>WebGL / GLSL を用いたインタラクティブなシェーダーアートの展示です。</p>

      {/* サンプルのダミーグリッド */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
        <div 
          style={{ 
            width: '400px', 
            height: '300px', 
            backgroundColor: '#1a2e20',
            border: '2px solid #4ade80',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <p>Interactive Canvas 1</p>
        </div>
      </div>
    </div>
  )
}
