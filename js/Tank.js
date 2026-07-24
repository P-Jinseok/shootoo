export class Tank {
    constructor(id, tankType, x, color, darkColor) {
        this.id = id;
        this.tankType = tankType;
        this.x = x;
        this.y = 50; // 초기 위치를 공중 위쪽에서 떨어지도록 안전 설정
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

    update(terrain) {
        if (this.isFallen) return;

        this.animFrame++;

        const groundY = terrain.getTerrainY(this.x);
        
        // 지형이 완전히 없는 허공인 경우 추락
        if (groundY === null) {
            this.y += 6;
            if (this.y > 620) {
                this.hp = 0;
                this.isFallen = true;
            }
        } else {
            // 지형 높이로 자연스럽게 착지
            if (this.y < groundY) {
                this.y = Math.min(this.y + 6, groundY);
            } else if (this.y > groundY) {
                this.y = groundY;
            }
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

        if (this.tankType === 'CATAPULT') {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.roundRect(-22, -3, 44, 12, 5); ctx.fill();

            ctx.fillStyle = '#854d0e';
            ctx.fillRect(-14, -14, 28, 11);

            const bLen = 28 - recoilOffset;
            ctx.strokeStyle = '#a16207'; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(-6, -10); ctx.lineTo(Math.cos(rad) * bLen, -10 - Math.sin(rad) * bLen); ctx.stroke();

        } else if (this.tankType === 'CANNON') {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.roundRect(-20, -2, 40, 11, 5); ctx.fill();

            ctx.fillStyle = this.color;
            ctx.beginPath(); ctx.arc(0, -5, 16, Math.PI, 0); ctx.fill();

            const bLen = 36 - recoilOffset;
            ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(Math.cos(rad) * bLen, -6 - Math.sin(rad) * bLen); ctx.stroke();

        } else if (this.tankType === 'MISSILE') {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.roundRect(-22, -3, 44, 12, 5); ctx.fill();

            ctx.fillStyle = '#0284c7';
            ctx.beginPath(); ctx.roundRect(-16, -16, 32, 13, 4); ctx.fill();

            const bLen = 30 - recoilOffset;
            ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(Math.cos(rad) * bLen, -10 - Math.sin(rad) * bLen); ctx.stroke();

        } else if (this.tankType === 'DUKE') {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.roundRect(-26, -4, 52, 14, 6); ctx.fill();

            ctx.fillStyle = '#475569';
            ctx.fillRect(-18, -18, 36, 14);

            const bLen = 30 - recoilOffset;
            ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 9;
            ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(Math.cos(rad) * bLen, -11 - Math.sin(rad) * bLen); ctx.stroke();

        } else if (this.tankType === 'MULTI') {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.roundRect(-20, -3, 40, 12, 5); ctx.fill();

            ctx.fillStyle = '#16a34a';
            ctx.beginPath(); ctx.arc(0, -6, 14, Math.PI, 0); ctx.fill();

            const bLen = 28 - recoilOffset;
            ctx.strokeStyle = '#15803d'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(-2, -8); ctx.lineTo(Math.cos(rad) * bLen - 2, -8 - Math.sin(rad) * bLen); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(2, -4); ctx.lineTo(Math.cos(rad) * bLen + 2, -4 - Math.sin(rad) * bLen); ctx.stroke();

        } else if (this.tankType === 'LASER') {
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
