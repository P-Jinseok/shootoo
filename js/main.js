import { Terrain } from './Terrain.js';
import { Bullet } from './Bullet.js';
import { Tank } from './Tank.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const terrain = new Terrain(canvas.width, canvas.height);

let selectedP1Type = 'CATAPULT';
let selectedP2Type = 'CANNON';
let selectedMap = 'VALLEY';

let players = [null, null, null];
let currentTurn = 1;
let wind = Math.floor(Math.random() * 15) - 7;
let isCharging = false;
let currentPower = 0;
let bullets = [];
let particles = [];
let gameOver = false;
let turnTimer = 20;
let timerInterval = null;

const keys = {};

function setupLobbyEvents() {
    const p1Cards = document.querySelectorAll('#p1TankSelect .tank-card');
    p1Cards.forEach(card => {
        card.addEventListener('click', () => {
            p1Cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedP1Type = card.dataset.tank;
        });
    });

    const p2Cards = document.querySelectorAll('#p2TankSelect .tank-card');
    p2Cards.forEach(card => {
        card.addEventListener('click', () => {
            p2Cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedP2Type = card.dataset.tank;
        });
    });

    const mapCards = document.querySelectorAll('#mapSelect .map-card');
    mapCards.forEach(card => {
        card.addEventListener('click', () => {
            mapCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedMap = card.dataset.map;
        });
    });

    document.getElementById('btnStartGame').addEventListener('click', () => {
        document.getElementById('selectionLobby').style.display = 'none';
        document.getElementById('gameCabinet').style.display = 'block';
        document.getElementById('arcadePad').style.display = 'flex';
        initGame();
    });

    document.getElementById('btnRestart').addEventListener('click', () => {
        document.getElementById('gameOverOverlay').style.display = 'none';
        initGame();
    });

    document.getElementById('btnLobby').addEventListener('click', () => {
        document.getElementById('gameOverOverlay').style.display = 'none';
        document.getElementById('gameCabinet').style.display = 'none';
        document.getElementById('arcadePad').style.display = 'none';
        document.getElementById('selectionLobby').style.display = 'flex';
    });
}

function initGame() {
    gameOver = false;
    bullets = [];
    particles = [];
    currentTurn = 1;
    isCharging = false;
    currentPower = 0;
    wind = Math.floor(Math.random() * 15) - 7;

    // 1. 맵 지형 생성
    terrain.generate(selectedMap);

    // 2. 탱크 객체 초기화 (안전 Y 위치)
    players[1] = new Tank(1, selectedP1Type, 220, '#22c55e', '#14532d');
    players[2] = new Tank(2, selectedP2Type, 800, '#ef4444', '#7f1d1d');

    document.getElementById('p1Title').innerText = `P1 · ${players[1].tankType}`;
    document.getElementById('p2Title').innerText = `P2 · ${players[2].tankType}`;

    document.getElementById('p1Card').classList.add('active');
    document.getElementById('p2Card').classList.remove('active');

    resetTimer();
}

window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Digit1') setWeapon(1);
    if (e.code === 'Digit2') setWeapon(2);
    if (e.code === 'Space' && !bullets.length && !isCharging && !gameOver) startCharging();
});

window.addEventListener('keyup', e => {
    keys[e.code] = false;
    if (e.code === 'Space' && isCharging) stopCharging();
});

function bindBtn(id, code) {
    const el = document.getElementById(id);
    if (!el) return;
    const press = () => { keys[code] = true; if (id === 'btnFire' && !bullets.length && !isCharging && !gameOver) startCharging(); };
    const release = () => { keys[code] = false; if (id === 'btnFire' && isCharging) stopCharging(); };
    el.addEventListener('mousedown', press); el.addEventListener('mouseup', release);
    el.addEventListener('touchstart', (e) => { e.preventDefault(); press(); });
    el.addEventListener('touchend', (e) => { e.preventDefault(); release(); });
}

bindBtn('btnLeft', 'KeyA'); bindBtn('btnRight', 'KeyD');
bindBtn('btnUp', 'KeyW'); bindBtn('btnDown', 'KeyS');
bindBtn('btnFire', 'Space');

document.getElementById('btnW1').onclick = () => setWeapon(1);
document.getElementById('btnW2').onclick = () => setWeapon(2);

