import Player from "./player.js";
import Bullet from "./bullet.js";
import Enemy from "./enemy.js";
import Renderer from "./renderer.js";
import Utils from "./utils.js";
import Obstacle from "./obstacle.js";
import Item from "./item.js";

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

    this.player = new Player(this);
    this.invul = 0;
    this.bullets = [];
    this.enemies = [];
    this.obstacles = [];
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

    this.items = [];

    this.initInput();

  }

  resizeCanvas() {
    const cssW = Math.min(900, window.innerWidth * 0.95);
    const cssH = Math.max(320, Math.floor(window.innerHeight * 0.80));

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

    //----------------------------------
    // ボタンフォーカス制御（左右キー）
    //----------------------------------
    const pauseBtn = document.getElementById("pauseBtn");
    const restartBtn = document.getElementById("restartBtn");

    // ★ ゲーム開始時に Pause をフォーカス
    pauseBtn.focus();

    // 現在どちらのボタンにいるか管理
    let focusIndex = 0;  // 0 = pause, 1 = restart

    window.addEventListener("keydown", (e) => {
      // 左右キーのみ反応
      if (e.code === "ArrowRight") {
        focusIndex = 1;
        restartBtn.focus();
      }
      if (e.code === "ArrowLeft") {
        focusIndex = 0;
        pauseBtn.focus();
      }
    });

  }

  spawnEnemy() { this.enemies.push(new Enemy(this)); }
  spawnObstacle(air = false) {
    this.obstacles.push(new Obstacle(this, { air }));
  }

  scheduleNextSpawn() {
    const base = 2000 - this.state.stage * 40; // ステージが上がるほど頻度UP
    this.nextSpawn = Math.max(200, base + Math.random() * 500);
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

    // -----------------------------
    // 敵スポーン（独立）
    // -----------------------------
    this.enemySpawnTimer -= dt;
    if (this.enemySpawnTimer <= 0) {
      this.spawnEnemy();

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

      this.spawnObstacle(makeAir);

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

    Utils.prune(this.bullets);
    Utils.prune(this.enemies);
    Utils.prune(this.obstacles);

    document.getElementById("score").textContent = "Score: " + s.score;
    document.getElementById("lives").textContent = "Lives: " + s.lives;

    document.getElementById("score").textContent = "Score: " + s.score;
    document.getElementById("lives").textContent = "Lives: " + s.lives;

    this.items.forEach((it) => it.update(dt, this));
    Utils.prune(this.items);

  }

  handleCollisions() {
    const p = this.player;
    const s = this.state;

    // ---- bullet vs enemy ----
    // bullet vs enemy
    this.bullets.forEach((b) => {
      if (!b.alive) return;

      this.enemies.forEach((e) => {
        if (!e.alive) return;

        if (
          b.x < e.x + e.w &&
          b.x + 10 > e.x &&
          b.y < e.y + e.h &&
          b.y + 2 > e.y
        ) {
          b.alive = false;

          // ★ バリア持ちの場合（ステージ3〜）
          if (e.hasBarrier && e.hp === 2) {
            e.hp = 1;          // バリアが割れる
            e.hasBarrier = false;
            return;            // まだ死なない
          }

          // ★ 通常処理（HP 0 → 死亡）
          e.hp -= 1;
          if (e.hp <= 0) {
            e.alive = false;
            s.score += 10 * e.tier;

            const types = ["speed", "barrier", "heal"];
            const type = types[Math.floor(Math.random() * types.length)];
            this.items.push(new Item(e.x, e.y, this, type));
          }
        }
      });
    });


    // ---- バリアをこのフレームで使ったか ----
    let usedBarrier = false;

    // --- enemy vs player ---
    for (const e of this.enemies) {
      if (!e.alive) continue;

      if (
        p.x < e.x + e.w &&
        p.x + p.w > e.x &&
        p.y < e.y + e.h &&
        p.y + p.h > e.y
      ) {
        // ★ バリアがあればダメージを完全無効化して即返す
        if (s.barrierActive) {
          s.barrierActive = false; // バリア消費
          e.alive = false;         // 触れた敵は消す
          this.flash(200);
          this.invul = 200;        // 連続当たり防止の短い無敵
          return;                  // ← このフレームの残り衝突処理を打ち切る
        }

        // ★ バリアがないときだけ通常ダメージ
        if (this.invul === 0) {
          e.alive = false;
          s.lives--;
          this.flash(160);
          this.invul = 400;
          if (s.lives <= 0) this.gameOver();
          return;                  // このフレームの衝突処理は終わり
        }
      }
    }

    // --- obstacle vs player ---
    for (const o of this.obstacles) {
      if (
        p.x < o.x + o.w &&
        p.x + p.w > o.x &&
        p.y < o.y + o.h &&
        p.y + p.h > o.y
      ) {
        // ★ バリアがあればノーダメで消費して終了
        if (s.barrierActive) {
          s.barrierActive = false;
          this.flash(200);
          this.invul = 200;  // 連続ヒット防止
          return;
        }

        // ★ バリアがないときだけ減る
        if (this.invul === 0) {
          s.lives--;
          this.flash(160);
          this.invul = 400;
          if (s.lives <= 0) this.gameOver();
          return;
        }
      }
    }


    // ---- item pickup ----
    for (const it of this.items) {
      if (!it.alive) continue;

      if (
        p.x < it.x + it.w &&
        p.x + p.w > it.x &&
        p.y < it.y + it.h &&
        p.y + p.h > it.y
      ) {
        it.alive = false;

        if (it.type === "speed") {
          s.fireBoostActive = true;
          s.fireInterval = s.fireIntervalBoost;
        }

        if (it.type === "barrier") {
          s.barrierActive = true;    // ← バリアON（永続）
        }

        if (it.type === "heal") {
          s.lives = Math.min(5, s.lives + 1);
        }
      }
    }
  }


  flash(ms) { this.flashUntil = Math.max(this.flashUntil, this.state.time + ms); }

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

