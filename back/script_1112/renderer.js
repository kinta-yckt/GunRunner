// ======================================================
// renderer.js
// 背景・キャラ・UI の描画
// ======================================================

import { CONFIG } from "./config.js";

export default class Renderer {
    // ------- 背景 -------
    static drawBackground(game) {
        const { ctx, canvas, state } = game;

        // ステージの色
        const colors = CONFIG.STAGE.COLORS[state.stage - 1] || CONFIG.STAGE.COLORS[0];
        const [topColor, bottomColor] = colors;

        // 空
        const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
        sky.addColorStop(0, topColor);
        sky.addColorStop(1, bottomColor);
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // パララックスの山（シームレス）
        const w = canvas.width;
        const off = ((-game.bg.far % w) + w) % w;
        Renderer.drawHills(game, off);
        Renderer.drawHills(game, off - w);
    }

    static drawHills(game, xOffset) {
        const { ctx, canvas, state, DPR } = game;

        const groundY = canvas.height - state.groundH * DPR;
        const baseY = groundY - 320 * DPR;
        const amp = 28 * DPR;
        const freq = (Math.PI * 2) / canvas.width;

        ctx.fillStyle = "#014a4a";
        ctx.beginPath();
        ctx.moveTo(xOffset, groundY);

        for (let x = 0; x <= canvas.width; x += 8) {
            const y =
                baseY +
                Math.sin(x * freq) * amp +
                Math.sin(x * freq * 2) * (amp * 0.35);
            ctx.lineTo(xOffset + x, y);
        }

        ctx.lineTo(xOffset + canvas.width, groundY);
        ctx.lineTo(xOffset, groundY);
        ctx.closePath();
        ctx.fill();
    }

    // ------- 地面 -------
    static drawGround(game) {
        const { ctx, canvas, state, DPR } = game;
        const y = canvas.height - state.groundH * DPR;

        // 真っ黒
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, y, canvas.width, state.groundH * DPR);

        // 境界線（白）
        ctx.strokeStyle = "#e8eaed";
        ctx.lineWidth = 2 * DPR;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // ------- プレイヤー -------
    static drawPlayer(game) {
        console.log("drawPlayer実行中", game.player.x, game.player.y);
        const { ctx, state, DPR } = game;
        const p = game.player;

        // 棒人間
        ctx.strokeStyle = "#e8eaed";
        ctx.lineWidth = Math.max(2, 2 * DPR);

        const headR = Math.floor(p.w * 0.3);

        // head
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + headR + 4, headR, 0, Math.PI * 2);
        ctx.stroke();

        const neckY = p.y + headR * 2 + 6;
        const hipY = p.y + p.h - 30;

        // body
        ctx.beginPath();
        ctx.moveTo(p.x + p.w / 2, neckY);
        ctx.lineTo(p.x + p.w / 2, hipY);
        ctx.stroke();

        // arm+gun
        ctx.beginPath();
        ctx.moveTo(p.x + p.w / 2, neckY + 8);
        ctx.lineTo(p.x + p.w + 10 * DPR, neckY + 2);
        ctx.stroke();

