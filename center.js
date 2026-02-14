// center.js - 游戏中心逻辑

// ==================== 游戏列表数据 ====================
const GAMES = [
    {
        id: 'space-impact',
        name: 'Space Impact II',
        desc: 'Nokia 经典横版射击游戏重制版，驾驶战机消灭外星敌人，收集武器升级，挑战 6 个关卡。',
        path: 'games/space-impact/index.html',
        thumbnail: '🚀',
        tags: ['射击', '经典', 'Nokia'],
        status: 'ready',
    },
    // ---- 占位：未来游戏在这里添加 ----
    {
        id: 'coming-soon-1',
        name: '???',
        desc: '更多经典游戏即将上线，敬请期待...',
        path: '#',
        thumbnail: '🎮',
        tags: ['敬请期待'],
        status: 'coming-soon',
    },
];

// ==================== 渲染游戏卡片 ====================
function renderGameGrid() {
    const grid = document.getElementById('game-grid');
    if (!grid) return;

    grid.innerHTML = '';

    for (const game of GAMES) {
        const card = document.createElement('div');
        card.className = 'game-card' + (game.status === 'coming-soon' ? ' coming-soon' : '');

        const tagsHTML = game.tags.map(t => `<span class="card-tag">${t}</span>`).join('');

        if (game.status === 'coming-soon') {
            card.innerHTML = `
                <span class="coming-soon-badge">COMING SOON</span>
                <div class="card-thumb">${game.thumbnail}</div>
                <div class="card-body">
                    <div class="card-title">${game.name}</div>
                    <div class="card-desc">${game.desc}</div>
                    <div class="card-tags">${tagsHTML}</div>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="card-thumb">${game.thumbnail}</div>
                <div class="card-body">
                    <div class="card-title">${game.name}</div>
                    <div class="card-desc">${game.desc}</div>
                    <div class="card-tags">${tagsHTML}</div>
                    <a class="card-play-btn" href="${game.path}">▶ PLAY</a>
                </div>
            `;
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('card-play-btn')) return;
                window.location.href = game.path;
            });
        }

        grid.appendChild(card);
    }
}

// ==================== 星空背景 ====================
function initStarsBg() {
    const canvas = document.getElementById('stars-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h;
    const stars = [];
    const STAR_COUNT = 120;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function createStars() {
        stars.length = 0;
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.5 + 0.3,
                speed: Math.random() * 0.3 + 0.05,
                alpha: Math.random() * 0.6 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinklePhase: Math.random() * Math.PI * 2,
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        const time = Date.now() * 0.001;
        for (const s of stars) {
            const alpha = s.alpha + Math.sin(time * s.twinkleSpeed * 60 + s.twinklePhase) * 0.2;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 220, 255, ${Math.max(0.05, Math.min(1, alpha))})`;
            ctx.fill();

            // 缓慢向左移动
            s.x -= s.speed;
            if (s.x < -2) {
                s.x = w + 2;
                s.y = Math.random() * h;
            }
        }
        requestAnimationFrame(draw);
    }

    resize();
    createStars();
    draw();
    window.addEventListener('resize', () => {
        resize();
        createStars();
    });
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    renderGameGrid();
    initStarsBg();
});
