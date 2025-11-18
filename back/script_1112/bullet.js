// ======================================================
// bullet.js
// 弾（単純な矩形）
// ======================================================

export default class Bullet {
  constructor(x, y, game) {
    this.x = x;
    this.y = y;
    this.vx = 0.65 * game.DPR;  // 弾速
    this.alive = true;
  }

  update(dt, game) {
    this.x += this.vx * dt;
    if (this.x > game.canvas.width + 50) this.alive = false;
  }
}