        // legs（棒）
        const stride = Math.sin(state.time / 140) * 10 * DPR;
        const hipX = p.x + p.w / 2;

        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX + 10 + stride, p.y + p.h);
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX - 10 - stride, p.y + p.h);
        ctx.stroke();

        // バリア（オーラ＋縁取り）
        if (state.barrierActive) {
            const radius = Math.max(p.w, p.h) * 0.9;
            const cx = p.x + p.w / 2;
            const cy = p.y + p.h / 2;

            // 外側グロー
            ctx.save();
            ctx.strokeStyle = "rgba(8, 248, 248, 0.35)";
            ctx.lineWidth = 12 * DPR;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();

            // くっきり縁
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 4 * DPR;
            ctx.beginPath();
            ctx.arc(cx, cy, radius - 4 * DPR, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    // ------- 敵 -------
    static drawEnemy(game, e) {
        const ctx = game.ctx;
        const { x, y, w, h } = e;

        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4 * game.DPR;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        ctx.beginPath();
        // 胴体（左向き：右→左）
        ctx.moveTo(x + w * 0.9, y + h * 0.5);
        ctx.lineTo(x + w * 0.5, y + h * 0.5);

        // 主翼
        ctx.moveTo(x + w * 0.6, y + h * 0.5);
        ctx.lineTo(x + w * 0.75, y + h * 0.25);
        ctx.moveTo(x + w * 0.6, y + h * 0.5);
        ctx.lineTo(x + w * 0.75, y + h * 0.75);

        // 尾翼
        ctx.moveTo(x + w * 0.85, y + h * 0.5);
        ctx.lineTo(x + w * 0.92, y + h * 0.35);
        ctx.moveTo(x + w * 0.85, y + h * 0.5);
        ctx.lineTo(x + w * 0.92, y + h * 0.65);

        ctx.stroke();
        ctx.restore();
    }

    // ------- 弾 -------
    static drawBullet(game, b) {
        const ctx = game.ctx;
        ctx.fillStyle = "#a8c7ff";
        ctx.fillRect(b.x, b.y, 15 * game.DPR, 4 * game.DPR);
    }

    // ------- 障害物 -------
    static drawObstacle(game, o) {
        const ctx = game.ctx;
        const x = Math.round(o.x);
        const y = Math.round(o.y);
        const w = Math.round(o.w);
        const h = Math.round(o.h);

        ctx.fillStyle = "#000000";
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = "#e8eaed";
        ctx.lineWidth = 2 * game.DPR;
        ctx.strokeRect(x, y, w, h);
    }

    // ------- アイテム -------
    static drawItem(game, item) {
        const ctx = game.ctx;
        const { x, y, w, h } = item;

        ctx.lineWidth = 2 * game.DPR;
        ctx.strokeStyle = "#ffffff";

        if (item.type === "speed") {
            // 弾薬っぽい
            ctx.fillStyle = "#ffae00";
            ctx.beginPath();
            ctx.arc(x + w * 0.3, y + h * 0.5, w * 0.3, Math.PI / 2, -Math.PI / 2, true);
            ctx.lineTo(x + w * 0.9, y + h * 0.2);
            ctx.arc(x + w * 0.9, y + h * 0.5, w * 0.3, -Math.PI / 2, Math.PI / 2);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            return;
        }

        if (item.type === "barrier") {
            // シールド球
            ctx.fillStyle = "rgba(100, 200, 255, 0.35)";
            ctx.beginPath();
            ctx.arc(x + w / 2, y + h / 2, w * 0.45, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            return;
        }

        if (item.type === "heal") {
            // カプセル
            const mid = y + h * 0.5;
            ctx.fillStyle = "#ff5c5c";
            ctx.beginPath();
            ctx.moveTo(x + w * 0.2, mid);
            ctx.lineTo(x + w * 0.2, y + h * 0.3);
            ctx.arc(x + w * 0.5, y + h * 0.3, w * 0.3, Math.PI, 0);
            ctx.lineTo(x + w * 0.8, mid);
            ctx.closePath();
            ctx.fill(); ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(x + w * 0.2, mid);
            ctx.lineTo(x + w * 0.2, y + h * 0.7);
            ctx.arc(x + w * 0.5, y + h * 0.7, w * 0.3, Math.PI, 0, true);
            ctx.lineTo(x + w * 0.8, mid);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            return;
        }
    }

    // ------- GAME OVER -------
    static drawGameOver(game) {
        const { ctx, canvas } = game;

        // フェードイン用のアルファ（ゆっくり）
        const t = Math.min(1, (game.state.time % 1200) / 1200);
        ctx.save();
        ctx.globalAlpha = t;

        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ff2d2d";
        ctx.font = `${Math.floor(48 * game.DPR)}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40 * game.DPR);

        ctx.restore();
    }
}
