// تسجيل الـ Service Worker (شرط أساسي لظهور زر التحميل)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log("SW Error", err));
}

const User = {
    name: '', phone: '', email: '', gold: 1000, pegy: 100,
    level: 1, lives: 5, currentSkin: '🥷', 
    ownedSkins: ['🥷', '👮'], upgrades: { speed: 1, density: 1 }
};

const Market = {
    skins: [
        {e:'🥷', p:0, c:'G'}, {e:'👮', p:0, c:'G'}, {e:'🦙', p:10, c:'P'},
        {e:'🗽', p:20, c:'P'}, {e:'✈️', p:30, c:'P'}, {e:'🦊', p:100, c:'P'},
        {e:'🐼', p:100, c:'P'}, {e:'🦂', p:1000, c:'G'}, {e:'🦞', p:2000, c:'G'},
        {e:'🤹‍♀️', p:3000, c:'G'}
    ],
    updateUI() {
        document.getElementById('m-gold').innerText = User.gold;
        document.getElementById('m-pegy').innerText = User.pegy;
        document.getElementById('h-gold').innerText = User.gold;
        document.getElementById('h-pegy').innerText = User.pegy;
        document.getElementById('h-lives').innerText = User.lives;
        
        const grid = document.getElementById('skin-grid');
        if (grid) {
            grid.innerHTML = '';
            this.skins.forEach(s => {
                const owned = User.ownedSkins.includes(s.e);
                const div = document.createElement('div');
                div.className = `shop-item ${User.currentSkin === s.e ? 'selected' : ''}`;
                div.innerHTML = `<span>${s.e}</span><br><small>${owned ? 'تملك' : s.p+(s.c==='G'?'🪙':'💷')}</small>`;
                div.onclick = () => {
                    if(owned) User.currentSkin = s.e;
                    else if(User[s.c==='G'?'gold':'pegy'] >= s.p) {
                        User[s.c==='G'?'gold':'pegy'] -= s.p;
                        User.ownedSkins.push(s.e); User.currentSkin = s.e;
                    }
                    this.updateUI();
                };
                grid.appendChild(div);
            });
        }
    },
    exchange(type) {
        if(type==='GtoP' && User.gold >= 10000) { User.gold-=10000; User.pegy+=10; }
        else if(type==='PtoG' && User.pegy >= 10) { User.pegy-=10; User.gold+=10000; }
        this.updateUI();
    },
    buyUpgrade(type, cost) {
        if(User.pegy >= cost) { User.pegy -= cost; User.upgrades[type] += 0.5; this.updateUI(); alert('تم الترقية!'); }
    }
};

