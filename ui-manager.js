/**
 * مدير الواجهات (UI Manager)
 * يتحكم في السوق، الإعدادات، وأزرار التحكم
 */

const UIManager = {
    toggleMarket(show) {
        const market = document.getElementById('marketModal'); // تأكد أن المودال موجود في HTML
        if(market) market.style.display = show ? 'flex' : 'none';
        console.log("Market status:", show ? "Opened" : "Closed");
    },

    toggleSettings(show) {
        const settings = document.getElementById('settingsModal');
        if(settings) settings.style.display = show ? 'flex' : 'none';
    },

    updateHUD(score, coins) {
        // تحديث الرصيد والنتائج على الشاشة
        const hud = document.getElementById('hud');
        // أضف هنا منطق تحديث نصوص الـ HUD
    }
};

// وظائف التحكم في أحجام العناصر (تم ربطها بـ GameCore)
function updateJoySize(val) {
    document.querySelectorAll('.joystick-base').forEach(j => {
        j.style.width = val + 'px';
        j.style.height = val + 'px';
    });
}
