/**
 * محرك اللعبة - الجزء الأول
 * يحتوي على تهيئة اللعبة، اللاعب، وحلقات الرسم
 */

const GameCore = {
    active: false, paused: false, lvl: 1, score: 0,
    player: { x: 0, y: 0, vx: 0, vy: 0, lives: 5, size: 40 }, // تم إضافة size للتحكم في الحجم
    fruits: [], bullets: [], particles: [],
    lastShotTime: 0,

    init(lvl) {
        this.lvl = lvl; this.active = true; this.paused = false; this.score = 0;
        this.player.lives = 5; this.fruits = []; this.bullets = []; this.particles = [];
        
        const cvs = document.getElementById('game');
        cvs.width = window.innerWidth; cvs.height = window.innerHeight;
        this.player.x = cvs.width / 2; this.player.y = cvs.height - 100;
        
        this.setupJoysticks();
        this.loop();
    },

    setupJoysticks() {
        // [هنا ضع منطق الـ Joysticks الأصلي الخاص بك]
    },

    update() {
        if(!this.active || this.paused) return;
        // [منطق الحركة الخاص بك]
        this.player.x += this.player.vx;
        this.player.x = Math.max(30, Math.min(window.innerWidth-30, this.player.x));
    },

    draw() {
        const cvs = document.getElementById('game'); 
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        
        // رسم اللاعب بالحجم المتغير
        ctx.font = `${this.player.size}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText("🥷", this.player.x, this.player.y);
    },

    loop() { 
        if(this.active) { this.update(); this.draw(); requestAnimationFrame(() => this.loop()); } 
    }
};

// وظيفة الضبط التي طلبتها للتحكم في الحجم
function updatePlayerSize(val) {
    GameCore.player.size = parseInt(val);
}
/**
 * محرك اللعبة - الجزء الثاني
 * يحتوي على منطق الأعداء، الرصاص، والتصادم
 */

Object.assign(GameCore, {
    spawnEnemy() {
        if(!this.active || this.paused) return;
        this.fruits.push({ x: Math.random() * window.innerWidth, y: -50, speed: 2 + this.lvl });
    },

    handleCollision() {
        this.bullets.forEach((b, bi) => {
            this.fruits.forEach((f, fi) => {
                if(Math.hypot(b.x - f.x, b.y - f.y) < 30) {
                    this.fruits.splice(fi, 1);
                    this.bullets.splice(bi, 1);
                    this.score += 10;
                }
            });
        });
    },

    gameOver() {
        this.active = false;
        alert("انتهت اللعبة! نتيجتك: " + this.score);
        // هنا يمكنك استدعاء دالة saveOnlineData
    }
});

// تفعيل توليد الأعداء دورياً
setInterval(() => GameCore.spawnEnemy(), 1000);
