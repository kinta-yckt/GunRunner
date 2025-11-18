// ======================================================
// spawner.js
// 敵・障害物・アイテムの出現管理
// ======================================================

import Enemy from "./enemy.js";
import Obstacle from "./obstacle.js";
import Item from "./item.js";
import { CONFIG } from "./config.js";

export default class Spawner {
    constructor(game) {
        this.game = game;
        this.nextEnemy = 800;
        this.nextObstacle = 1200;
    }

    update(dt) {
        this.nextEnemy -= dt;
        this.nextObstacle -= dt;

        if (this.nextEnemy <= 0) {
            this.game.enemies.push(new Enemy(this.game));
            this.scheduleNextEnemy();
        }

        if (this.nextObstacle <= 0) {
            const makeAir = this.game.state.stage >= 2 && Math.random() < 0.4;
            this.game.obstacles.push(new Obstacle(this.game, makeAir));
            this.scheduleNextObstacle();
        }
    }

    scheduleNextEnemy() {
        const base = CONFIG.SPAWN.ENEMY_BASE_INTERVAL - this.game.state.stage * 40;
        this.nextEnemy = Math.max(CONFIG.SPAWN.MIN_INTERVAL, base + Math.random() * 600);
    }

    scheduleNextObstacle() {
        const base = CONFIG.SPAWN.OBSTACLE_BASE_INTERVAL - this.game.state.stage * 60;
        this.nextObstacle = Math.max(CONFIG.SPAWN.MIN_INTERVAL, base + Math.random() * 800);
    }
}
