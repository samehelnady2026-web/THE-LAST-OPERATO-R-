const Market = {
    heroes: [
        {e:'🥷', p:0, c:'🪙'}, {e:'🤹‍♀️', p:100, c:'🪙'}, {e:'👮', p:150, c:'🪙'}, 
        {e:'🦊', p:200, c:'🪙'}, {e:'🐼', p:300, c:'🪙'}, {e:'🐶', p:500, c:'🪙'},
        {e:'✈️', p:1000, c:'💷'}, {e:'🗽', p:1500, c:'💷'}, {e:'🚀', p:5000, c:'💷'}
    ],
    updateUI() {
        const els = { 'h-gold': window.user.gold, 'h-pegy-hud': window.user.pegy, 'h-lives': window.user.lives, 'level-num': window.user.level, 'm-gold': window.user.gold, 'm-pegy': window.user.pegy };
        for (let id in els) { let e = document.getElementById(id); if(e) e.innerText = els[id]; }
        const grid = document.getElementById('hero-grid');
        if (grid) {
            grid.innerHTML = '';
            this.heroes.forEach(h => {
                const owned = window.user.owned.includes(h.e);
                const sel = window.user.current === h.e;
                const div = document.createElement('div');
                div.className = `shop-item ${sel ? 'selected' : ''}`;
                div.innerHTML = `<span>${h.e}</span><small>${owned ? 'تملك' : h.p + h.c}</small>`;
                div.onclick = () => this.selectHero(h);
                grid.appendChild(div);
            });
        }
    },
    selectHero(h) {
        if (window.user.owned.includes(h.e)) window.user.current = h.e;
        else {
            let curr = h.c === '🪙' ? 'gold' : 'pegy';
            if (window.user[curr] >= h.p) {
                window.user[curr] -= h.p; window.user.owned.push(h.e); window.user.current = h.e;
            } else alert("رصيد غير كافٍ");
        }
        this.updateUI();
    },
    convertCurrency() {
        if (window.user.gold >= 1000) { window.user.gold -= 1000; window.user.pegy += 50; this.updateUI(); }
    }
};
