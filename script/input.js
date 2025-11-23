export default class Input {

    constructor(game) {
        this.game = game;
        this.jumpKeyDown = false;

        window.addEventListener(
            "keydown",
            (e) => {
                if (["ArrowUp", "Space", "KeyW"].includes(e.code)) {
                    e.preventDefault();
                    if (!this.jumpKeyDown) {
                        this.jumpKeyDown = true;
                        this.game.player.tryJump(this.state);
                    }
                }
                if (e.code === "KeyP") this.game.togglePause();
            },
            { passive: false }
        );

        window.addEventListener("keyup", (e) => {
            if (["ArrowUp", "Space", "KeyW"].includes(e.code)) {
                this.jumpKeyDown = false;
                this.game.player.jumpHolding = false;
            }
        });

        document.getElementById("pauseBtn")
            .addEventListener("click", () => this.game.togglePause());
        document.getElementById("restartBtn")
            .addEventListener("click", () => this.game.restart());

        //----------------------------------
        // ボタンフォーカス制御（左右キー）
        //----------------------------------
        const pauseBtn = document.getElementById("pauseBtn");
        const restartBtn = document.getElementById("restartBtn");

        // ★ ゲーム開始時に Pause をフォーカス
        pauseBtn.focus();

        // 現在どちらのボタンにいるか管理
        let focusIndex = 0;  // 0 = pause, 1 = restart

        window.addEventListener("keydown", (e) => {
            // 左右キーのみ反応
            if (e.code === "ArrowRight") {
                focusIndex = 1;
                restartBtn.focus();
            }
            if (e.code === "ArrowLeft") {
                focusIndex = 0;
                pauseBtn.focus();
            }
        });
    }




}