function setWeapon(num) {
    if (!players[currentTurn]) return;
    players[currentTurn].weapon = num;
    document.getElementById('btnW1').classList.toggle('active', num === 1);
    document.getElementById('btnW2').classList.toggle('active', num === 2);
    document.getElementById('weaponLabel').innerText = num === 1 ? '1탄' : '2탄 (특수)';
}

function startCharging() { isCharging = true; currentPower = 0; }
function stopCharging() { isCharging = false; fire(); }

function fire() {
    const p = players[currentTurn];
    if (!p) return;

    const rad = (p.id === 2 ? (180 - p.angle) : p.angle) * Math.PI / 180;
    const speed = currentPower * 0.26;
    p.recoil = 8;

    if (p.weapon === 1) {
        bullets.push(new Bullet(p.id, p.x + Math.cos(rad) * 32, p.y - 12 - Math.sin(rad) * 32, Math.cos(rad) * speed, -Math.sin(rad) * speed, 'NORMAL', 5));
    } else {
        if (p.tankType === 'CATAPULT') {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    bullets.push(new Bullet(p.id, p.x + Math.cos(rad) * 30, p.y - 12 - Math.sin(rad) * 30, Math.cos(rad) * speed * (1 + (i - 1) * 0.05), -Math.sin(rad) * speed * (1 + (i - 1) * 0.05), 'NORMAL', 4));
                }, i * 140);
            }
        } else if (p.tankType === 'CANNON') {
            bullets.push(new Bullet(p.id, p.x + Math.cos(rad) * 34, p.y - 12 - Math.sin(rad) * 34, Math.cos(rad) * speed, -Math.sin(rad) * speed, 'CANNON_RED', 7));
        } else if (p.tankType === 'MISSILE') {
            bullets.push(new Bullet(p.id, p.x + Math.cos(rad) * 32, p.y - 12 - Math.sin(rad) * 32, Math.cos(rad) * speed, -Math.sin(rad) * speed, 'GUIDED', 5));
        } else if (p.tankType === 'DUKE') {
            bullets.push(new Bullet(p.id, p.x + Math.cos(rad) * 32, p.y - 12 - Math.sin(rad) * 32, Math.cos(rad) * speed, -Math.sin(rad) * speed, 'POISON', 8));
        } else if (p.tankType === 'MULTI') {
            for (let i = 0; i < 9; i++) {
                setTimeout(() => {
                    bullets.push(new Bullet(p.id, p.x + Math.cos(rad) * 30, p.y - 12 - Math.sin(rad) * 30, Math.cos(rad) * speed * (1 + (Math.random() - 0.5) * 0.08), -Math.sin(rad) * speed * (1 + (Math.random() - 0.5) * 0.08), 'NORMAL', 3));
                }, i * 80);
            }
        } else if (p.tankType === 'LASER') {
            for (let i = -1; i <= 1; i++) {
                let offRad = rad + (i * 0.05);
                bullets.push(new Bullet(p.id, p.x + Math.cos(offRad) * 34, p.y - 12 - Math.sin(offRad) * 34, Math.cos(offRad) * speed, -Math.sin(offRad) * speed, 'LASER', 4));
            }
        }
    }
}

function explode(x, y, type) {
    let rad = 32;
    let baseDmg = 36;

    if (type === 'CANNON_RED') { rad = 44; baseDmg = 48; }
    else if (type === 'GUIDED') { rad = 28; baseDmg = 25; }
    else if (type === 'POISON') { rad = 40; baseDmg = 42; }

    terrain.destroy(x, y, rad);

    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 5 + 1;
        particles.push({ x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, radius: Math.random() * 4 + 2, alpha: 1 });
    }

    players.slice(1).forEach(p => {
        if (!p || p.isFallen) return;
        const dist = Math.hypot(p.x - x, p.y - y);
        if (dist < rad + 18) {
            p.hp = Math.max(0, p.hp - Math.floor((1 - dist / (rad + 18)) * baseDmg));
        }
    });
}

