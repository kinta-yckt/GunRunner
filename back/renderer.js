export default class Renderer {
    static drawBackground(game) {
        const { ctx, canvas, state } = game;

        // ★ ステージ番号に応じたグラデーション取得
        const colors = game.stageColors[state.stage - 1];
        const topColor = colors[0];
        const bottomColor = colors[1];

        const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
        sky.addColorStop(0, topColor);
        sky.addColorStop(1, bottomColor);

        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 山の描画（そのまま）
        Renderer.drawHills(game, (-game.bg.far % canvas.width));
        Renderer.drawHills(game, (-game.bg.far % canvas.width) + canvas.width);
    }

    static drawHills(game, xOffset) {
        const { ctx, canvas, state, DPR } = game;
        const w = canvas.width;
        const h = canvas.height;

        const groundY = h - state.groundH * DPR;
        const baseY = groundY - 220 * DPR;

        ctx.fillStyle = "#014a4aff";
        ctx.beginPath();

        // 開始
        ctx.moveTo(xOffset, groundY);

        // ★ ここで完全シームレスな山を生成する（sin波）
        const amp = 30 * DPR;    // 山の高さ
        const freq = (Math.PI * 2) / w; // 周期＝ちょうど w で繋がる

        for (let x = 0; x <= w; x += 20) {
            // const y = baseY + Math.sin((x) * freq) * amp;
            const y = baseY
                + Math.sin(x * freq) * amp
                + Math.sin(x * freq * 2) * (amp * 0.3);
            ctx.lineTo(xOffset + x, y);
        }

        // 下まで閉じる
        ctx.lineTo(xOffset + w, groundY);
        ctx.lineTo(xOffset, groundY);
        ctx.closePath();
        ctx.fill();
    }

    static drawGround(game) {
        const { ctx, canvas, state, DPR } = game;

        const y = canvas.height - state.groundH * DPR;

        // ▼ 地面：真っ黒
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, y, canvas.width, state.groundH * DPR);

        // ▼ 地面の境界線（白・棒人間と同じカラー）
        ctx.strokeStyle = "#e8eaed";   // ←棒人間の線色と同じ
        ctx.lineWidth = 2 * DPR;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    static drawPlayer(game) {
        const { ctx, state, DPR } = game;
        const p = game.player;

        ctx.strokeStyle = "#e8eaed";
        ctx.lineWidth = Math.max(2, 2 * DPR);

        const headR = Math.floor(p.w * 0.45);

        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + headR + 2, headR, 0, Math.PI * 2);
        ctx.stroke();

        const neckY = p.y + headR * 2 + 6;
        const hipY = p.y + p.h - 10;

        ctx.beginPath();
        ctx.moveTo(p.x + p.w / 2, neckY);
        ctx.lineTo(p.x + p.w / 2, hipY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p.x + p.w / 2, neckY + 8);
        ctx.lineTo(p.x + p.w + 10 * DPR, neckY + 2);
        ctx.stroke();

        const stride = Math.sin(state.time / 160) * 8 * DPR;

        ctx.beginPath();
        ctx.moveTo(p.x + p.w / 2, hipY);
        ctx.lineTo(p.x + 3 + stride, p.y + p.h);
        ctx.moveTo(p.x + p.w / 2, hipY);
        ctx.lineTo(p.x - 6 - stride, p.y + p.h);
        ctx.stroke();
    }

    static drawEnemy(game, e) {
        const { ctx } = game;

        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.w, e.h);

        ctx.fillStyle = "rgba(0,0,0,.35)";
        for (let i = 0; i < e.hp; i++)
            ctx.fillRect(e.x + 3 + i * 6, e.y + 3, 4, 3);
    }

    static drawObstacle(game, o) {
        const { ctx, DPR } = game;

        // ▼ 真っ黒の中身
        ctx.fillStyle = "#000000";
        ctx.fillRect(o.x, o.y, o.w, o.h);

        // ▼ 白い縁取り（棒人間と同じ色）
        ctx.strokeStyle = "#e8eaed";
        ctx.lineWidth = 2 * DPR;
        ctx.strokeRect(o.x, o.y, o.w, o.h);
    }
}
