/**
 * Hand-drawn canvas sprites for characters whose emoji don't read well in a
 * side-scroller. Each is authored as a full side-profile facing RIGHT (the
 * travel direction) and centred on the origin. `r` is the player collision
 * radius (≈18); everything scales off `k = r / 18`.
 *
 * Some sprites animate using the wall clock (Date.now()) so they keep moving
 * even though the renderer doesn't thread a time value through.
 */

/** Full-body bird, side view, facing right, with flapping wings. */
export function drawBird(ctx: CanvasRenderingContext2D, r: number): void {
  const k = r / 18;
  const flap = Math.sin(Date.now() / 90); // -1..1 wing beat

  // Tail (left).
  ctx.fillStyle = "#f4b400";
  ctx.beginPath();
  ctx.moveTo(-12 * k, -3 * k);
  ctx.lineTo(-24 * k, -8 * k);
  ctx.lineTo(-23 * k, 2 * k);
  ctx.lineTo(-12 * k, 4 * k);
  ctx.closePath();
  ctx.fill();

  // Far wing (behind body) — beats in counter-phase for depth.
  ctx.save();
  ctx.translate(-1 * k, 0);
  ctx.rotate(-flap * 0.5 - 0.1);
  ctx.fillStyle = "#e0a200";
  ctx.beginPath();
  ctx.ellipse(-6 * k, 0, 9 * k, 4.5 * k, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Body.
  ctx.fillStyle = "#ffd84d";
  ctx.beginPath();
  ctx.ellipse(0, 0, 14 * k, 11 * k, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head (upper right).
  ctx.beginPath();
  ctx.arc(11 * k, -9 * k, 8 * k, 0, Math.PI * 2);
  ctx.fill();

  // Belly highlight.
  ctx.fillStyle = "#ffe680";
  ctx.beginPath();
  ctx.ellipse(1 * k, 3 * k, 9 * k, 7 * k, 0, 0, Math.PI * 2);
  ctx.fill();

  // Beak (pointing right).
  ctx.fillStyle = "#fb923c";
  ctx.beginPath();
  ctx.moveTo(18 * k, -10 * k);
  ctx.lineTo(28 * k, -8 * k);
  ctx.lineTo(18 * k, -5 * k);
  ctx.closePath();
  ctx.fill();

  // Eye.
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.arc(13 * k, -10 * k, 1.8 * k, 0, Math.PI * 2);
  ctx.fill();

  // Legs.
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 2 * k;
  ctx.beginPath();
  ctx.moveTo(2 * k, 10 * k);
  ctx.lineTo(2 * k, 16 * k);
  ctx.moveTo(7 * k, 10 * k);
  ctx.lineTo(7 * k, 16 * k);
  ctx.stroke();

  // Near wing (in front of body) — main flapping wing.
  ctx.save();
  ctx.translate(-1 * k, -1 * k);
  ctx.rotate(flap * 0.6 - 0.1);
  ctx.fillStyle = "#f4b400";
  ctx.beginPath();
  ctx.ellipse(-5 * k, 0, 10 * k, 5.5 * k, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Bat, side view, head and leading wing facing right. */
export function drawBat(ctx: CanvasRenderingContext2D, r: number): void {
  const k = r / 18;
  const flap = Math.sin(Date.now() / 110);

  // Trailing wing (left, darker) — slight flap.
  ctx.save();
  ctx.translate(-1 * k, 0);
  ctx.rotate(flap * 0.18);
  ctx.fillStyle = "#5b4bd0";
  ctx.beginPath();
  ctx.moveTo(0, -3 * k);
  ctx.lineTo(-17 * k, -10 * k);
  ctx.quadraticCurveTo(-11 * k, -2 * k, -15 * k, 2 * k);
  ctx.quadraticCurveTo(-9 * k, 3 * k, -12 * k, 9 * k);
  ctx.lineTo(-1 * k, 5 * k);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Leading wing (right, lighter) — slight flap.
  ctx.save();
  ctx.translate(4 * k, 0);
  ctx.rotate(-flap * 0.18);
  ctx.fillStyle = "#8b7cf5";
  ctx.beginPath();
  ctx.moveTo(0, -3 * k);
  ctx.lineTo(14 * k, -8 * k);
  ctx.quadraticCurveTo(9 * k, -1 * k, 13 * k, 3 * k);
  ctx.quadraticCurveTo(7 * k, 3 * k, 9 * k, 9 * k);
  ctx.lineTo(0, 5 * k);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Body.
  ctx.fillStyle = "#6d5cf0";
  ctx.beginPath();
  ctx.ellipse(1 * k, 1 * k, 5 * k, 7 * k, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head (right).
  ctx.beginPath();
  ctx.arc(6 * k, -4 * k, 5 * k, 0, Math.PI * 2);
  ctx.fill();

  // Ears.
  ctx.beginPath();
  ctx.moveTo(3 * k, -7 * k);
  ctx.lineTo(3 * k, -14 * k);
  ctx.lineTo(7 * k, -8 * k);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6 * k, -8 * k);
  ctx.lineTo(10 * k, -13 * k);
  ctx.lineTo(10 * k, -6 * k);
  ctx.closePath();
  ctx.fill();

  // Eyes (right-facing).
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(6 * k, -4 * k, 1.4 * k, 0, Math.PI * 2);
  ctx.arc(9 * k, -4 * k, 1.4 * k, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.arc(6.4 * k, -4 * k, 0.7 * k, 0, Math.PI * 2);
  ctx.arc(9.4 * k, -4 * k, 0.7 * k, 0, Math.PI * 2);
  ctx.fill();
}

/** Paper plane, side view, nose pointing right. */
export function drawPlane(ctx: CanvasRenderingContext2D, r: number): void {
  const k = r / 18;
  ctx.lineJoin = "round";

  // Upper wing.
  ctx.fillStyle = "#e8f1ff";
  ctx.strokeStyle = "#93c5fd";
  ctx.lineWidth = 1.5 * k;
  ctx.beginPath();
  ctx.moveTo(24 * k, -1 * k); // nose (right)
  ctx.lineTo(-18 * k, -12 * k); // top tail
  ctx.lineTo(-6 * k, -1 * k); // center notch
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lower wing (slightly darker for depth).
  ctx.fillStyle = "#cfe2ff";
  ctx.beginPath();
  ctx.moveTo(24 * k, -1 * k);
  ctx.lineTo(-18 * k, 8 * k); // bottom tail
  ctx.lineTo(-6 * k, -1 * k);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Center fold.
  ctx.beginPath();
  ctx.moveTo(24 * k, -1 * k);
  ctx.lineTo(-6 * k, -1 * k);
  ctx.stroke();
}

/** Space shuttle orbiter, side view, nose pointing right. */
export function drawShuttle(ctx: CanvasRenderingContext2D, r: number): void {
  const k = r / 18;
  ctx.lineJoin = "round";

  // Vertical tail fin (left).
  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.moveTo(-15 * k, -6 * k);
  ctx.lineTo(-19 * k, -17 * k);
  ctx.lineTo(-9 * k, -6 * k);
  ctx.closePath();
  ctx.fill();

  // Delta wing (bottom).
  ctx.fillStyle = "#94a3b8";
  ctx.beginPath();
  ctx.moveTo(-8 * k, 4 * k);
  ctx.lineTo(-18 * k, 12 * k);
  ctx.lineTo(6 * k, 8 * k);
  ctx.closePath();
  ctx.fill();

  // Fuselage (white top, dark belly).
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.moveTo(26 * k, 0);
  ctx.quadraticCurveTo(20 * k, -8 * k, 6 * k, -8 * k);
  ctx.lineTo(-16 * k, -6 * k);
  ctx.quadraticCurveTo(-20 * k, -5 * k, -19 * k, 0);
  ctx.lineTo(-17 * k, 6 * k);
  ctx.quadraticCurveTo(-10 * k, 8 * k, 6 * k, 8 * k);
  ctx.quadraticCurveTo(20 * k, 8 * k, 26 * k, 0);
  ctx.closePath();
  ctx.fill();

  // Dark belly tiles.
  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.moveTo(26 * k, 0);
  ctx.quadraticCurveTo(14 * k, 8 * k, -8 * k, 8 * k);
  ctx.quadraticCurveTo(-15 * k, 8 * k, -17 * k, 6 * k);
  ctx.quadraticCurveTo(-6 * k, 5 * k, 24 * k, 1 * k);
  ctx.closePath();
  ctx.fill();

  // Nose cap.
  ctx.fillStyle = "#475569";
  ctx.beginPath();
  ctx.ellipse(23 * k, 0, 3.5 * k, 4 * k, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cockpit window.
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.ellipse(15 * k, -3 * k, 3 * k, 2 * k, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // USA-style accent stripe.
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.2 * k;
  ctx.beginPath();
  ctx.moveTo(8 * k, -7 * k);
  ctx.lineTo(-14 * k, -5 * k);
  ctx.stroke();
}

/** Mini satellite, dish/antenna facing right (travel direction). */
export function drawSatellite(ctx: CanvasRenderingContext2D, r: number): void {
  const k = r / 18;

  // Solar panels (top & bottom), swept back-left.
  ctx.fillStyle = "#2563eb";
  for (const sign of [-1, 1]) {
    ctx.save();
    ctx.translate(-3 * k, sign * 13 * k);
    ctx.beginPath();
    ctx.rect(-13 * k, -4 * k, 20 * k, 8 * k);
    ctx.fill();
    // Panel grid lines.
    ctx.strokeStyle = "#93c5fd";
    ctx.lineWidth = 0.8 * k;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 5 * k, -4 * k);
      ctx.lineTo(i * 5 * k, 4 * k);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Struts connecting panels to the body.
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1.5 * k;
  ctx.beginPath();
  ctx.moveTo(-3 * k, -6 * k);
  ctx.lineTo(-3 * k, 6 * k);
  ctx.stroke();

  // Central body.
  ctx.fillStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.rect(-6 * k, -6 * k, 11 * k, 12 * k);
  ctx.fill();
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(-6 * k, -6 * k, 11 * k, 3 * k);

  // Gold foil accent.
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(-6 * k, 2 * k, 11 * k, 4 * k);

  // Dish antenna pointing right (the "front").
  ctx.fillStyle = "#f1f5f9";
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1 * k;
  ctx.beginPath();
  ctx.ellipse(11 * k, -1 * k, 4 * k, 7 * k, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Feed horn + boom.
  ctx.strokeStyle = "#64748b";
  ctx.beginPath();
  ctx.moveTo(5 * k, -1 * k);
  ctx.lineTo(13 * k, -2 * k);
  ctx.stroke();
  ctx.fillStyle = "#475569";
  ctx.beginPath();
  ctx.arc(15 * k, -2 * k, 1.6 * k, 0, Math.PI * 2);
  ctx.fill();
}

/** Sea turtle, side view, swimming right, with paddling flippers. */
export function drawTurtle(ctx: CanvasRenderingContext2D, r: number): void {
  const k = r / 18;
  const P = Math.PI;
  const paddle = Math.sin(Date.now() / 170);

  // Tail (left).
  ctx.fillStyle = "#4fc187";
  ctx.beginPath();
  ctx.moveTo(-13 * k, 0);
  ctx.lineTo(-19 * k, -2 * k);
  ctx.lineTo(-13 * k, 3 * k);
  ctx.closePath();
  ctx.fill();

  // Back flipper (paddles).
  ctx.save();
  ctx.translate(-9 * k, 6 * k);
  ctx.rotate(0.4 + paddle * 0.25);
  ctx.fillStyle = "#3aa776";
  ctx.beginPath();
  ctx.ellipse(0, 0, 7 * k, 3 * k, 0, 0, 2 * P);
  ctx.fill();
  ctx.restore();

  // Neck + head (right).
  ctx.fillStyle = "#5ec98f";
  ctx.beginPath();
  ctx.ellipse(10 * k, -1 * k, 6 * k, 4.5 * k, 0, 0, 2 * P);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(15 * k, -2 * k, 5 * k, 0, 2 * P);
  ctx.fill();

  // Eye.
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.arc(17 * k, -3 * k, 1.3 * k, 0, 2 * P);
  ctx.fill();

  // Shell.
  ctx.fillStyle = "#2f8f63";
  ctx.beginPath();
  ctx.ellipse(-1 * k, -2 * k, 14 * k, 10 * k, 0, 0, 2 * P);
  ctx.fill();

  // Scute patches.
  ctx.fillStyle = "#3fa873";
  for (const [sx, sy] of [
    [-1, -3],
    [-8, -1],
    [5, -1],
    [-1, 4],
  ] as const) {
    ctx.beginPath();
    ctx.ellipse(sx * k, sy * k, 3.5 * k, 2.6 * k, 0, 0, 2 * P);
    ctx.fill();
  }

  // Front flipper (paddles, drawn on top).
  ctx.save();
  ctx.translate(6 * k, 5 * k);
  ctx.rotate(-0.2 - paddle * 0.4);
  ctx.fillStyle = "#4fc187";
  ctx.beginPath();
  ctx.ellipse(3 * k, 1 * k, 8 * k, 3.5 * k, 0.2, 0, 2 * P);
  ctx.fill();
  ctx.restore();
}

/** Yellow submarine, side view, nose pointing right, spinning propeller. */
export function drawSubmarine(ctx: CanvasRenderingContext2D, r: number): void {
  const k = r / 18;
  const P = Math.PI;
  const spin = Date.now() / 60;

  // Propeller (left/back).
  ctx.save();
  ctx.translate(-23 * k, 0);
  ctx.rotate(spin);
  ctx.fillStyle = "#94a3b8";
  for (let i = 0; i < 3; i++) {
    ctx.rotate((2 * P) / 3);
    ctx.beginPath();
    ctx.ellipse(0, 4 * k, 2 * k, 4 * k, 0, 0, 2 * P);
    ctx.fill();
  }
  ctx.restore();

  // Tail fin.
  ctx.fillStyle = "#eab308";
  ctx.beginPath();
  ctx.moveTo(-18 * k, -2 * k);
  ctx.lineTo(-24 * k, -8 * k);
  ctx.lineTo(-19 * k, 1 * k);
  ctx.closePath();
  ctx.fill();

  // Hull.
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.moveTo(-18 * k, -8 * k);
  ctx.lineTo(14 * k, -8 * k);
  ctx.quadraticCurveTo(26 * k, -8 * k, 26 * k, 0);
  ctx.quadraticCurveTo(26 * k, 8 * k, 14 * k, 8 * k);
  ctx.lineTo(-18 * k, 8 * k);
  ctx.quadraticCurveTo(-23 * k, 8 * k, -23 * k, 0);
  ctx.quadraticCurveTo(-23 * k, -8 * k, -18 * k, -8 * k);
  ctx.closePath();
  ctx.fill();

  // Lower hull shading.
  ctx.fillStyle = "#eab308";
  ctx.beginPath();
  ctx.moveTo(-18 * k, 8 * k);
  ctx.lineTo(14 * k, 8 * k);
  ctx.quadraticCurveTo(24 * k, 8 * k, 25 * k, 3 * k);
  ctx.quadraticCurveTo(-6 * k, 6 * k, -23 * k, 3 * k);
  ctx.closePath();
  ctx.fill();

  // Conning tower (sail).
  ctx.fillStyle = "#eab308";
  ctx.beginPath();
  ctx.moveTo(-3 * k, -8 * k);
  ctx.lineTo(-1 * k, -16 * k);
  ctx.lineTo(6 * k, -16 * k);
  ctx.lineTo(8 * k, -8 * k);
  ctx.closePath();
  ctx.fill();

  // Periscope.
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1.3 * k;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(2 * k, -16 * k);
  ctx.lineTo(2 * k, -21 * k);
  ctx.lineTo(5 * k, -21 * k);
  ctx.stroke();

  // Portholes.
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.2 * k;
  ctx.fillStyle = "#38bdf8";
  for (const px of [-8, 0, 8]) {
    ctx.beginPath();
    ctx.arc(px * k, 0, 2.6 * k, 0, 2 * P);
    ctx.fill();
    ctx.stroke();
  }

  // Nose lamp.
  ctx.fillStyle = "#fff7cc";
  ctx.beginPath();
  ctx.arc(22 * k, 0, 2 * k, 0, 2 * P);
  ctx.fill();
}
