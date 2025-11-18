// ======================================================
// collision.js
// 当たり判定関連を管理
// ======================================================

import { CONFIG } from "./config.js";
import Item from "./item.js";

export default class CollisionManager {
    constructor(game) {
        this.game = game;
    }

    update() {
        this.handleBulletEnemy();
        this.handleEnemyPlayer();
        this.handleObstaclePlayer();
        this.handleItemPickup();
    }

    // ------------------------------------------------------
    // 弾丸 vs 敵
    // ------------------------------------------------------
    handleBulletEnemy() {
        const { bullets, enemies, state, items } = this.game;

        bullets.forEach((b) => {
            if (!b.alive) return;

            enemies.forEach((e) => {
                if (!e.alive) return;

                if (
                    b.x < e.x + e.w &&
                    b.x + 10 > e.x &&
                    b.y < e.y + e.h &&
                    b.y + 2 > e.y
                ) {
                    b.alive = false;
                    e.hp -= 1;

                    // HPが0で敵撃破
                    if (e.hp <= 0) {
                        e.alive = false;
                        state.score += CONFIG.SCORE.ENEMY;

                        // ランダムでアイテムをドロップ
                        const types = ["speed", "barrier", "heal"];
                        const type = types[Math.floor(Math.random() * types.length)];
                        items.push(new Item(e.x, e.y, this.game, type));
                    }
                }
            });
        });
    }

    // ------------------------------------------------------
    // 敵 vs プレイヤー
    // ------------------------------------------------------
    handleEnemyPlayer() {
        const { player: p, enemies, state } = this.game;

        enemies.forEach((e) => {
            if (!e.alive) return;

            if (
                p.x < e.x + e.w &&
                p.x + p.w > e.x &&
                p.y < e.y + e.h &&
                p.y + p.h > e.y
            ) {
                if (state.barrierActive) {
                    state.barrierActive = false;
                    e.alive = false;
                    this.game.flash(200);
                    return;
                }

                if (state.invul === 0) {
                    e.alive = false;
                    state.lives -= 1;
                    this.game.flash(160);
                    state.invul = 400;
                    if (state.lives <= 0) this.game.gameOver();
                }
            }
        });
    }

    // ------------------------------------------------------
    // 障害物 vs プレイヤー
    // ------------------------------------------------------
    handleObstaclePlayer() {
        const { player: p, obstacles, state } = this.game;

        obstacles.forEach((o) => {
            if (
                p.x < o.x + o.w &&
                p.x + p.w > o.x &&
                p.y < o.y + o.h &&
                p.y + p.h > o.y
            ) {
                if (state.barrierActive) {
                    state.barrierActive = false;
                    this.game.flash(200);
                    return;
                }

                if (state.invul === 0) {
                    state.lives -= 1;
                    this.game.flash(160);
                    state.invul = 400;
                    if (state.lives <= 0) this.game.gameOver();
                }
            }
        });
    }

    // ------------------------------------------------------
    // プレイヤー vs アイテム
    // ------------------------------------------------------
    handleItemPickup() {
        const { player: p, items, state } = this.game;

        items.forEach((it) => {
            if (!it.alive) return;

            if (
                p.x < it.x + it.w &&
                p.x + p.w > it.x &&
                p.y < it.y + it.h &&
                p.y + p.h > it.y
            ) {
                it.alive = false;

                switch (it.type) {
                    case "speed":
                        state.fireBoostActive = true;
                        state.fireBoostTime = 5000;
                        state.fireInterval = CONFIG.FIRE.INTERVAL_BOOST;
                        break;

                    case "barrier":
                        state.barrierActive = true;
                        state.barrierTime = 9999999; // 時間で消えない
                        break;

                    case "heal":
                        state.lives = Math.min(CONFIG.LIVES.MAX, state.lives + 1);
                        break;
                }
            }
        });
    }
}
