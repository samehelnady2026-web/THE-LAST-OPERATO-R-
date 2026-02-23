// --- إعدادات Supabase الخاصة بك ---
const SUPABASE_URL = 'https://ctnuuvdakmqpbuzhrsos.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1FObDLbOBvb3CBqfCOOQkw_2p6v1ObQ';

let supabase = null;
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
} catch (e) { 
    console.error("خطأ في الاتصال بـ Supabase:", e); 
}

// تسجيل الـ Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(e => {});
}

const User = {
    name: '', phone: '', gold: 1000, pegy: 100, level: 1, lives: 5, 
    currentSkin: '🥷', ownedSkins: ['🥷'], isOnline: false 
};

const Market = {
    skins: [
        {e:'🥷', p:0, c:'G'}, 
        {e:'👮', p:500, c:'G'}, 
        {e:'🦊', p:10, c:'P'}, 
        {e:'🦂', p:1000, c:'G'}
    ],
    updateUI() {
        document.getElementById('m-gold').innerText = User.gold;
        document.getElementById('m-pegy').innerText = User.pegy;
        document.getElementById('h-gold').innerText = User.gold;
        document.getElementById('h-lives').innerText = User.lives;
        const grid = document.getElementById('skin-grid');
        if (grid) {
            grid.innerHTML = '';
            this.skins.forEach(s => {
                const owned = User.ownedSkins.includes(s.e);
                const div = document.createElement('div');
                div.className = `shop-item ${User.currentSkin === s.e ? 'selected' : ''}`;
                div.innerHTML = `<span>${s.e}</span><br><small>${owned ? 'تملك' : s.p + (s.c === 'G' ? '🪙' : '💷')}</small>`;
                div.onclick = () => {
                    if (owned) User.currentSkin = s.e;
                    else if (User[s.c === 'G' ? 'gold' : 'pegy'] >= s.p) {
                        User[s.c === 'G' ? 'gold' : 'pegy'] -= s.p;
                        User.ownedSkins.push(s.e); User.currentSkin = s.e;
                    }
                    this.updateUI();
                };
                grid.appendChild(div);
            });
        }
    },
    exchange(t) { 
        if (t === 'GtoP' && User.gold >= 10000) { 
            User.gold -= 10000; User.pegy += 10; this.updateUI(); 
        } 
    }
};

