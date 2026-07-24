export class Tank {
    constructor(id, tankType, x, color, darkColor) {
        this.id = id;
        this.tankType = tankType; // CATAPULT, CANNON, MISSILE, DUKE, MULTI, LASER
        this.x = x;
        this.y = 300;
        this.hp = 100;
        this.maxHp = 100;
        this.angle = 45;
        this.weapon = 1;
        this.moveEnergy = 100;
        this.color = color;
        this.darkColor = darkColor;
        this.recoil = 0;
        this.isFallen = false;
        this.animFrame = 0;
    }

    reset(x) {
        this.x = x;
        this.y = 300;
        this.hp = 100;
        this.angle = 45;
        this.weapon = 1;
        this.moveEnergy = 100;
        this.recoil = 0;
        this.isFallen = false;
    }

    update(terrain) {
        if (this.isFallen) return;

        this.animFrame++;

        const groundY = terrain.getTerrainY(this.x);
        if (groundY === null) {
            this.y += 5;
            if (this.y > 620) {
                this.hp = 0;
                this.isFallen = true;
            }
        } else {
            if (this.y < groundY) this.y += 3.5;
            else this.y = groundY;
        }

        if (this.recoil > 0) this.recoil -= 0.5;
    }

    draw(ctx, isCurrentTurn) {
        if (this.isFallen) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.id === 2) ctx.scale(-1, 1);

        const rad = this.angle * Math.PI / 180;
        const recoilOffset = this.recoil || 0;

        // 💡 6종 탱크 각각의 디자인 표현
        if (this.tankType === 'CATAPULT') {
            // [1. 인민탱크 (Catapult)] 투석기 형태
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.roundRect(-22, -3, 44, 12, 5); ctx.fill();

            ctx.fillStyle = '#854d0e'; // 목재/인민 카키 프레임
            ctx.fillRect(-14, -14, 28, 11);

            // 투석기 프레임 포신
            const bLen = 28 - recoilOffset;
            ctx.strokeStyle = '#a16207'; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(-6, -10); ctx.lineTo(Math.cos(rad) * bLen, -10 - Math.sin(rad) * bLen); ctx.stroke();

        } else if (this.tankType === 'CANNON') {
            // [2. 캐논] 정통 캐논 포탑
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.roundRect(-20, -2, 40, 11, 5); ctx.fill();

            ctx.fillStyle = this.color;
            ctx.beginPath(); ctx.arc(0, -5, 16, Math.PI, 0); ctx.fill();

            const bLen = 36 - recoilOffset;
            ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(Math.cos(rad) * bLen, -6 - Math.sin(rad) * bLen); ctx.stroke();

        } else if (this.tankType === 'MISSILE') {
            // [3. 유도 미사일 탱크] 미사일 포대 형태
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.roundRect(-22, -3, 44, 12, 5); ctx.fill();

            ctx.fillStyle = '#0284c7';
            ctx.beginPath(); ctx.roundRect(-16, -16, 32, 13, 4); ctx.fill();

            const bLen = 30 - recoilOffset;
            ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(Math.cos(rad) * bLen, -10 - Math.sin(rad) * bLen); ctx.stroke();

        } else if (this.tankType === 'DUKE') {
            // [4. 듀크 탱크] 묵직한 오버사이즈 장갑
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.roundRect(-26, -4, 52, 14, 6); ctx.fill();

            ctx.fillStyle = '#475569';
            ctx.fillRect(-18, -18, 36, 14);

            const bLen = 30 - recoilOffset;
            ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 9;
            ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(Math.cos(rad) * bLen, -11 - Math.sin(rad) * bLen); ctx.stroke();

        } else if (this.tankType === 'MULTI') {
            // [5. 멀티 탱크] 다련장 포신
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.roundRect(-20, -3, 40, 12, 5); ctx.fill();

            ctx.fillStyle = '#16a34a';
            ctx.beginPath(); ctx.arc(0, -6, 14, Math.PI, 0); ctx.fill();

            const bLen = 28 - recoilOffset;
            ctx.strokeStyle = '#15803d'; ctx.lineWidth = 3;
            // 3연사 이중 포신 느낌
            ctx.beginPath(); ctx.moveTo(-2, -8); ctx.lineTo(Math.cos(rad) * bLen - 2, -8 - Math.sin(rad) * bLen); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(2, -4); ctx.lineTo(Math.cos(rad) * bLen + 2, -4 - Math.sin(rad) * bLen); ctx.stroke();

        } else if (this.tankType === 'LASER') {
            // [6. 레이저 탱크] SF 하이테크 형태
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.roundRect(-20, -3, 40, 12, 5); ctx.fill();

            ctx.fillStyle = '#0284c7';
            ctx.beginPath(); ctx.moveTo(-16, -2); ctx.lineTo(0, -18); ctx.lineTo(16, -2); ctx.fill();

            const bLen = 34 - recoilOffset;
            ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(Math.cos(rad) * bLen, -10 - Math.sin(rad) * bLen); ctx.stroke();
        }

        // 조준 보조선
        if (isCurrentTurn) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(Math.cos(rad) * 60, -10 - Math.sin(rad) * 60); ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
    }
}
