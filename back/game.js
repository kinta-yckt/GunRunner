import Player from "./player.js";
import Bullet from "./bullet.js";
import Enemy from "./enemy.js";
import Renderer from "./renderer.js";
import Utils from "./utils.js";
import Obstacle from "./obstacle.js";

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
      scrollSpeed: 0.3,
      stage: 1,
      stageTime: 0,
      stageDuration: 3000,
    };

    this.player = new Player(this);
    this.invul = 0;
    this.bullets = [];
    this.enemies = [];
    this.obstacles = [];

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
    this.jumpKeyDown = false;

    window.addEventListener(
      "keydown",
      (e) => {
        if (["ArrowUp", "Space", "KeyW"].includes(e.code)) {
          e.preventDefault();
          if (!this.jumpKeyDown) {
            this.jumpKeyDown = true;
            this.player.tryJump(this.state);
          }
        }
        if (e.code === "KeyP") this.togglePause();
      },
      { passive: false }
    );

    window.addEventListener("keyup", (e) => {
      if (["ArrowUp", "Space", "KeyW"].includes(e.code)) {
        this.jumpKeyDown = false;
        this.player.jumpHolding = false;
      }
    });

    document.getElementById("pauseBtn")
      .addEventListener("click", () => this.togglePause());
    document.getElementById("restartBtn")
      .addEventListener("click", () => this.restart());
  }

  spawnEnemy() { this.enemies.push(new Enemy(this)); }
  spawnObstacle() { this.obstacles.push(new Obstacle(this)); }
  scheduleNextSpawn() { this.nextSpawn = 600 + Math.random() * 900; }

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
    s.stageTime += dt;

    this.bg.near += s.scrollSpeed * dt * this.DPR;
    this.bg.far += s.scrollSpeed * 0.4 * dt * this.DPR;

    this.player.update(dt, this);
    this.autoShoot(s.time);
    if (this.invul > 0) this.invul = Math.max(0, this.invul - dt);

    this.bullets.forEach((b) => b.update(dt, this));
    this.enemies.forEach((e) => e.update(dt, this));
    this.obstacles.forEach((o) => o.update(dt, this));

    this.handleCollisions();

    // decrement and spawn
    this.nextSpawn -= dt;
    if (this.nextSpawn <= 0) {
      const r = Math.random();
      if (r < 0.7) this.spawnEnemy();
      else this.spawnObstacle();
      this.scheduleNextSpawn();
    }

    // ▼ ステージ進行処理
    s.stageTime += dt;

    if (s.stageTime >= s.stageDuration) {
      s.stageTime = 0;

      if (s.stage < 10) {
        s.stage++;

        // ★ スクロールスピード上昇
        s.scrollSpeed += 0.05;
      }
    }

    if (s.stageTime >= s.stageDuration) {
      s.stageTime = 0;
      if (s.stage < 10) {
        s.stage++;
      }
      // console.log("Stage:", s.stage);
    }

    // ▼ check obstacle platforms
    game.obstacles.forEach((o) => {
      const topY = o.y - this.h;

      // 落下中で、かつプレイヤーが障害物の上に乗る条件
      if (
        this.vy > 0 &&
        this.x + this.w > o.x &&
        this.x < o.x + o.w &&
        this.y <= topY &&
        this.y + this.vy * dt >= topY
      ) {
        // 障害物の上に乗せる
        this.y = topY;
        this.vy = 0;
        this.onGround = true;
      }
    });

    Utils.prune(this.bullets);
    Utils.prune(this.enemies);
    Utils.prune(this.obstacles);

    document.getElementById("score").textContent = "Score: " + s.score;
    document.getElementById("lives").textContent = "Lives: " + s.lives;
  }

  handleCollisions() {
    const p = this.player;

    // bullets vs enemies
    this.bullets.forEach((b) => {
      if (!b.alive) return;
      this.enemies.forEach((e) => {
        if (!e.alive) return;
        if (b.x < e.x + e.w && b.x + 6 > e.x && b.y < e.y + e.h && b.y + 2 > e.y) {
          b.alive = false;
          e.hp -= 1;
          if (e.hp <= 0) {
            e.alive = false;
            this.state.score += 10 * e.tier;
          }
        }
      });
      // bullets vs obstacles (obstacle is indestructible)
      this.obstacles.forEach((o) => {
        if (b.alive && b.x < o.x + o.w && b.x + 6 > o.x && b.y < o.y + o.h && b.y + 2 > o.y) {
          b.alive = false;
        }
      });
    });

    // player vs enemies
    this.enemies.forEach((e) => {
      if (!e.alive) return;

      if (
        p.x < e.x + e.w &&
        p.x + p.w > e.x &&
        p.y < e.y + e.h &&
        p.y + p.h > e.y
      ) {
        if (this.invul === 0) { // ★ 連続ヒット防止
          e.alive = false;      // 敵は消える（障害物は消さない）
          s.lives -= 1;         // 1だけ減る
          this.flash(160);
          this.invul = 400;     // ★ 400ms 無敵
          if (s.lives <= 0) this.gameOver();
        }
      }
    });

    // player vs obstacles
    this.obstacles.forEach((o) => {
      if (!o.alive) return;

      if (
        p.x < o.x + o.w &&
        p.x + p.w > o.x &&
        p.y < o.y + o.h &&
        p.y + p.h > o.y
      ) {
        if (this.invul === 0) { // ★ 連続ヒット防止
          s.lives -= 1;         // 1だけ減る
          this.flash(160);
          this.invul = 400;     // ★ 無敵時間
          if (s.lives <= 0) this.gameOver();
        }
      }
    });
  }

  flash(ms) { this.flashUntil = Math.max(this.flashUntil, this.state.time + ms); }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Renderer.drawBackground(this);
    Renderer.drawGround(this);
    Renderer.drawPlayer(this);

    this.ctx.fillStyle = "#a8c7ff";
    this.bullets.forEach((b) => this.ctx.fillRect(b.x, b.y, 10 * this.DPR, 2 * this.DPR));

    this.enemies.forEach((e) => Renderer.drawEnemy(this, e));
    this.obstacles.forEach((o) => Renderer.drawObstacle(this, o));

    if (this.state.time < this.flashUntil) {
      this.ctx.fillStyle = "rgba(255,80,80,0.15)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
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

    // reset game state
    this.state.score = 0;
    this.state.lives = 3;
    this.state.time = 0;
    this.state.lastShot = 0;

    // ★ stage 初期化
    this.state.stage = 1;
    this.state.stageTime = 0;
    this.state.scrollSpeed = 0.18;  // 初期値に戻す

    // reset background scroll
    this.bg.near = 0;
    this.bg.far = 0;

    // reset spawn timer
    this.nextSpawn = 800;
    this.scheduleNextSpawn();

    // reset player
    this.player.reset(this);
    this.invul = 0;

    // reset flash
    this.flashUntil = 0;

    // resume game
    this.state.running = true;
    document.getElementById("pauseBtn").textContent = "⏸ Pause";
  }

  gameOver() {
    this.state.running = false;
    document.getElementById("pauseBtn").textContent = "▶ Resume";
    console.log("GAME OVER");
  }
}
