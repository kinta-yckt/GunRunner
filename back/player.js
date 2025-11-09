export default class Player {
    constructor(game) {
        this.w = 26;
        this.h = 64;
        this.x = 120;
        this.y = 0;
        this.vy = 0;

        this.jumpVel = -0.3; // ← 最大ジャンプ高さはこれで決まる
        this.onGround = false;
        this.coyote = 0;

        // ▼ 可変ジャンプ追加
        this.jumpHolding = false;     // 押しっぱなし中か？
        this.jumpHoldTime = 0;        // 押した時間
        this.jumpHoldMax = 300;       // 最大何msまで上昇補助する？

        this.reset(game);
    }

    reset(game) {
        const g = game;
        this.x = 120;
        this.vy = 0;
        this.onGround = true;
        this.jumpHolding = false;
        this.jumpHoldTime = 0;

        this.y = g.canvas.height - g.state.groundH * g.DPR - this.h;
    }

    tryJump(state) {
        if (this.onGround || state.time - this.coyote < 120) {

            // 基本ジャンプ
            this.vy = this.jumpVel * window.devicePixelRatio;
            this.onGround = false;

            // 可変ジャンプの開始
            this.jumpHolding = true;
            this.jumpHoldTime = 0;

        }
    }


    update(dt, game) {
        const g = game;

        // ▼ 可変ジャンプ：押している間だけ上昇補助
        if (this.jumpHolding) {
            this.jumpHoldTime += dt;

            // 一定時間だけ上昇力を追加
            if (this.jumpHoldTime < this.jumpHoldMax) {
                this.vy -= 0.003 * dt * g.DPR;
            }
        }

        // ▼ 重力
        this.vy += g.state.gravity * dt * g.DPR;
        this.y += this.vy * dt;

        // ▼ 着地
        const groundY = g.canvas.height - g.state.groundH * g.DPR - this.h;

        if (this.y >= groundY) {
            this.y = groundY;
            this.vy = 0;

            if (!this.onGround) this.coyote = g.state.time;
            this.onGround = true;

            // 着地でホールド終了
            this.jumpHolding = false;
            this.jumpHoldTime = 0;
        }
    }
}