const GameEngine = {
    canvas: document.getElementById('g'), ctx: null,
    active: false, monsters: [], projectiles: [], drops: [],
    pX: 0, pY: 0, tX: 0, tY: 0, lastShot: 0, sessionGold: 0, portal: null,
    timerInterval: null, timeLeft: 100,

    start(online) {
        User.name = document.getElementById('u-name').value || "Operator";
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('s-market').classList.remove('hidden');
        Market.updateUI();
    },

    initLevel() {
        document.getElementById('s-market').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight;
        this.pX = this.tX = this.canvas.width/2; this.pY = this.tY = this.canvas.height/2;
        this.active = true;
        if (User.level === 1) this.startCountdown();
        this.loop();
    },

    startCountdown() {
        this.timeLeft = 100;
        const timerEl = document.getElementById('timer-val');
        this.timerInterval = setInterval(() => {
            if (!this.active) return;
            this.timeLeft--;
            let displaySec = Math.ceil(this.timeLeft / 20);
            timerEl.innerText = `00:${displaySec.toString().padStart(2, '0')}`;
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.nextLevel(); 
            }
        }, 50); // ينتهي في 5 ثوانٍ
    },

    playSound(freq, dur, type = 'sine') {
        try {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const o = ac.createOscillator(); const g = ac.createGain();
            o.type = type; o.frequency.value = freq; g.gain.value = 0.15;
            o.connect(g); g.connect(ac.destination);
            o.start(); o.stop(ac.currentTime + dur);
        } catch(e) {}
    },

    nextLevel() {
        this.active = false;
        clearInterval(this.timerInterval);
        User.level++;
        if (User.level === 2) {
            document.getElementById('status-box').innerHTML = `<span class="floating-icon">🎖️</span><span class="stat-value">${User.name}</span>`;
        }
        document.body.style.backgroundColor = `hsl(${Math.random()*360}, 30%, 15%)`;
        this.sessionGold = 0; this.portal = null; this.monsters = [];
        document.getElementById('level-num').innerText = User.level;
        this.active = true;
        this.playSound(800, 0.2, 'square');
    },

    loop() {
        if(!this.active) return;
        const ctx = this.ctx;
        ctx.fillStyle = "rgba(60, 60, 60, 0.4)"; // خلفية فاتحة
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.pX += (this.tX - this.pX) * 0.12;
        this.pY += (this.tY - this.pY) * 0.12;
        ctx.font = "40px Arial"; ctx.textAlign = "center";
        ctx.fillText(User.currentSkin, this.pX, this.pY + 15);

        if(User.level >= 2) {
            let rate = 500 / User.upgrades.speed;
            if(Date.now() - this.lastShot > rate) {
                let density = Math.floor(User.upgrades.density);
                for(let i=0; i < density; i++) {
                    let offset = i * 8;
                    this.projectiles.push(
                        {x: this.pX + 25, y: this.pY - offset, vx: 12 * (1 + (User.level*0.01))},
                        {x: this.pX - 25, y: this.pY - offset, vx: -12 * (1 - (User.level*0.01))}
                    );
                }
                this.lastShot = Date.now();
                this.playSound(400, 0.03);
            }
        }

        if(this.monsters.length < 12 + User.level && Math.random() < 0.06) {
            let ang = Math.random() * Math.PI * 2;
            let dist = Math.max(this.canvas.width, this.canvas.height);
            this.monsters.push({
                x: this.pX + Math.cos(ang) * dist,
                y: this.pY + Math.sin(ang) * dist,
                s: (User.level === 1 ? 2.5 : 2.5 * (1 + (User.level-1) * 0.001))
            });
        }

        // الانفجار السريع
        if(User.level === 1 && this.monsters.length > 3) {
            let first = this.monsters[0];
            let cluster = this.monsters.filter(m => Math.hypot(m.x - first.x, m.y - first.y) < 100);
            if(cluster.length > 3) {
                this.monsters = this.monsters.filter(m => !cluster.includes(m));
                this.sessionGold += 1500;
                ctx.fillStyle = "white"; ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
                this.playSound(100, 0.4, 'square');
                this.playSound(60, 0.5, 'sawtooth');
                Market.updateUI();
            }
        }

        this.monsters.forEach((m, i) => {
            let ang = Math.atan2(this.pY - m.y, this.pX - m.x);
            m.x += Math.cos(ang) * m.s; m.y += Math.sin(ang) * m.s;
            ctx.fillText("👾", m.x, m.y);
            if(Math.hypot(this.pX - m.x, this.pY - m.y) < 35) {
                User.lives--; this.monsters.splice(i, 1);
                this.playSound(200, 0.1, 'triangle');
                Market.updateUI();
                if(User.lives <= 0) location.reload();
            }
        });

        // البوابة
        if(User.level >= 2 && this.sessionGold >= 10000 && !this.portal) {
            this.portal = {x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height};
        }
        if(this.portal) {
            ctx.fillText("🌀", this.portal.x, this.portal.y);
            if(Math.hypot(this.pX - this.portal.x, this.pY - this.portal.y) < 50) this.nextLevel();
        }

        this.projectiles.forEach((p, pi) => {
            p.x += p.vx; ctx.font = "20px Arial"; ctx.fillText("⚡", p.x, p.y);
            this.monsters.forEach((m, mi) => {
                if(Math.hypot(p.x - m.x, p.y - m.y) < 30) {
                    this.drops.push({x: m.x, y: m.y});
                    this.monsters.splice(mi, 1); this.projectiles.splice(pi, 1);
                }
            });
            if(p.x < 0 || p.x > this.canvas.width) this.projectiles.splice(pi, 1);
        });

        // المغناطيس الخارق
        this.drops.forEach((d, di) => {
            let dist = Math.hypot(this.pX - d.x, this.pY - d.y);
            if (dist < 600) { 
                let ang = Math.atan2(this.pY - d.y, this.pX - d.x);
                d.x += Math.cos(ang) * 15; d.y += Math.sin(ang) * 15;
            }
            ctx.fillText("🪙", d.x, d.y);
            if(dist < 45) {
                User.gold += 200; this.sessionGold += 200;
                this.drops.splice(di, 1); this.playSound(1200, 0.05);
                Market.updateUI();
            }
        });
        requestAnimationFrame(() => this.loop());
    }
};

// منطق زر التحميل (PWA)
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if(installBtn) installBtn.style.display = 'block';
});

if(installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            installBtn.style.display = 'none';
        }
    });
}

window.addEventListener('mousemove', e => { GameEngine.tX = e.clientX; GameEngine.tY = e.clientY; });
window.addEventListener('touchmove', e => { 
    e.preventDefault();
    GameEngine.tX = e.touches[0].clientX; GameEngine.tY = e.touches[0].clientY; 
}, {passive: false});
