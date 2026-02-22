const Auth = {
    // يمكنك إضافة مفاتيح Supabase هنا لاحقاً
    startOffline() { 
        const nameInput = document.getElementById('username').value;
        window.user.name = nameInput || "Operator"; 
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('s-market').classList.remove('hidden');
        Market.updateUI();
    },
    handleAuth() { this.startOffline(); }
};

window.user = { name: '', gold: 0, pegy: 0, level: 1, owned: ["🥷"], current: "🥷", lives: 5 };
