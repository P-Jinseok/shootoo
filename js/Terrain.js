export class Terrain {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        this.currentMapType = 'VALLEY';
    }
    
    generate(mapType) {
        this.currentMapType = mapType;
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        if (mapType === 'VALLEY') {
            // 1. 밸리 계곡 맵
            this.ctx.fillStyle = '#475569';
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.height);
            for (let x = 0; x <= this.width; x++) {
                let y = 370 + Math.sin(x * 0.006) * 50 + Math.cos(x * 0.012) * 30;
                if (x > 380 && x < 640) y += Math.sin((x - 380) / 260 * Math.PI) * 60;
                this.ctx.lineTo(x, y);
            }
            this.ctx.lineTo(this.width, this.height);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#22c55e';
            this.ctx.lineWidth = 10;
            this.ctx.stroke();
            
        } else if (mapType === 'SKY_ISLAND') {
            // 2. 공중 섬 맵 (번지 맵)
            this.ctx.fillStyle = '#64748b';
            this.ctx.beginPath();
            const startX = 120,
                endX = 904;
            this.ctx.moveTo(startX, 350);
            
            for (let x = startX; x <= endX; x++) {
                let y = 320 + Math.sin(x * 0.007) * 45 + Math.cos(x * 0.015) * 25;
                this.ctx.lineTo(x, y);
            }
            this.ctx.lineTo(endX - 40, 440);
            this.ctx.lineTo(this.width / 2, 490);
            this.ctx.lineTo(startX + 40, 440);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#10b981';
            this.ctx.lineWidth = 10;
            this.ctx.stroke();
            
        } else if (mapType === 'CAVE') {
            // 3. 울퉁불퉁 동굴 암석 맵
            this.ctx.fillStyle = '#334155';
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.height);
            
            for (let x = 0; x <= this.width; x++) {
                let y = 340 + Math.sin(x * 0.02) * 25 + Math.cos(x * 0.008) * 55;
                this.ctx.lineTo(x, y);
            }
            this.ctx.lineTo(this.width, this.height);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#d97706';
            this.ctx.lineWidth = 10;
            this.ctx.stroke();
        }
    }
    
    getTerrainY(x) {
        if (this.currentMapType === 'SKY_ISLAND' && (x < 100 || x > this.width - 100)) return null;
        if (x < 0 || x > this.width) return null;
        
        const imgData = this.ctx.getImageData(Math.floor(x), 0, 1, this.height).data;
        for (let y = 0; y < this.height; y++) {
            if (imgData[y * 4 + 3] > 0) return y;
        }
        return null;
    }
    
    destroy(cx, cy, radius) {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    draw(mainCtx) {
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}