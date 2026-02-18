const client = new Appwrite.Client().setEndpoint('https://fra.cloud.appwrite.io/v1').setProject('69943f560019334ae3b5');
const databases = new Appwrite.Databases(client);
const DB_ID = '69943bf8001373c3c286', COL_ID = 'players';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;

let game = { active: false, level: 1 };
let p1 = { x: 200, y: 300, tx: 200, ty: 300, score: 0, cash: 0 };
let currentProgress = 0; // التقدم للوصول للـ 10000
let portal = { x: 100, y: 100, vx: 2, vy: 2, active: false };
let boostVortex = { x: 0, y: 0, active: false };

function startMode() {
    game.active = true;
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('ui-header').style.display = 'block';
    animate();
}

function animate() {
    if(!game.active) return;
    ctx.clearRect(0,0,canvas.width, canvas.height);

    // تحديث شريط المستوى
    document.getElementById('level-bar').style.width = (currentProgress/10000)*100 + "%";
    document.getElementById('level-ui').innerText = game.level;

    // 1. الدوامة الخضراء (تزود 3000)
    if(Math.random() < 0.001 && !boostVortex.active) {
        boostVortex = { x: Math.random()*canvas.width, y: Math.random()*canvas.height, active: true };
    }
    if(boostVortex.active) {
        ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 3; ctx.beginPath();
        ctx.arc(boostVortex.x, boostVortex.y, 20, 0, Math.PI*2); ctx.stroke();
        if(Math.hypot(p1.x - boostVortex.x, p1.y - boostVortex.y) < 30) {
            currentProgress += 3000; boostVortex.active = false;
        }
    }

    // 2. البوابة الزرقاء المتحركة (تظهر عند 10000)
    if(currentProgress >= 10000) {
        portal.active = true;
        portal.x += portal.vx; portal.y += portal.vy;
        if(portal.x<0 || portal.x>canvas.width) portal.vx *= -1;
        if(portal.y<0 || portal.y>canvas.height) portal.vy *= -1;
        ctx.strokeStyle = '#00f2ff'; ctx.lineWidth = 5; ctx.beginPath();
        ctx.arc(portal.x, portal.y, 40, 0, Math.PI*2); ctx.stroke();
        if(Math.hypot(p1.x - portal.x, p1.y - portal.y) < 40) {
            game.level++; currentProgress = 0; portal.active = false;
        }
    }

    // حركة اللاعب
    p1.x += (p1.tx - p1.x) * 0.1; p1.y += (p1.ty - p1.y) * 0.1;
    ctx.font = "30px Arial"; ctx.fillText("🥷", p1.x, p1.y);

    requestAnimationFrame(animate);
}

canvas.addEventListener('touchmove', e => { p1.tx = e.touches[0].clientX; p1.ty = e.touches[0].clientY; });
