export default class Obstacle {
  constructor(game) {
    const { canvas, state, DPR } = game;
    this.type = "obstacle";
    this.alive = true;

    // ✅ 敵（tier1）と同じサイズに統一
    this.w = 15 * DPR;
    this.h = 15 * DPR;

    // 地面に固定
    this.x = canvas.width + Math.random() * 200;
    this.y = canvas.height - state.groundH * DPR - this.h;

    // 左へ流れるスピード（敵と同等）
    this.speed = state.scrollSpeed * DPR;
  }

  update(dt, game) {
    this.x -= this.speed * dt;
    if (this.x + this.w < 0) this.alive = false;
  }
}
