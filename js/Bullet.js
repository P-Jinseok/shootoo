export class Bullet {
    constructor(shooterId, x, y, vx, vy, type, radius) {
        this.shooterId = shooterId;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type; // 'NORMAL', 'CANNON_RED', 'MULTI', 'GUIDED', 'POISON', 'LASER'
        this.radius = radius;
        this.age = 0;
    }

    update(wind, enemyTank) {
        this.age++;

        // 💡 [유도 미사일 로직]: 적 탱크 주변 180px 반경 내 진입 시 유도 추적
        if (this.type === 'GUIDED' && enemyTank && !enemyTank.isFallen) {
            const dist = Math.hypot(enemyTank.x - this.x, (enemyTank.y - 10) - this.y);
            if (dist < 180) {
                // 유도 추진력 계산
                const angleToEnemy = Math.atan2((enemyTank.y - 10) - this.y, enemyTank.x - this.x);
                const speed = Math.hypot(this.vx, this.vy);
                // 기존 궤적과 유도 방향을 부드럽게 보정
                this.vx = this.vx * 0.82 + Math.cos(angleToEnemy) * speed * 0.18;
                this.vy = this.vy * 0.82 + Math.sin(angleToEnemy) * speed * 0.18;
            } else {
                this.vx += wind * 0.0012;
                this.vy += 0.14;
            }
        } else {
            this.vx += wind * 0.0015;
            this.vy += 0.14;
        }

        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx) {
        ctx.save();
        if (this.type === 'CANNON_RED') ctx.fillStyle = '#ef4444';
        else if (this.type === 'POISON') ctx.fillStyle = '#a855f7';
        else if (this.type === 'LASER') ctx.fillStyle = '#38bdf8';
        else if (this.type === 'GUIDED') ctx.fillStyle = '#f59e0b';
        else ctx.fillStyle = '#fbbf24';

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
    }
}