const GameEngine = {
    canvas: document.getElementById('g'), ctx: null, active: false,
    monsters: [], bullets: [], pX: 0, pY: 0, tX: 0, tY: 0, timeLeft: 100,

    async start(online) {
        const nameInput = document.getElementById('u-name').value;
        const phoneInput = document.getElementById('u-phone').value;
        User.isOnline = online;

        if (online) {
            if (!nameInput || !phoneInput) return alert("يرجى إدخال البيانات للتفعيل أونلاين ⚠️");
            alert("جاري التحقق والتفعيل أونلاين... 🛡️");
            if (supabase) {
                const { error } = await supabase.from('players').upsert([
                    { name: nameInput, phone: phoneInput, gold: User.gold }
                ]);
                if (error) console.log("خطأ في قاعدة البيانات:", error);
            }
            alert("تم التفعيل والارتباط بالسيرفر بنجاح! ✅");
        }
        User.name = nameInput || "Guest";
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('s-market').classList.remove('hidden');
        Market.updateUI();
    },

    initLevel() {
        document.getElementById('s-market').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight;
        this.pX = this.canvas.width / 2; this.pY = this.canvas.height / 2;
        this.active = true;
        
        // العداد يظهر في المستوى الأول فقط
        if (User.level === 1) {
            this.startCountdown();
            document.getElementById('timer-val').parentElement.style.display = 'block';
        } else {
            document.getElementById('timer-val').parentElement.style.display = 'none';
        }
        this.loop();
    },

    startCountdown() {
        this.timeLeft = 100;
        const iv = setInterval(() => {
            if (!this.active || User.level > 1) { clearInterval(iv); return; }
            this.timeLeft--;
            const timerVal = document.getElementById('timer-val');
            if (timerVal) timerVal.innerText = `00:${Math.ceil(this.timeLeft / 20).toString().padStart(2, '0')}`;
            if (this.timeLeft <= 0) { 
                clearInterval(iv); 
                this.nextLevel(); 
            }
        }, 50);
    },

    nextLevel() {
        User.level++;
        const lvlNum = document.getElementById('level-num');
        if (lvlNum) lvlNum.innerText = User.level;
        this.active = false;
        alert("أحسنت! انتقال للمستوى " + User.level);
        this.monsters = [];
        this.bullets = [];
        this.active = true;
        // إخفاء العداد عند الانتقال لليفل 2
        document.getElementById('timer-val').parentElement.style.display = 'none';
    },

    shoot() {
        // إطلاق رصاصة باتجاه الهدف
        const angle = Math.atan2(this.tY - this.pY, this.tX - this.pX);
        this.bullets.push({
            x: this.pX, y: this.pY,
            vx: Math.cos(angle) * 10,
            vy: Math.sin(angle) * 10
        });
        this.playSound(600, 0.05, 'square');
    },

    playSound(f, d, t = 'sine') {
        try {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const o = ac.createOscillator(); const g = ac.createGain();
            o.type = t; o.frequency.value = f; g.gain.value = 0.1;
            o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d);
        } catch (e) {}
    },

    loop() {
        if (!this.active) return;
        this.ctx.fillStyle = "rgba(60, 60, 60, 0.4)"; 
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // حركة اللاعب
        this.pX += (this.tX - this.pX) * 0.12; 
        this.pY += (this.tY - this.pY) * 0.12;
        
        // عرض الاسم في ليفل 1، ورقم المستوى في ليفل 2 وما بعده
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Tajawal, Arial";
        let label = (User.level === 1) ? User.name : "Lv. " + User.level;
        this.ctx.fillText(label, this.pX, this.pY - 40);

        this.ctx.font = "40px Arial"; 
        this.ctx.textAlign = "center";
        this.ctx.fillText(User.currentSkin, this.pX, this.pY + 15);

        // --- نظام الرصاص (يبدأ من المستوى 2) ---
        if (User.level >= 2) {
            if (Math.random() < 0.1) this.shoot(); // إطلاق تلقائي
            
            this.bullets.forEach((b, bi) => {
                b.x += b.vx; b.y += b.vy;
                this.ctx.fillText("⭐", b.x, b.y);
                
                // تصادم الرصاص مع الوحوش
                this.monsters.forEach((m, mi) => {
                    if (Math.hypot(b.x - m.x, b.y - m.y) < 30) {
                        this.monsters.splice(mi, 1);
                        this.bullets.splice(bi, 1);
                        User.gold += 20; Market.updateUI();
                    }
                });
            });
        }

        // إنشاء الوحوش
        if (Math.random() < 0.06) {
            this.monsters.push({
                x: Math.random() * this.canvas.width, 
                y: -50, 
                s: 2.5 + (User.level * 0.2) 
            });
        }

        // حركة الوحوش
        this.monsters.forEach((m, i) => {
            let ang = Math.atan2(this.pY - m.y, this.pX - m.x);
            m.x += Math.cos(ang) * m.s; 
            m.y += Math.sin(ang) * m.s;
            this.ctx.fillText("👾", m.x, m.y);
            
            if (Math.hypot(this.pX - m.x, this.pY - m.y) < 35) {
                User.lives--; 
                this.monsters.splice(i, 1); 
                Market.updateUI();
                this.playSound(200, 0.1, 'triangle');
                if (User.lives <= 0) { alert("Game Over! 💀"); location.reload(); }
            }
        });

        requestAnimationFrame(() => this.loop());
    }
};

// التحكم
window.addEventListener('mousemove', e => { GameEngine.tX = e.clientX; GameEngine.tY = e.clientY; });
window.addEventListener('touchmove', e => { 
    e.preventDefault();
    GameEngine.tX = e.touches[0].clientX; GameEngine.tY = e.touches[0].clientY; 
}, { passive: false });
