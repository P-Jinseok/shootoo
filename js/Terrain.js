export class Terrain {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        this.currentMapType = 'VALLEY';
        
        // 지형 파괴 구멍 데이터를 저장하는 배열
        this.holes = [];
    }
    
    generate(mapType) {
        this.currentMapType = mapType;
        this.holes = []; // 지형 파괴 초기화
        this.redraw();
    }
    
    // 수학 공식 기반 기본 지형 높이 연산
    getBaseHeight(x) {
        if (this.currentMapType === 'VALLEY') {
            let y = 370 + Math.sin(x * 0.006) * 50 + Math.cos(x * 0.012) * 30;
            if (x > 380 && x < 640) {
                y += Math.sin((x - 380) / 260 * Math.PI) * 60;
            }
            return y;
        } else if (this.currentMapType === 'SKY_ISLAND') {
            if (x < 120 || x > this.width - 120) return null; // 공중 섬 밖 양끝 허공
            return 330 + Math.sin(x * 0.007) * 45 + Math.cos(x * 0.015) * 25;
        } else if (this.currentMapType === 'CAVE') {
            return 340 + Math.sin(x * 0.02) * 25 + Math.cos(x * 0.008) * 55;
        }
        return 370;
    }
    
    // 탱크 위치 착지 및 충돌 검사용 Y 좌표 구하기
    getTerrainY(x) {
        const baseY = this.getBaseHeight(x);
        if (baseY === null) return null; // 번지 맵 양끝 허공
        
        // 해당 X 좌표에 파괴된 구멍이 있다면 높이를 구멍 밑으로 떨어뜨림
        let finalY = baseY;
        for (const hole of this.holes) {
            const distX = Math.abs(x - hole.x);
            if (distX < hole.radius) {
                // 파괴된 원 영역 내부 높이 연산
                const holeDepth = Math.sqrt(hole.radius * hole.radius - distX * distX);
                const holeBottom = hole.y + holeDepth;
                if (finalY < holeBottom && finalY > hole.y - holeDepth) {
                    finalY = holeBottom;
                }
            }
        }
        return finalY;
    }
    
    destroy(cx, cy, radius) {
        this.holes.push({ x: cx, y: cy, radius: radius });
        this.redraw();
    }
    
    redraw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 1. 기본 지형 그리기
        this.ctx.fillStyle = this.currentMapType === 'CAVE' ? '#334155' : '#475569';
        this.ctx.beginPath();
        
        if (this.currentMapType === 'SKY_ISLAND') {
            const startX = 120,
                endX = this.width - 120;
            this.ctx.moveTo(startX, this.getBaseHeight(startX));
            for (let x = startX; x <= endX; x += 2) {
                this.ctx.lineTo(x, this.getBaseHeight(x));
            }
            this.ctx.lineTo(endX - 40, 450);
            this.ctx.lineTo(this.width / 2, 500);
            this.ctx.lineTo(startX + 40, 450);
            this.ctx.closePath();
        } else {
            this.ctx.moveTo(0, this.height);
            for (let x = 0; x <= this.width; x += 2) {
                this.ctx.lineTo(x, this.getBaseHeight(x));
            }
            this.ctx.lineTo(this.width, this.height);
        }
        this.ctx.fill();
        
        // 지형 상단 잔디 띠
        this.ctx.strokeStyle = this.currentMapType === 'CAVE' ? '#d97706' : '#22c55e';
        this.ctx.lineWidth = 10;
        this.ctx.stroke();
        
        // 2. 파괴된 구멍들 일괄 깎아내기
        this.ctx.globalCompositeOperation = 'destination-out';
        for (const hole of this.holes) {
            this.ctx.beginPath();
            this.ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    draw(mainCtx) {
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}