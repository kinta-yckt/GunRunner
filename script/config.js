// ======================================================
// config.js
// ゲーム全体の定数定義
// ======================================================
import Game from "./game.js";
export default class Config {
    static setStageParams(game) {
        switch (game.state.stage) {
            case 1:
                game.state.scrollSpeed = 0.15;
                game.state.enemySpawnBaseTimeFrom = 2000;
                game.state.enemySpawnBaseTimeTo = 4000;
                game.state.obstacleSpawnBaseTimeFrom = 2000;
                game.state.obstacleSpawnBaseTimeTo = 3000;
                game.state.obstacleAirRate = 0.0;
                game.state.enemyBarrierRate = 0.0;
                break;
            case 2:
                game.state.scrollSpeed = 0.20;
                game.state.enemySpawnBaseTimeFrom = 1000;
                game.state.enemySpawnBaseTimeTo = 1600;
                game.state.obstacleSpawnBaseTimeFrom = 1000;
                game.state.obstacleSpawnBaseTimeTo = 1300;
                game.state.obstacleAirRate = 0.3;
                game.state.enemyBarrierRate = 0.0;
                break;
            case 3:
                game.state.scrollSpeed = 0.25;
                game.state.enemySpawnBaseTimeFrom = 800;
                game.state.enemySpawnBaseTimeTo = 1400;
                game.state.obstacleSpawnBaseTimeFrom = 800;
                game.state.obstacleSpawnBaseTimeTo = 1000;
                game.state.obstacleAirRate = 0.5;
                game.state.enemyBarrierRate = 0.3;
                break;
            case 4:
                game.state.scrollSpeed = 0.30;
                game.state.enemySpawnBaseTimeFrom = 800;
                game.state.enemySpawnBaseTimeTo = 1200;
                game.state.obstacleSpawnBaseTimeFrom = 400;
                game.state.obstacleSpawnBaseTimeTo = 600;
                game.state.obstacleAirRate = 0.5;
                game.state.enemyBarrierRate = 0.3;
                break;
            case 5:
                game.state.scrollSpeed = 0.35;
                game.state.enemySpawnBaseTimeFrom = 300;
                game.state.enemySpawnBaseTimeTo = 400;
                game.state.obstacleSpawnBaseTimeFrom = 800;
                game.state.obstacleSpawnBaseTimeTo = 1200;
                game.state.obstacleAirRate = 0.5;
                game.state.enemyBarrierRate = 0.5;
                break;
            case 6:
                game.state.scrollSpeed = 0.40;
                game.state.enemySpawnBaseTimeFrom = 300;
                game.state.enemySpawnBaseTimeTo = 400;
                game.state.obstacleSpawnBaseTimeFrom = 400;
                game.state.obstacleSpawnBaseTimeTo = 600;
                game.state.obstacleAirRate = 0.5;
                game.state.enemyBarrierRate = 0.5;
                break;
            case 7:
                game.state.scrollSpeed = 0.45;
                game.state.enemySpawnBaseTimeFrom = 500;
                game.state.enemySpawnBaseTimeTo = 700;
                game.state.obstacleSpawnBaseTimeFrom = 800;
                game.state.obstacleSpawnBaseTimeTo = 1000;
                game.state.obstacleAirRate = 0.5;
                game.state.enemyBarrierRate = 0.5;
                break;
            case 8:
                game.state.scrollSpeed = 0.70;
                game.state.enemySpawnBaseTimeFrom = 300;
                game.state.enemySpawnBaseTimeTo = 500;
                game.state.obstacleSpawnBaseTimeFrom = 300;
                game.state.obstacleSpawnBaseTimeTo = 400;
                game.state.obstacleAirRate = 0.5;
                game.state.enemyBarrierRate = 0.5;
                break;
            case 9:
                game.state.scrollSpeed = 0.20;
                game.state.enemySpawnBaseTimeFrom = 200;
                game.state.enemySpawnBaseTimeTo = 400;
                game.state.obstacleSpawnBaseTimeFrom = 800;
                game.state.obstacleSpawnBaseTimeTo = 1000;
                game.state.obstacleAirRate = 0.5;
                game.state.enemyBarrierRate = 0.5;
                break;
            case 10:
                game.state.scrollSpeed = 0.60;
                game.state.enemySpawnBaseTimeFrom = 500;
                game.state.enemySpawnBaseTimeTo = 700;
                game.state.obstacleSpawnBaseTimeFrom = 400;
                game.state.obstacleSpawnBaseTimeTo = 600;
                game.state.obstacleAirRate = 0.5;
                game.state.enemyBarrierRate = 1.0;
                break;
        }
    }
}
