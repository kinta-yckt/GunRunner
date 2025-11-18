// ======================================================
// input.js
// 入力イベントを管理
// ======================================================

export default class InputManager {
    constructor(game) {
        this.game = game;
        this.jumpKeyDown = false;
    }

    init() {
        window.addEventListener(
            "keydown",
            (e) => {
                if (["ArrowUp", "Space", "KeyW"].includes(e.code)) {
                    e.preventDefault();
                    if (!this.jumpKeyDown) {
                        this.jumpKeyDown = true;
                        this.game.player.tryJump(this.game.state);
                    }
                }

                // Pause
                if (e.code === "KeyP") this.game.togglePause();

                // Restart
                if (e.code === "Enter") this.game.restart();
            },
            { passive: false }
        );

        window.addEventListener("keyup", (e) => {
            if (["ArrowUp", "Space", "KeyW"].includes(e.code)) {
                this.jumpKeyDown = false;
                this.game.player.jumpHolding = false;
            }
        });

        // UIボタンイベント
        document.getElementById("pauseBtn")
            ?.addEventListener("click", () => this.game.togglePause());
        document.getElementById("restartBtn")
            ?.addEventListener("click", () => this.game.restart());
    }
}
