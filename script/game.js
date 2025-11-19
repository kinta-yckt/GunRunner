import Player from "./player.js";
import Bullet from "./bullet.js";
import Enemy from "./enemy.js";
import Renderer from "./renderer.js";
import Utils from "./utils.js";
import Obstacle from "./obstacle.js";

import Input from "./input.js";
import Collision from "./collision.js";

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
      fireInterval: 800,
      score: 0,
      lives: 3,
      gravity: 0.0025,
      groundH: 90,
      scrollSpeed: 0.18,
      stage: 1,
      stageTime: 0,
      stageDuration: 40000,
      fireBoostActive: false,
      fireBoostTime: 0,
      fireIntervalNormal: 800,
      fireIntervalBoost: 300,

      barrierActive: false,
      barrierTime: 0,
    };
    this.enemySpawnTimer = 1000;
    this.obstacleSpawnTimer = 600;

    this.invul = 0;
    this.bullets = [];
    this.enemies = [];
    this.obstacles = [];
    this.items = [];

    this.enemySpawnTime = 0;
    this.enemySpawnInterval = 1500;
    this.obstacleSpawnTime = 0;
    this.obstacleSpawnInterval = 900;
    this.bgObstacle = 0;

    this.bg = { near: 0, far: 0 };

    this.nextSpawn = 800;
    this.flashUntil = 0;

    this.stageColors = [
      ["#87CEFA", "#98FB98"],
      ["#e1741cff", "#A1FFA1"],
      ["#0e7a04ff", "#B4FFB4"],
      ["#f3faf9ff", "#C4FFC4"],
      ["#da59eeff", "#D0FFD0"],
      ["#14053eff", "#D8FFE0"],
      ["#222cf3ff", "#FFEAB0"],
      ["#ebe80eff", "#FFD580"],
      ["#72f0eaff", "#FFC060"],
      ["#541003ff", "#FFA840"],
    ];

    this.player = new Player(this);
    this.collision = new Collision(this);
    this.input = new Input(this);
    this.input.init();
  }

  resizeCanvas() {
    const cssW = Math.min(900, window.innerWidth * 0.95);
    const cssH = Math.max(320, Math.floor(window.innerHeight * 0.80));

    this.canvas.style.width = cssW + "px";
    this.canvas.style.height = cssH + "px";
    this.canvas.width = Math.floor(cssW * this.DPR);
    this.canvas.height = Math.floor(cssH * this.DPR);
  }

  scheduleNextSpawn() {
    const base = 2000 - this.state.stage * 40; // ステージが上がるほど頻度UP
    this.nextSpawn = Math.max(200, base + Math.random() * 500);
  }

  update(dt) {
    const s = this.state;
    s.time += dt;
    s.stageTime += dt;
    if (this.invul > 0) {
      this.invul = Math.max(0, this.invul - dt);
    }

    // 背景スクロール
    this.bg.near += s.scrollSpeed * dt * this.DPR;
    this.bg.far += s.scrollSpeed * dt * this.DPR;

    // プレイヤー・敵更新
    this.player.update(dt, this);
    this.bullets.forEach((b) => b.update(dt, this));
    this.enemies.forEach((e) => e.update(dt, this));
    this.obstacles.forEach((o) => o.update(dt, this));
    this.items.forEach((it) => it.update(dt, this));

    // 状態・当たり判定
    this.collision.handleCollisions(this);

    // -----------------------------
    // 銃弾
    // -----------------------------
    if (s.time - this.state.lastShot >= this.state.fireInterval) {
      this.state.lastShot = s.time;
      const x = this.player.x + this.player.w + 10 * this.DPR;
      const y = this.player.y + this.player.h * 0.35;
      this.bullets.push(new Bullet(x, y, this));
    }

    // -----------------------------
    // 敵スポーン（独立）
    // -----------------------------
    this.enemySpawnTimer -= dt;
    if (this.enemySpawnTimer <= 0) {
      this.enemies.push(new Enemy(this));

      // 次の敵スポーン（ステージで加速）
      this.enemySpawnTimer =
        2000 - this.state.stage * 25 + Math.random() * 200;

      if (this.enemySpawnTimer < 300) this.enemySpawnTimer = 300;
    }

    // -----------------------------
    // 障害物スポーン（独立）
    // -----------------------------
    this.obstacleSpawnTimer -= dt;
    if (this.obstacleSpawnTimer <= 0) {

      // ステージ2から空中障害物出現
      const makeAir =
        this.state.stage >= 2 && Math.random() < 0.5;

      this.obstacles.push(new Obstacle(this, { makeAir }));

      // 次の障害物スポーン（ステージで加速）
      this.obstacleSpawnTimer =
        3000 - this.state.stage * 20 + Math.random() * 150;

      if (this.obstacleSpawnTimer < 200)
        this.obstacleSpawnTimer = 200;
    }

    // ▼ ステージ進行処理
    if (s.stageTime >= s.stageDuration) {
      s.stageTime = 0;
      if (s.stage < 10) {
        s.stage++;
        s.scrollSpeed += 0.05;
      }
    }

    // 画面外削除
    Utils.prune(this.bullets);
    Utils.prune(this.enemies);
    Utils.prune(this.obstacles);
    Utils.prune(this.items);

    // UI更新
    document.getElementById("score").textContent = "Score: " + s.score;
    document.getElementById("lives").textContent = "Lives: " + s.lives;
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
    this.bullets.forEach((b) => this.ctx.fillRect(b.x, b.y, 15 * this.DPR, 4 * this.DPR));

    this.enemies.forEach((e) => Renderer.drawEnemy(this, e));
    this.obstacles.forEach((o) => Renderer.drawObstacle(this, o));
    this.items.forEach((it) => Renderer.drawItem(this, it));

    if (this.state.time < this.flashUntil) {
      this.ctx.fillStyle = "rgba(255,80,80,0.15)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // ▼ ★★★★★ GAME OVER 表示（ここから追加） ★★★★★
    if (!this.state.running && this.state.lives <= 0) {

      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      // 背景に薄く黒を敷く
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.fillRect(0, 0, w, h);

      // 文字スタイル
      ctx.fillStyle = "#ffffff";
      ctx.font = `${40 * this.DPR}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText("GAME OVER", w / 2, h / 2);
    }
    // ★★★★★ 追加ここまで ★★★★★
  }

  togglePause() {
    this.state.running = !this.state.running;
    document.getElementById("pauseBtn").textContent = this.state.running ? "⏸ Pause" : "▶ Resume";
  }

  restart() {
    // clear all objects
    this.bullets.length = 0;
    this.enemies.length = 0;
    this.obstacles.length = 0;
    this.items.length = 0;

    // reset game state
    this.state.score = 0;
    this.state.lives = 3;
    this.state.time = 0;
    this.state.lastShot = 0;

    // ★ 連射速度ブースト解除（これが重要）
    this.state.fireBoostActive = false;
    this.state.fireBoostTime = 0;
    this.state.fireInterval = this.state.fireIntervalNormal;

    // ★ バリア状態も解除しておく
    this.state.barrierActive = false;
    this.state.barrierTime = 0;

    // stage reset
    this.state.stage = 1;
    this.state.stageTime = 0;
    this.state.scrollSpeed = 0.18;

    // background
    this.bg.near = 0;
    this.bg.far = 0;

    // spawn
    this.nextSpawn = 800;
    this.scheduleNextSpawn();

    // player
    this.player.reset(this);
    this.invul = 0;

    // flash
    this.flashUntil = 0;

    // resume
    this.state.running = true;
    document.getElementById("pauseBtn").textContent = "⏸ Pause";

    this.enemySpawnTimer = 1000;
    this.obstacleSpawnTimer = 600;
  }

  gameOver() {
    this.state.running = false;
    document.getElementById("pauseBtn").textContent = "▶ Resume";

    // ★ Restart にフォーカスを移す
    const restartBtn = document.getElementById("restartBtn");
    restartBtn.focus();

    console.log("GAME OVER");
  }

}

