// ======================================================
// state.js
// ゲーム全体の状態を保持・リセットする
// ======================================================

import { CONFIG } from "./config.js";

export default class GameState {
    constructor() {
        this.reset();
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
