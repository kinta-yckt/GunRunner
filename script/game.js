import Player from "./player.js";
import Bullet from "./bullet.js";
import Enemy from "./enemy.js";
import Renderer from "./renderer.js";
import Utils from "./utils.js";

export default class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");

    this.DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    this.state = {
      running: true,
      time: 0,
      lastShot: 0,
      fireInterval: 160,
      score: 0,
      lives: 3,
      gravity: 0.0025,
      groundH: 90,
      scrollSpeed: 0.18,
    };

    this.player = new Player(this);
    this.bullets = [];
    this.enemies = [];

    this.bg = { near: 0, far: 0 };

    this.nextSpawn = 800;
    this.flashUntil = 0;

    this.initInput();
  }

  resizeCanvas() {
    const cssW = Math.min(900, window.innerWidth * 0.95);
    const cssH = Math.max(320, Math.floor(window.innerHeight * 0.55));

    this.canvas.style.width = cssW + "px";
    this.canvas.style.height = cssH + "px";
    this.canvas.width = Math.floor(cssW * this.DPR);
    this.canvas.height = Math.floor(cssH * this.DPR);
  }

  initInput() {
    window.addEventListener(
      "keydown",
      (e) => {
        if (["ArrowUp", "Space", "KeyW"].includes(e.code)) {
          e.preventDefault();
          this.player.tryJump(this.state);
        }
        if (e.code === "KeyP") this.togglePause();
      },
      { passive: false }
    );

    document
      .getElementById("pauseBtn")
      .addEventListener("click", () => this.togglePause());

    document
      .getElementById("restartBtn")
      .addEventListener("click", () => this.restart());
  }

  spawnEnemy() {
    this.enemies.push(new Enemy(this));
  }

  scheduleNextSpawn() {
    this.nextSpawn = 600 + Math.random() * 900;
  }

  autoShoot(now) {
    if (now - this.state.lastShot >= this.state.fireInterval) {
      this.state.lastShot = now;
      const x = this.player.x + this.player.w + 10 * this.DPR;
      const y = this.player.y + this.player.h * 0.35;
      this.bullets.push(new Bullet(x, y, this));
    }
  }

  update(dt) {
    const s = this.state;

    s.time += dt;

    this.bg.near += s.scrollSpeed * dt * this.DPR;
    this.bg.far += s.scrollSpeed * 0.4 * dt * this.DPR;

    this.player.update(dt, this);

    this.autoShoot(s.time);

    this.bullets.forEach((b) => b.update(dt, this));
    this.enemies.forEach((e) => e.update(dt, this));

    this.handleCollisions();

    this.nextSpawn -= dt;
    if (this.nextSpawn <= 0) {
      this.spawnEnemy();
      this.scheduleNextSpawn();
    }

    Utils.prune(this.bullets);
    Utils.prune(this.enemies);

    document.getElementById("score").textContent = "Score: " + s.score;
    document.getElementById("lives").textContent = "Lives: " + s.lives;
  }

  handleCollisions() {
    const p = this.player;
    const s = this.state;

    this.bullets.forEach((b) => {
      if (!b.alive) return;
      this.enemies.forEach((e) => {
        if (!e.alive) return;

        if (
          b.x < e.x + e.w &&
          b.x + 6 > e.x &&
          b.y < e.y + e.h &&
          b.y + 2 > e.y
        ) {
          b.alive = false;
          e.hp -= 1;
          if (e.hp <= 0) {
            e.alive = false;
            s.score += 10 * e.tier;
          }
        }
      });
    });

    this.enemies.forEach((e) => {
      if (!e.alive) return;

      if (
        p.x < e.x + e.w &&
        p.x + p.w > e.x &&
        p.y < e.y + e.h &&
        p.y + p.h > e.y
      ) {
        e.alive = false;
        s.lives -= 1;
        this.flash(160);

        if (s.lives <= 0) this.gameOver();
      }
    });
  }

  flash(ms) {
    this.flashUntil = Math.max(this.flashUntil, this.state.time + ms);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    Renderer.drawBackground(this);
    Renderer.drawGround(this);
    Renderer.drawPlayer(this);

    this.ctx.fillStyle = "#a8c7ff";
    this.bullets.forEach((b) =>
      this.ctx.fillRect(b.x, b.y, 10 * this.DPR, 2 * this.DPR)
    );

    this.enemies.forEach((e) => Renderer.drawEnemy(this, e));

    if (this.state.time < this.flashUntil) {
      this.ctx.fillStyle = "rgba(255,80,80,0.15)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  togglePause() {
    this.state.running = !this.state.running;
    document.getElementById("pauseBtn").textContent = this.state.running
      ? "⏸ Pause"
      : "▶ Resume";
  }

restart() {
  // clear bullets & enemies
  this.bullets.length = 0;
  this.enemies.length = 0;

  // reset state
  this.state.score = 0;
  this.state.lives = 3;
  this.state.time = 0;
  this.state.lastShot = 0;

  // reset background scroll
  this.bg.near = 0;
  this.bg.far = 0;

  // reset spawn timer
  this.nextSpawn = 800;
  this.scheduleNextSpawn();

  // reset player
  this.player.reset(this);

  // reset flash
  this.flashUntil = 0;

  // resume
  this.state.running = true;

  document.getElementById("pauseBtn").textContent = "⏸ Pause";
}
}
