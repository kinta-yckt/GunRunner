export default class Enemy {
  constructor(game) {
    const { canvas, state, DPR } = game;

    this.type = "enemy";
    this.alive = true;

    // simple tier (1..3) for hp/size/speed variety
    const r = Math.random();
    this.tier = r < 0.6 ? 1 : (r < 0.9 ? 2 : 3);
    this.hp = this.tier;

    this.color = this.tier === 1 ? "#ff8b8b" : (this.tier === 2 ? "#ffd66b" : "#ffa64d");

    this.w = (22 + this.tier * 6);
    this.h = (40 + this.tier * 8);

    // spawn at right edge on ground
    this.x = canvas.width + 40;
    this.y = canvas.height - state.groundH * DPR - this.h;

    // move speed
    this.speed = (0.12 + this.tier * 0.01) * DPR;
  }

  update(dt, game) {
    // move left with slight background drift factor
    this.x -= this.speed * dt + game.state.scrollSpeed * 0.6 * dt * game.DPR;
    if (this.x + this.w < -40) this.alive = false;
  }
}
