import Player from "./player.js";
import Bullet from "./bullet.js";
import Enemy from "./enemy.js";
import Renderer from "./renderer.js";
import Utils from "./utils.js";
import Obstacle from "./obstacle.js";
import Config from "./config.js";
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
      score: 0,
      lives: 3,
      stage: 1,
      stageTime: 0,
      scrollSpeed: 0,
      gravity: 0.0025,
      fireBoostActive: false,
      fireBoostTime: 0,
      fireInterval: 800,
      fireIntervalLevel: 1,
      barrierActive: false,
      barrierTime: 0,

      groundH: 90,
      enemySpawnTime: 0,
      enemySpawnTimer: 1000,
      enemySpawnBaseTimeFrom: 0,
      enemySpawnBaseTimeTo: 0,

      obstacleSpawnTimer: 600,
      obstacleSpawnBaseTimeFrom: 0,
      obstacleSpawnBaseTimeTo: 0,
      obstacleSpawnTime: 0,
      obstacleSpawnInterval: 900,
      bgObstacle: 0,

      nextSpawn: 800,

      invul: 0,
      flashUntil: 0,
      enemySpawnInterval: 1500,

      obstacleAirRate: 0.0,
      enemyBarrierRate: 0.0,

    };

    this.config = {
      stageDuration: 30000,
      fireIntervalNormal: 1000,
      fireIntervalBoost: 500,
      fireIntervalBoostBoost: 200,
    };

    this.bg = {
      near: 0,
      far: 0
    };

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

    this.bullets = [];
    this.enemies = [];
    this.obstacles = [];
    this.items = [];
    this.player = new Player(this);
    this.collision = new Collision(this);
    this.input = new Input(this);
    Config.setStageParams(this);
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
    const c = this.config;
    s.time += dt;
    s.stageTime += dt;

    // ▼ ステージ進行処理
    if (s.stageTime >= c.stageDuration) {
      s.stageTime = 0;
      if (s.stage < 10) {
        s.stage++;
        Config.setStageParams(this);
      }
    }

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
    if (s.fireIntervalLevel == 3) {
      s.fireInterval = c.fireIntervalBoostBoost;
    } else if (s.fireIntervalLevel == 2) {
      s.fireInterval = c.fireIntervalBoost;
    } else if (s.fireIntervalLevel == 1) {
      s.fireInterval = c.fireIntervalNormal;
    }
    if (s.time - s.lastShot >= s.fireInterval) {
      s.lastShot = s.time;
      const x = this.player.x + this.player.w + 10 * this.DPR;
      const y = this.player.y + this.player.h * 0.35;
      this.bullets.push(new Bullet(x, y, this));
    }

    // -----------------------------
    // 敵スポーン（独立）
    // -----------------------------
    s.enemySpawnTimer -= dt;
    if (s.enemySpawnTimer <= 0) {
      this.enemies.push(new Enemy(this));

      // 次の敵スポーン（ステージで加速）
      s.enemySpawnTimer = Utils.randomRange(s.enemySpawnBaseTimeFrom, s.enemySpawnBaseTimeTo);
    }

    // -----------------------------
    // 障害物スポーン（独立）
    // -----------------------------
    s.obstacleSpawnTimer -= dt;
    if (s.obstacleSpawnTimer <= 0) {
      this.obstacles.push(new Obstacle(this));

      // 次の障害物スポーン（ステージで加速）
      s.obstacleSpawnTimer = Utils.randomRange(s.obstacleSpawnBaseTimeFrom, s.obstacleSpawnBaseTimeTo);
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
    this.state.fireIntervalLevel = 1;

    // ★ バリア状態も解除しておく
    this.state.barrierActive = false;
    this.state.barrierTime = 0;

    // stage reset
    this.state.stage = 1;
    this.state.stageTime = 0;
    Config.setStageParams(this);

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
    document.getElementById("pauseBtn").style.display = "block";

    this.enemySpawnTimer = 1000;
    this.obstacleSpawnTimer = 600;
  }

  gameOver() {
    this.state.running = false;
    document.getElementById("pauseBtn").textContent = "▶ Resume";

    // ★ Restart にフォーカスを移す
    const restartBtn = document.getElementById("restartBtn");
    restartBtn.focus();

    // ゲームオーバーで非表示
    document.getElementById("pauseBtn").style.display = "none";

    console.log("GAME OVER");
  }

}

