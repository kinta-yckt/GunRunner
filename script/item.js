export default class Item {
    constructor(x, y, game, type = "speed") {
        this.x = x;
        this.y = y;

        this.type = type; // ← アイテム種類

        this.w = 24 * game.DPR;
        this.h = 24 * game.DPR;

        this.alive = true;
        this.speed = game.state.scrollSpeed;
    }

    update(dt, game) {
        this.x -= this.speed * dt * game.DPR;
        if (this.x + this.w < 0) this.alive = false;
    }
}
