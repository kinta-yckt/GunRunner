export default class Obstacle {
  constructor(game) {
    const { canvas, state, DPR } = game;
    this.type = "obstacle";
    this.alive = true;

    // サイズ
    this.w = 20 * DPR;
    this.h = 30 * DPR;

    // 地面に固定
    this.x = canvas.width + Math.random() * 200;
    this.y = canvas.height - state.groundH * DPR - this.h;

    // 左へ流れるスピード（敵と同等）
    this.speed = state.scrollSpeed;
  }

  update(dt, game) {
    // Move with the foreground (near) scroll speed
    const speed = game.state.scrollSpeed * game.DPR;
    this.x -= speed * dt;
    // offscreen cull
    if (this.x + this.w < 0) this.alive = false;

    this.x = Math.round(this.x);
  }
}
