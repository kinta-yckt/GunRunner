// ======================================================
// obstacle.js
// 障害物（地面固定 or 浮遊）— 破壊不可
// ======================================================

export default class Obstacle {
  constructor(game, makeAir = false) {
    const { canvas, state, DPR } = game;

    this.alive = true;
    this.w = (32 + Math.random() * 32) * DPR;
    this.h = (32 + Math.random() * 24) * DPR;

    this.x = canvas.width + Math.random() * (200 * DPR);

    const groundY = canvas.height - state.groundH * DPR;
    if (makeAir) {
      const minAlt = groundY - 200 * DPR;
      const maxAlt = groundY - 120 * DPR;
      this.y = Math.random() * (maxAlt - minAlt) + minAlt;
    } else {
      this.y = groundY - this.h;
    }

    // 前景スピードに同期
    this.baseSpeed = state.scrollSpeed * DPR;
  }

  update(dt, game) {
    // 速度は state.scrollSpeed に追従（キー入力に依らない）
    const s = game.state.scrollSpeed * game.DPR;
    this.x -= s * dt;
    if (this.x + this.w < 0) this.alive = false;
  }
}
