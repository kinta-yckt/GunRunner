// ======================================================
// item.js
// アイテム（speed / barrier / heal）
// ======================================================

export default class Item {
    constructor(x, y, game, type = "speed") {
        this.type = type;
        this.alive = true;

        const s = 26 * game.DPR;
        this.w = s;
        this.h = s;
        this.x = x;
        this.y = y;
        this.vy = 0.02 * game.DPR; // ふわっと落ちる
    }

    update(dt, game) {
        // 画面外に出にくいように緩く落下
        this.y += this.vy * dt;
        if (this.y > game.canvas.height) this.alive = false;
    }
}
