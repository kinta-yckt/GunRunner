import Item from "./item.js";

export default class Input {

    constructor(game) {
        this.game = game;
        this.p = this.game.player;
        this.s = this.game.state;
    }
    handleCollisions() {
        this.battleBulletVsEnemy();
        this.battleEnemyVsPlayer();
        this.battleObstacleVsPlayer();
        this.pickItem();
    }

    battleBulletVsEnemy() {
        this.game.bullets.forEach((b) => {
            if (!b.alive) return;

            this.game.enemies.forEach((e) => {
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
                        this.s.score += 10 * e.tier;

                        const types = ["speed", "barrier", "heal"];
                        const type = types[Math.floor(Math.random() * types.length)];
                        this.game.items.push(new Item(e.x, e.y, this.game, type));
                    }
                }
            });
        });
    }

    battleEnemyVsPlayer() {
        for (const e of this.game.enemies) {
            if (!e.alive) continue;

            if (
                this.p.x < e.x + e.w &&
                this.p.x + this.p.w > e.x &&
                this.p.y < e.y + e.h &&
                this.p.y + this.p.h > e.y
            ) {
                // ★ バリアがあればダメージを完全無効化して即返す
                if (this.s.barrierActive) {
                    this.s.barrierActive = false; // バリア消費
                    e.alive = false;         // 触れた敵は消す
                    this.game.flash(200);
                    this.game.invul = 200;        // 連続当たり防止の短い無敵
                    return;                  // ← このフレームの残り衝突処理を打ち切る
                }

                // ★ バリアがないときだけ通常ダメージ
                if (this.game.invul === 0) {
                    e.alive = false;
                    this.s.lives--;
                    this.game.flash(160);
                    this.game.invul = 400;
                    if (this.s.lives <= 0) this.game.gameOver();
                    return;                  // このフレームの衝突処理は終わり
                }
            }
        }
    }

    battleObstacleVsPlayer() {
        for (const o of this.game.obstacles) {
            if (
                this.p.x < o.x + o.w &&
                this.p.x + this.p.w > o.x &&
                this.p.y < o.y + o.h &&
                this.p.y + this.p.h > o.y
            ) {
                // ★ バリアがあればノーダメで消費して終了
                if (this.s.barrierActive) {
                    this.s.barrierActive = false;
                    this.game.flash(200);
                    this.game.invul = 200;  // 連続ヒット防止
                    return;
                }

                // ★ バリアがないときだけ減る
                if (this.game.invul === 0) {
                    this.s.lives--;
                    this.game.flash(160);
                    this.game.invul = 400;
                    if (this.s.lives <= 0) this.game.gameOver();
                    return;
                }
            }
        }
    }

    pickItem() {
        for (const it of this.game.items) {
            if (!it.alive) continue;

            if (
                this.p.x < it.x + it.w &&
                this.p.x + this.p.w > it.x &&
                this.p.y < it.y + it.h &&
                this.p.y + this.p.h > it.y
            ) {
                it.alive = false;

                if (it.type === "speed") {
                    this.s.fireBoostActive = true;
                    this.s.fireInterval = this.s.fireIntervalBoost;
                }

                if (it.type === "barrier") {
                    this.s.barrierActive = true;
                }

                if (it.type === "heal") {
                    this.s.lives = Math.min(3, this.s.lives + 1);
                }
            }
        }
    }
}