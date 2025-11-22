export default class Enemy {
  constructor(game) {
    const { canvas, state, DPR } = game;

    this.type = "enemy";
    this.alive = true;

    // simple tier (1..3) for hp/size/speed variety
    const r = Math.random();
    this.hp = 1;

    //this.color = this.tier === 1 ? "#ff8b8b" : (this.tier === 2 ? "#ffd66b" : "#ffa64d");

    this.w = 80 * game.DPR;  // 横長
    this.h = 48 * game.DPR;  // 縦短（元画像の比率）

    // spawn at right edge on ground
    this.x = canvas.width + 40;
    const baseY = game.canvas.height - game.state.groundH * game.DPR;
    const minY = baseY - 500;  // 一番高い位置
    const maxY = baseY - 150;   // 一番低い位置
    this.y = minY + Math.random() * (maxY - minY);

    // move speed
    this.speed = DPR;

    // バリア持ち敵を一定確率で出現
    this.hasBarrier = false;
    if (Math.random() < game.state.enemyBarrierRate) {
      this.hasBarrier = true;
      this.hp = 2; // バリア持ちはHP2
    }
  }

  update(dt, game) {
    // move left with slight background drift factor
    this.x -= game.state.scrollSpeed * dt * game.DPR * 1.1;
    if (this.x + this.w < -40) this.alive = false;
  }
}
