export default function Works2D() {
  return (
    <div>
      <h2>2D Works</h2>
      <p>普段制作しているドット絵作品のギャラリーです。画像をクリックすると拡大できます。</p>
      
      {/* サンプルのダミーグリッド */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
        {[1, 2, 3, 4].map(idx => (
          <div 
            key={idx} 
            style={{ 
              width: '200px', 
              height: '200px', 
              backgroundColor: '#1a2e20',
              border: '2px solid #4ade80',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <p>Pixel Art {idx}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
