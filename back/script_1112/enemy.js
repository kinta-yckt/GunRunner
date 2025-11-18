// ======================================================
// enemy.js
// 飛行機型の“敵”（浮遊系）
// ======================================================

export default class Enemy {
  constructor(game) {
    const { canvas, state, DPR } = game;

    this.alive = true;

    // tier で HP/サイズ微変化
    const r = Math.random();
    this.tier = r < 0.6 ? 1 : (r < 0.9 ? 2 : 3);
    this.hp = 1; // 一発で倒したい場合は 1

    this.w = (32 + this.tier * 6) * DPR;
    this.h = (18 + this.tier * 4) * DPR;

    // 右端から出現、基本は空中（浮遊）
    const groundY = canvas.height - state.groundH * DPR;
    const minAlt = groundY - 220 * DPR;
    const maxAlt = groundY - 80 * DPR;
    this.x = canvas.width + 40;
    this.y = Math.random() * (maxAlt - minAlt) + minAlt;

    // 背景（地面側）と同じ感覚のスピード
    this.speed = state.scrollSpeed * DPR;
  }

  update(dt, game) {
    this.x -= (this.speed + game.state.scrollSpeed * 0.4 * game.DPR) * dt * 0.6;
    if (this.x + this.w < -40) this.alive = false;
  }
}
