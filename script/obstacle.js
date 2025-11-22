// obstacle.js
export default class Obstacle {
  constructor(game) {
    const { canvas, state, DPR } = game;
    this.type = "obstacle";
    this.alive = true;

    // ← 追加: 空中(air)か地上かを指定
    if (Math.random() < game.state.obstacleAirRate) {
      this.air = true;
    }

    // サイズ（そのまま/お好みで調整可）
    this.w = 20 * DPR;
    this.h = 30 * DPR;

    // 生成位置（右端）
    this.x = canvas.width + Math.random() * 200;

    // ↓ 地上 or 空中の Y を切り替え
    if (this.air) {
      const groundY = canvas.height - state.groundH * DPR;
      const minY = groundY - 300 * DPR; // 高い
      const maxY = groundY - 90 * DPR; // 低い（地面より上）
      this.y = minY + Math.random() * (maxY - minY);
    } else {
      this.y = canvas.height - state.groundH * DPR - this.h;
    }

    // 背景（手前）と同じ流れで左へ
    this.speed = state.scrollSpeed;
  }

  update(dt, game) {
    const speed = game.state.scrollSpeed * game.DPR;
    this.x -= speed * dt;
    if (this.x + this.w < 0) this.alive = false;
  }
}
