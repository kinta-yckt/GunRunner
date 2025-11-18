// ======================================================
// config.js
// 定数・設定値の集中管理
// ======================================================

export const CONFIG = {
    CANVAS: {
        MAX_WIDTH: 900,
        HEIGHT_RATIO: 0.8,
    },

    PLAYER: {
        WIDTH: 26,
        HEIGHT: 64,
        JUMP_VELOCITY: -0.9,
        GRAVITY: 0.0025,
    },

    SCROLL: {
        BASE_SPEED: 0.35,
        STAGE_SPEED_INCREASE: 0.05,
    },

    FIRE: {
        INTERVAL_NORMAL: 800,
        INTERVAL_BOOST: 300,
    },

    STAGE: {
        COUNT: 10,
        DURATION: 40000, // ms
        COLORS: [
            ["#87CEFA", "#98FB98"],
            ["#e1741cff", "#A1FFA1"],
            ["#0e7a04ff", "#B4FFB4"],
            ["#f3faf9ff", "#C4FFC4"],
            ["#da59eeff", "#D0FFD0"],
            ["#14053eff", "#D8FFE0"],
            ["#222cf3ff", "#FFEAB0"],
            ["#ebe80eff", "#FFD580"],
            ["#72f0eaff", "#FFC060"],
            ["#541003ff", "#FFA840"],
        ],
    },

    SPAWN: {
        ENEMY_BASE_INTERVAL: 2000,
        OBSTACLE_BASE_INTERVAL: 2000,
        MIN_INTERVAL: 200,
    },

    SCORE: {
        ENEMY: 10,
        ITEM: 50,
    },

    LIVES: {
        MAX: 5,
        START: 3,
    },
};
