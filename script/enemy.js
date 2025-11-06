export default class Enemy {
  constructor(game) {
    const g = game;

    const r = Math.random();
    this.tier = r < 0.6 ? 1 : r < 0.9 ? 2 : 3;

    this.hp = this.tier;

    this.color =
      this.tier === 1 ? "#9be28c" :
      this.tier === 2 ? "#ffd66b" :
                        "#ff8b8b";

    this.w = 22 + this.tier * 6;
    this.h = 30 + this.tier * 8;

    this.speed = (0.12 + this.tier * 0.01) * g.DPR;

    this.x = g.canvas.width + 40;
    this.y = g.canvas.height - g.state.groundH * g.DPR - this.h;

    this.alive = true;
  }

  update(dt, game) {
    const s = game.state;
    this.x -= this.speed * dt + s.scrollSpeed * 0.6 * dt * game.DPR;
    if (this.x + this.w < -40) this.alive = false;
  }
}
