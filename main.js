// キャンバスと描画コンテキストの取得
const canvas = document.getElementById('shader-background');
const ctx = canvas.getContext('2d');

// キャンバスのサイズをウィンドウ画面いっぱいに合わせる
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // 初期化時に一度実行

// マウスの座標を保持するオブジェクト
const mouse = {
    x: undefined,
    y: undefined
};

// マウスが動いたときに座標を更新
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

// パーティクルの設計図（クラス）
class Particle {
    constructor() {
        this.x = mouse.x;
        this.y = mouse.y;
        this.size = Math.random() * 4 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        // だんだん小さくなる
        if (this.size > 0.1) this.size -= 0.1;
    }
    
    draw() {
        ctx.fillStyle = '#4da6ff'; // メインカラーの水色
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

const particleArray = [];

// アニメーションループ（毎フレーム実行される処理）
function animate() {
    // 完全にクリアするのではなく、半透明の黒で塗りつぶすことで
    // 軌跡が残像（アフターイメージ）のように尾を引く表現になります
    ctx.fillStyle = 'rgba(43, 43, 43, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // マウスが動いていればパーティクルを生成
    if (mouse.x !== undefined) {
        particleArray.push(new Particle());
    }

    // すべてのパーティクルを更新・描画
    for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
        particleArray[i].draw();
        
        // 小さくなったパーティクルは配列から削除
        if (particleArray[i].size <= 0.1) {
            particleArray.splice(i, 1);
            i--;
        }
    }
    
    // 次のフレームを要求
    requestAnimationFrame(animate);
}

// アニメーション開始
animate();