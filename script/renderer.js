export default class Renderer {
  static drawBackground(game) {
    const { ctx, canvas } = game;

    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#00CED1");
    sky.addColorStop(1, "#98FB98");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    Renderer.drawHills(game, (-game.bg.far % canvas.width));
    Renderer.drawHills(game, (-game.bg.far % canvas.width) + canvas.width);
  }

  static drawHills(game, xOffset) {
    const { ctx, canvas, state, DPR } = game;
    const baseY = canvas.height - state.groundH * DPR - 220 * DPR;

    const w = canvas.width;

    ctx.fillStyle = "#182033";
    ctx.beginPath();
    ctx.moveTo(xOffset, canvas.height - state.groundH * DPR);

    ctx.bezierCurveTo(
      xOffset + w * 0.15, baseY + 40,
      xOffset + w * 0.25, baseY - 60,
      xOffset + w * 0.4, baseY
    );

    ctx.bezierCurveTo(
      xOffset + w * 0.55, baseY + 60,
      xOffset + w * 0.7, baseY - 40,
      xOffset + w * 0.85, baseY
    );

    ctx.bezierCurveTo(
      xOffset + w * 0.92, baseY + 20,
      xOffset + w * 1.05, baseY - 30,
      xOffset + w * 1.2, baseY
    );

    ctx.lineTo(xOffset + w * 1.2, canvas.height - state.groundH * DPR);
    ctx.closePath();
    ctx.fill();
  }

  static drawGround(game) {
    const { ctx, canvas, state, bg, DPR } = game;

    const y = canvas.height - state.groundH * DPR;

    ctx.fillStyle = "#0f1219";
    ctx.fillRect(0, y, canvas.width, state.groundH * DPR);

    const offset = bg.near % 40;

    ctx.fillStyle = "#151a22";
    for (let x = -offset; x < canvas.width; x += 40)
      ctx.fillRect(x, y + 8 * DPR, 22, 6);

    ctx.fillStyle = "#121620";
    for (let x = -offset * 1.6; x < canvas.width; x += 64)
      ctx.fillRect(x, y + 28 * DPR, 34, 6);
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
}
