export default class Bullet {
  constructor(x, y, game) {
    this.x = x;
    this.y = y;
    this.vx = 0.2 * game.DPR;
    this.alive = true;
  }

  update(dt, game) {
    this.x += this.vx * dt;
    if (this.x > game.canvas.width + 50) this.alive = false;
  }


}
