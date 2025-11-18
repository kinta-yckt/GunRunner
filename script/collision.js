import Item from "./item.js";

export default class Input {

    constructor(game) {
        this.game = game;
    }
    handleCollisions() {
        const p = this.game.player;
        const s = this.game.state;

        // ---- bullet vs enemy ----
        // bullet vs enemy
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
                        s.score += 10 * e.tier;

                        const types = ["speed", "barrier", "heal"];
                        const type = types[Math.floor(Math.random() * types.length)];
                        this.game.items.push(new Item(e.x, e.y, this.game, type));
                    }
                }
            });
        });


        // ---- バリアをこのフレームで使ったか ----
        let usedBarrier = false;

        // --- enemy vs player ---
        for (const e of this.game.enemies) {
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
                    this.game.flash(200);
                    this.game.invul = 200;        // 連続当たり防止の短い無敵
                    return;                  // ← このフレームの残り衝突処理を打ち切る
                }

                // ★ バリアがないときだけ通常ダメージ
                if (this.game.invul === 0) {
                    e.alive = false;
                    s.lives--;
                    this.game.flash(160);
                    this.game.invul = 400;
                    if (s.lives <= 0) this.game.gameOver();
                    return;                  // このフレームの衝突処理は終わり
                }
            }
        }

        // --- obstacle vs player ---
        for (const o of this.game.obstacles) {
            if (
                p.x < o.x + o.w &&
                p.x + p.w > o.x &&
                p.y < o.y + o.h &&
                p.y + p.h > o.y
            ) {
                // ★ バリアがあればノーダメで消費して終了
                if (s.barrierActive) {
                    s.barrierActive = false;
                    this.game.flash(200);
                    this.game.invul = 200;  // 連続ヒット防止
                    return;
                }

                // ★ バリアがないときだけ減る
                if (this.game.invul === 0) {
                    s.lives--;
                    this.game.flash(160);
                    this.game.invul = 400;
                    if (s.lives <= 0) this.game.gameOver();
                    return;
                }
            }
        }


        // ---- item pickup ----
        for (const it of this.game.items) {
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
}