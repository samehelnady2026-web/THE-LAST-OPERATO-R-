/**
 * الملف الرئيسي (Main Controller)
 * يقوم بربط كافة الملفات وبدء التشغيل
 */

// التأكد من تحميل كافة الملفات قبل البدء
window.addEventListener('load', () => {
    console.log(CONFIG.GAME_NAME + " Initializing...");
    
    // إخفاء شاشة اللعبة في البداية وإظهار شاشة الدخول
    document.getElementById('authScreen').classList.remove('hidden');
});

// إدارة تسجيل الدخول
async function handleAuth(type) {
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPass').value;
    
    if(!email || !pass) return alert("يرجى إدخال البيانات");

    const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email, 
        password: pass 
    });

    if(error) return alert("خطأ في تسجيل الدخول: " + error.message);
    
    console.log("Logged in as:", data.user.email);
    startGame();
}

function loginAsGuest() {
    console.log("Guest mode activated");
    startGame();
}

function startGame() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    GameCore.init(1); // استدعاء المحرك من ملف game-engine.js
}
