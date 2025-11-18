// ======================================================
// game.js
// ゲーム全体の管理（状態遷移のみ）
// ======================================================

import { CONFIG } from "./config.js";
import GameState from "./state.js";
import InputManager from "./input.js";
import Spawner from "./spawner.js";
import CollisionManager from "./collision.js";
import Player from "./player.js";
import Renderer from "./renderer.js";
import Utils from "./utils.js";

export default class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");

    this.DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    this.state = new GameState();
    this.player = new Player(this);

    this.enemies = [];
    this.obstacles = [];
    this.bullets = [];
    this.items = [];

    this.bg = { near: 0, far: 0 };
    this.flashUntil = 0;

    this.spawner = new Spawner(this);
    this.collision = new CollisionManager(this);
    this.input = new InputManager(this);
    this.input.init();
  }

  resizeCanvas() {
    const cssW = Math.min(CONFIG.CANVAS.MAX_WIDTH, window.innerWidth * 0.95);
    const cssH = Math.max(320, Math.floor(window.innerHeight * CONFIG.CANVAS.HEIGHT_RATIO));
    this.canvas.style.width = cssW + "px";
    this.canvas.style.height = cssH + "px";
    this.canvas.width = Math.floor(cssW * this.DPR);
    this.canvas.height = Math.floor(cssH * this.DPR);
  }

  update(dt) {
    const s = this.state;
    s.time += dt;

    // 背景スクロール
    this.bg.near += s.scrollSpeed * dt * this.DPR;
    this.bg.far += s.scrollSpeed * 0.4 * dt * this.DPR;

    // プレイヤー・敵・弾など更新
    this.player.update(dt, this);
    this.spawner.update(dt);
    this.bullets.forEach((b) => b.update(dt, this));
    this.enemies.forEach((e) => e.update(dt, this));
    this.obstacles.forEach((o) => o.update(dt, this));
    this.items.forEach((it) => it.update(dt, this));

    // 状態・当たり判定
    s.updateStage(dt);
    s.updateBuffs(dt);
    this.collision.update();

    // 画面外削除
    Utils.prune(this.bullets);
    Utils.prune(this.enemies);
    Utils.prune(this.obstacles);
    Utils.prune(this.items);

    // UI更新
    document.getElementById("score").textContent = `Score: ${s.score}`;
    document.getElementById("lives").textContent = `Lives: ${s.lives}`;
  }

  draw() {
    const r = Renderer;
    r.drawBackground(this);
    r.drawGround(this);
    r.drawPlayer(this);
    this.bullets.forEach((b) => r.drawBullet(this, b));
    this.enemies.forEach((e) => r.drawEnemy(this, e));
    this.obstacles.forEach((o) => r.drawObstacle(this, o));
    this.items.forEach((it) => r.drawItem(this, it));

    if (this.state.time < this.flashUntil) {
      this.ctx.fillStyle = "rgba(255,80,80,0.15)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (!this.state.running) {
      r.drawGameOver(this);
    }
  }

  flash(ms) {
    this.flashUntil = Math.max(this.flashUntil, this.state.time + ms);
  }

  togglePause() {
    this.state.running = !this.state.running;
    document.getElementById("pauseBtn").textContent = this.state.running
      ? "⏸ Pause"
      : "▶ Resume";
  }

  restart() {
    this.state.reset();
    this.player.reset(this);
    this.enemies.length = 0;
    this.obstacles.length = 0;
    this.bullets.length = 0;
    this.items.length = 0;
    this.bg.near = 0;
    this.bg.far = 0;
    this.flashUntil = 0;
    this.state.running = true;
    document.getElementById("pauseBtn").textContent = "⏸ Pause";
  }

  gameOver() {
    this.state.running = false;
    document.getElementById("pauseBtn").textContent = "▶ Resume";
  }
}
