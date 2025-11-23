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
        const w = canvas.width;
        const off = ((-game.bg.far % w) + w) % w;
        Renderer.drawHills(game, off);
        Renderer.drawHills(game, off - w);
    }

    static drawHills(game, xOffset) {
        const { ctx, canvas, state, DPR } = game;
        const w = canvas.width;
        const h = canvas.height;

        const groundY = h - state.groundH * DPR;
        const baseY = groundY - 350 * DPR;

        ctx.fillStyle = "#014a4aff";
        ctx.beginPath();

        // 開始
        ctx.moveTo(xOffset, groundY);

        // ★ ここで完全シームレスな山を生成する（sin波）
        const amp = 30 * DPR;    // 山の高さ
        const freq = (Math.PI * 2) / w; // 周期＝ちょうど w で繋がる

        for (let x = 0; x <= w; x += 8) {
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

        const headR = Math.floor(p.w * 0.3);

        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + headR + 4, headR, 0, Math.PI * 2);
        ctx.stroke();

        const neckY = p.y + headR * 2 + 6;
        const hipY = p.y + p.h - 30;

        ctx.beginPath();
        ctx.moveTo(p.x + p.w / 2, neckY);
        ctx.lineTo(p.x + p.w / 2, hipY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p.x + p.w / 2, neckY + 8);
        ctx.lineTo(p.x + p.w + 10 * DPR, neckY + 2);
        ctx.stroke();

        // --- 脚（左右対称の自然な走りアニメ） ---
        const stride = Math.sin(state.time / 140) * 10 * DPR;

        // 足の付け根
        const hipX = p.x + p.w / 2;
        const hipY_local = hipY;

        // 基本角度と足の長さ
        const legLengthX = 10;  // 前後の開き量（左右共通）
        const legLengthY = p.y + p.h - hipY_local;  // 足先の高さ距離（左右共通）

        // === 前足（右足） ===
        ctx.beginPath();
        ctx.moveTo(hipX, hipY_local);
        ctx.lineTo(
            hipX + legLengthX + stride,
            hipY_local + legLengthY
        );
        ctx.stroke();

        // === 後足（左足） ===
        ctx.beginPath();
        ctx.moveTo(hipX, hipY_local);
        ctx.lineTo(
            hipX - legLengthX - stride,
            hipY_local + legLengthY
        );
        ctx.stroke();

        // ★ バリアがアクティブなら輪郭を強調して描く（縁取り＋オーラ）
        if (game.state.barrierActive) {
            const ctx = game.ctx;
            const p = game.player;

            const cx = p.x + p.w / 2;
            const cy = p.y + p.h / 2;
            const radius = Math.max(p.w, p.h) * 0.6;

            ctx.save();

            // === ① 外側のクッキリ縁取り ===
            ctx.strokeStyle = "#00ffff";           // くっきりシアン
            ctx.lineWidth = 1 * game.DPR;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();

            // === ② 内側の淡い光（オーラ） ===
            ctx.strokeStyle = "rgba(0, 255, 255, 0.35)";  // 半透明シアン
            ctx.lineWidth = 18 * game.DPR;                // 太めのぼかし線
            ctx.beginPath();
            ctx.arc(cx, cy, radius - 12, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }

    }

    static drawEnemy(game, e) {
        const ctx = game.ctx;
        const x = e.x;
        const y = e.y;
        const w = e.w;
        const h = e.h;

        ctx.save();
        ctx.strokeStyle = "#ffffff";       // 棒人間と同じ色
        ctx.lineWidth = 5 * game.DPR;    // 棒人間と近い太さ
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        ctx.beginPath();

        // === 胴体（横棒） ===
        ctx.moveTo(x + w * 0.8, y + h * 0.5);
        ctx.lineTo(x + w * 0.5, y + h * 0.5);

        // === 主翼（上） ===
        ctx.moveTo(x + w * 0.6, y + h * 0.5);
        ctx.lineTo(x + w * 0.75, y + h * 0.25);

        // === 主翼（下） ===
        ctx.moveTo(x + w * 0.6, y + h * 0.5);
        ctx.lineTo(x + w * 0.75, y + h * 0.75);

        // === 尾翼（上） ===
        ctx.moveTo(x + w * 0.85, y + h * 0.5);
        ctx.lineTo(x + w * 0.92, y + h * 0.35);

        // === 尾翼（下） ===
        ctx.moveTo(x + w * 0.85, y + h * 0.5);
        ctx.lineTo(x + w * 0.92, y + h * 0.65);

        ctx.stroke();
        ctx.restore();

        // ★ バリアがアクティブなら輪郭を強調して描く（縁取り＋オーラ）
        if (e.hasBarrier) {
            const ctx = game.ctx;

            const cx = e.x + e.w / 1.4;
            const cy = e.y + e.h / 1.9;
            const radius = Math.max(e.w, e.h) * 0.3;

            ctx.save();

            // === ① 外側のクッキリ縁取り ===
            ctx.strokeStyle = "#00ffff";           // くっきりシアン
            ctx.lineWidth = 3 * game.DPR;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();

            // === ② 内側の淡い光（オーラ） ===
            ctx.strokeStyle = "rgba(0, 255, 255, 0.35)";  // 半透明シアン
            ctx.lineWidth = 7 * game.DPR;                // 太めのぼかし線
            ctx.beginPath();
            ctx.arc(cx, cy, radius - 15, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }
    }

    static drawObstacle(game, o) {
        const { ctx } = game;

        const x = Math.round(o.x);
        const y = Math.round(o.y);
        const w = Math.round(o.w);
        const h = Math.round(o.h);

        ctx.fillStyle = "#000";
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = "#e8eaed"; // 白い縁
        ctx.lineWidth = 2 * game.DPR;
        ctx.strokeRect(x, y, w, h);
    }

    static drawItem(game, item) {
        const ctx = game.ctx;
        const x = item.x;
        const y = item.y;
        const w = item.w;
        const h = item.h;

        ctx.lineWidth = 2 * game.DPR;
        ctx.strokeStyle = "#ffffff";

        // ======== 1) 連射速度アップ：弾薬（bullet） ========
        if (item.type === "speed") {
            ctx.fillStyle = "#ffae00"; // 弾の色（オレンジ）

            ctx.beginPath();
            // 左側：丸い先端
            ctx.arc(x + w * 0.3, y + h * 0.5, w * 0.3, Math.PI / 2, -Math.PI / 2, true);
            // 右側：後部ケース
            ctx.lineTo(x + w * 0.9, y + h * 0.2);
            ctx.arc(x + w * 0.9, y + h * 0.5, w * 0.3, -Math.PI / 2, Math.PI / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            return;
        }

        // ======== 2) バリア（Barrier） ========
        if (item.type === "barrier") {
            ctx.fillStyle = "rgba(100, 200, 255, 0.35)"; // 半透明ブルー

            ctx.beginPath();
            ctx.arc(x + w / 2, y + h / 2, w * 0.45, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            return;
        }

        // ======== 3) 回復：薬（capsule） ========
        if (item.type === "heal") {
            const mid = y + h * 0.5;

            // 上半分（赤）
            ctx.fillStyle = "#ff5c5c";
            ctx.beginPath();
            ctx.moveTo(x + w * 0.2, mid);
            ctx.lineTo(x + w * 0.2, y + h * 0.3);
            ctx.arc(x + w * 0.5, y + h * 0.3, w * 0.3, Math.PI, 0);
            ctx.lineTo(x + w * 0.8, mid);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // 下半分（白）
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(x + w * 0.2, mid);
            ctx.lineTo(x + w * 0.2, y + h * 0.7);
            ctx.arc(x + w * 0.5, y + h * 0.7, w * 0.3, Math.PI, 0, true);
            ctx.lineTo(x + w * 0.8, mid);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            return;
        }
    }

    static drawGameOver(game) {
        const ctx = game.ctx;
        const w = game.canvas.width;
        const h = game.canvas.height;

        // 背景に薄く黒を敷く
        ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        ctx.fillRect(0, 0, w, h);

        // 文字スタイル
        ctx.fillStyle = "#ffffff";
        ctx.font = `${40 * game.DPR}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText("GAME OVER", w / 2, h / 2);
    }

    static drawStageView(game) {
        const ctx = game.ctx;
        const w = game.canvas.width;
        const h = game.canvas.height;

        // 文字スタイル
        ctx.fillStyle = "#ffffff";
        ctx.font = `${24 * game.DPR}px Arial`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        ctx.fillText(`Stage ${game.state.stage}`, 20 * game.DPR, 20 * game.DPR);
    }
}
