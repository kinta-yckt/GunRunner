// ======================================================
// main.js
// エントリーポイント（ゲームループ）
// ======================================================

import Game from "./game.js";

const game = new Game();

let last = performance.now();

function frame(now) {
    const dt = Math.min(32, now - last);
    last = now;
    if (game.state.running) {
        game.update(dt);
        game.draw();
    } else {
        // 停止中でも描画は継続（GAME OVER などの表示）
        game.draw();
    }

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

// タブ非表示になったら一時停止
document.addEventListener("visibilitychange", () => {
    if (document.hidden && game.state.running) game.togglePause();
});