function update() {
    if (document.getElementById('gameCabinet').style.display === 'none' || !players[1]) return;

    players.slice(1).forEach(p => p && p.update(terrain));

    if (!bullets.length && !gameOver) {
        const cur = players[currentTurn];
        if (cur) {
            if (keys['KeyA'] && cur.x > 80 && cur.moveEnergy > 0) { cur.x -= 1.2; cur.moveEnergy -= 0.4; }
            if (keys['KeyD'] && cur.x < canvas.width - 80 && cur.moveEnergy > 0) { cur.x += 1.2; cur.moveEnergy -= 0.4; }
            if (keys['KeyW']) cur.angle = Math.min(cur.angle + 0.8, 90);
            if (keys['KeyS']) cur.angle = Math.max(cur.angle - 0.8, 0);
            if (isCharging) currentPower = Math.min(currentPower + 0.85, 100);
        }
    }

    const enemyTank = players[currentTurn === 1 ? 2 : 1];

    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.update(wind, enemyTank);

        particles.push({ x: b.x, y: b.y, vx: 0, vy: 0, radius: 2, alpha: 0.6 });

        if (b.x < 0 || b.x > canvas.width || b.y > canvas.height) {
            bullets.splice(i, 1);
            if (!bullets.length) nextTurn();
            continue;
        }

        const tY = terrain.getTerrainY(b.x);
        if (tY !== null && b.y >= tY) {
            explode(b.x, b.y, b.type);
            bullets.splice(i, 1);
            if (!bullets.length) nextTurn();
            continue;
        }

        let hit = false;
        players.slice(1).forEach(p => {
            if (!p || p.isFallen || (b.shooterId === p.id && b.age < 10)) return;
            if (Math.hypot(p.x - b.x, (p.y - 12) - b.y) < 18 + b.radius) hit = true;
        });

        if (hit) {
            explode(b.x, b.y, b.type);
            bullets.splice(i, 1);
            if (!bullets.length) nextTurn();
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.03;
        if (p.alpha <= 0) particles.splice(i, 1);
    }
}

function nextTurn() {
    currentPower = 0;
    if (players[1].hp <= 0 || players[2].hp <= 0 || players[1].isFallen || players[2].isFallen) {
        gameOver = true;
        clearInterval(timerInterval);

        let winStr = players[1].isFallen ? 'P1 번지! P2 승리!' : (players[2].isFallen ? 'P2 번지! P1 승리!' : (players[1].hp > 0 ? '🏆 P1 승리!' : '🏆 P2 승리!'));
        document.getElementById('winnerText').innerText = winStr;
        document.getElementById('gameOverOverlay').style.display = 'flex';
        return;
    }

    currentTurn = currentTurn === 1 ? 2 : 1;
    wind = Math.floor(Math.random() * 15) - 7;
    players[currentTurn].moveEnergy = 100;
    setWeapon(players[currentTurn].weapon);

    document.getElementById('p1Card').classList.toggle('active', currentTurn === 1);
    document.getElementById('p2Card').classList.toggle('active', currentTurn === 2);
    resetTimer();
}

function resetTimer() {
    clearInterval(timerInterval);
    turnTimer = 20;
    document.getElementById('turnTimer').innerText = turnTimer;
    timerInterval = setInterval(() => {
        if (!bullets.length && !isCharging && !gameOver) {
            turnTimer--;
            document.getElementById('turnTimer').innerText = turnTimer;
            if (turnTimer <= 0) nextTurn();
        }
    }, 1000);
}

function render() {
    if (document.getElementById('gameCabinet').style.display === 'none' || !players[1]) return;

    let skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#0284c7');
    skyGrad.addColorStop(0.6, '#38bdf8');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);

    terrain.draw(ctx);

    particles.forEach(p => {
        ctx.save(); ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });

    players.slice(1).forEach(p => p && p.draw(ctx, players[currentTurn] === p && !bullets.length));
    bullets.forEach(b => b.draw(ctx));

    document.getElementById('p1Angle').innerText = Math.round(players[1].angle);
    document.getElementById('p2Angle').innerText = Math.round(players[2].angle);
    document.getElementById('p1HpFill').style.width = (players[1].hp / players[1].maxHp * 100) + '%';
    document.getElementById('p2HpFill').style.width = (players[2].hp / players[2].maxHp * 100) + '%';
    document.getElementById('p1MoveFill').style.width = players[1].moveEnergy + '%';
    document.getElementById('p2MoveFill').style.width = players[2].moveEnergy + '%';
    document.getElementById('windText').innerText = wind > 0 ? `▶ ${wind}` : (wind < 0 ? `◀ ${Math.abs(wind)}` : '0');
    document.getElementById('powerFill').style.width = currentPower + '%';
}

function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

setupLobbyEvents();
loop();
