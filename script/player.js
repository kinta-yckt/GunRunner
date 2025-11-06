export default class Player {
  constructor(game) {
    this.w = 26;
    this.h = 64;
    this.x = 120;
    this.y = 0;
    this.vy = 0;
    this.jumpVel = -0.9;
    this.onGround = false;
    this.coyote = 0;

    this.reset(game);
  }

reset(game) {
  const g = game;
  this.x = 120;
  this.vy = 0;
  this.onGround = true;
  this.y = g.canvas.height - g.state.groundH * g.DPR - this.h;
}

  tryJump(state) {
    if (this.onGround || state.time - this.coyote < 120) {
      this.vy = this.jumpVel * window.devicePixelRatio;
      this.onGround = false;
    }
  }

  update(dt, game) {
    const g = game;
    this.vy += g.state.gravity * dt * g.DPR;
    this.y += this.vy * dt;

    const groundY = g.canvas.height - g.state.groundH * g.DPR - this.h;

    if (this.y >= groundY) {
      this.y = groundY;
      this.vy = 0;
      if (!this.onGround) this.coyote = g.state.time;
      this.onGround = true;
    }
  }
}
