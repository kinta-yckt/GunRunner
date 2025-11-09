import Game from "./game.js";

const game = new Game();

let last = performance.now();

function frame(now) {
    const dt = Math.min(32, now - last);
    last = now;

    if (game.state.running) {
        game.update(dt);
        game.draw();
    }

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

document.addEventListener("visibilitychange", () => {
    if (document.hidden && game.state.running) game.togglePause();
});
