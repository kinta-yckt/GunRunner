// ======================================================
// state.js
// ゲーム全体の状態を保持・リセットする
// ======================================================

import { CONFIG } from "./config.js";

export default class GameState {
    constructor() {
        this.reset();

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
            fireIntervalLevel: 1,
            barrierActive: false,
            barrierTime: 0,
        };

        this.config = {
            fireIntervalNormal: 800,
            fireIntervalBoost: 500,
            fireIntervalBoostBoost: 200,

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

    reset() {
        this.running = true;
        this.time = 0;
        this.lastShot = 0;
        this.score = 0;
        this.lives = CONFIG.LIVES.START;
        this.scrollSpeed = CONFIG.SCROLL.BASE_SPEED;

        // ステージ管理
        this.stage = 1;
        this.stageTime = 0;
        this.stageDuration = CONFIG.STAGE.DURATION;
        this.groundH = 64;

        // 攻撃関連
        this.fireInterval = CONFIG.FIRE.INTERVAL_NORMAL;
        this.fireBoostActive = false;

        // バリア関連
        this.barrierActive = false;
        this.barrierTime = 0;

        // 内部処理用
        this.invul = 0;
    }

    // ステージ進行処理
    updateStage(dt) {
        this.stageTime += dt;
        if (this.stageTime >= this.stageDuration) {
            this.stageTime = 0;
            if (this.stage < CONFIG.STAGE.COUNT) {
                this.stage++;
                this.scrollSpeed += CONFIG.SCROLL.STAGE_SPEED_INCREASE;
            }
        }
    }

    // 攻撃・バリア効果時間の処理
    updateBuffs(dt) {
        if (this.fireBoostActive) {
            this.fireBoostTime -= dt;
            if (this.fireBoostTime <= 0) {
                this.fireBoostActive = false;
                this.fireInterval = CONFIG.FIRE.INTERVAL_NORMAL;
            }
        }

        if (this.barrierActive) {
            this.barrierTime -= dt;
            if (this.barrierTime <= 0) {
                this.barrierActive = false;
            }
        }
    }
}
