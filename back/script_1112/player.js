// ======================================================
// player.js
// プレイヤー（棒人間）とジャンプ制御
// ======================================================

import { CONFIG } from "./config.js";

export default class Player {
    constructor(game) {
        this.game = game;
        this.w = CONFIG.PLAYER.WIDTH;
        this.h = CONFIG.PLAYER.HEIGHT;
        this.x = 120;
        this.y = 0;
        this.vy = 0;
        this.onGround = false;
        this.jumpHolding = false;   // variable jump
        this.coyote = 0;            // coyote time
        this.reset(game);
    }

    reset(game) {
        const g = game;
        this.x = 120;
        this.vy = 0;
        this.onGround = true;
        this.jumpHolding = false;
        this.y = g.canvas.height - g.state.groundH * g.DPR - this.h;
    }

    tryJump(state) {
        // 1 press → 1 jump（押しっぱなし多重防止は input.js 側で）
        if (this.onGround || state.time - this.coyote < 120) {
            this.vy = CONFIG.PLAYER.JUMP_VELOCITY * window.devicePixelRatio;
            this.onGround = false;
            this.jumpHolding = true; // 押下直後は保持中
        }
    }

    update(dt, game) {
        // 可変ジャンプ: 押し続け中は重力を弱め、離したら通常重力
        const g = this.jumpHolding ? CONFIG.PLAYER.GRAVITY * 0.45 : CONFIG.PLAYER.GRAVITY;

        this.vy += g * dt * game.DPR;
        this.y += this.vy * dt;

        const groundY = game.canvas.height - game.state.groundH * game.DPR - this.h;

        if (this.y >= groundY) {
            this.y = groundY;
            this.vy = 0;
            if (!this.onGround) this.coyote = game.state.time;
            this.onGround = true;
            this.jumpHolding = false;
        }
    }
}
