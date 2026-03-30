</script>
<script>

/* ============================== */
/* JAMSESH UI INTERACTION LAYER */
/* ============================== */


/* click bounce feedback */

document.querySelectorAll(
".home-grid > *, .play-grid > *, .nav-item"
).forEach(el => {

  el.addEventListener("click", () => {

    el.style.transform = "scale(.92)";

    setTimeout(()=>{
      el.style.transform = "";
    },120);

  });

});





/* ============================== */
/* PARTICLE FESTIVAL BACKGROUND */
/* ============================== */

var canvas = document.getElementById("jamseshParticles");
var ctx = canvas.getContext("2d");

/* canvas positioned inline in HTML */

canvas.width=1920;
canvas.height=1920;

var particles = [];
var waveLines = [];
var NUM_PARTICLES = 90;
var NUM_WAVES = 5;
var frameCount = 0;

/* Spawn particles — mix of floaters and wave-riders */
for (var i = 0; i < NUM_PARTICLES; i++) {
  var isWaveRider = i < 40;
  particles.push({
    x: Math.random() * 1920,
    y: Math.random() * 1920,
    baseY: 0,
    r: isWaveRider ? Math.random() * 3 + 1.5 : Math.random() * 2 + 0.5,
    speed: Math.random() * 0.4 + 0.1,
    xSpeed: (Math.random() - 0.5) * 0.3,
    wave: isWaveRider,
    waveIndex: isWaveRider ? Math.floor(Math.random() * NUM_WAVES) : 0,
    waveOffset: Math.random() * Math.PI * 2,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.03 + 0.01
  });
}

/* Wave line configs — horizontal music-wave bands */
for (var w = 0; w < NUM_WAVES; w++) {
  waveLines.push({
    y: 300 + w * 300,
    amp: 40 + Math.random() * 60,
    freq: 0.003 + Math.random() * 0.004,
    speed: 0.015 + Math.random() * 0.02,
    phase: Math.random() * Math.PI * 2,
    color: w
  });
}

/* Palette: cyan -> purple -> pink */
var waveColors = [
  [0, 224, 255],
  [100, 140, 255],
  [168, 85, 247],
  [220, 60, 180],
  [255, 80, 200]
];

/* dark blue to pink gradient background */
var bgGrad = ctx.createLinearGradient(0, 0, 1920, 1920);
bgGrad.addColorStop(0, "#0a0e2a");
bgGrad.addColorStop(0.4, "#1a1040");
bgGrad.addColorStop(0.7, "#2e1248");
bgGrad.addColorStop(1, "#4a1050");

function drawParticles() {
  frameCount++;

  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1920, 1920);

  /* Draw wave lines — single pass, no shadowBlur */
  for (var w = 0; w < waveLines.length; w++) {
    var wl = waveLines[w];
    var wc = waveColors[wl.color % waveColors.length];
    wl.phase += wl.speed;

    ctx.beginPath();
    for (var wx = 0; wx <= 1920; wx += 8) {
      var wy = wl.y + Math.sin(wx * wl.freq + wl.phase) * wl.amp
                     + Math.sin(wx * wl.freq * 2.3 + wl.phase * 1.5) * wl.amp * 0.3;
      if (wx === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.strokeStyle = "rgba(" + wc[0] + "," + wc[1] + "," + wc[2] + ",0.18)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /* Draw particles — no shadowBlur */
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];

    /* Pulse size */
    p.pulse += p.pulseSpeed;
    var pulseScale = 1 + Math.sin(p.pulse) * 0.35;
    var drawR = p.r * pulseScale;

    /* Colour based on vertical position */
    var t = p.y / 1920;
    var cr = Math.round(0 + t * 255);
    var cg = Math.round(224 - t * 160);
    var cb = Math.round(255 - t * 55);

    if (p.wave) {
      /* Wave-riding particles — follow a sine wave */
      var wl = waveLines[p.waveIndex];
      var wc = waveColors[wl.color % waveColors.length];
      cr = wc[0]; cg = wc[1]; cb = wc[2];

      p.x += p.speed * 2;
      if (p.x > 1920) p.x = 0;
      p.y = wl.y + Math.sin(p.x * wl.freq + wl.phase + p.waveOffset) * wl.amp
                  + Math.sin(p.x * wl.freq * 2.3 + wl.phase * 1.5 + p.waveOffset) * wl.amp * 0.3;

      ctx.fillStyle = "rgba(" + cr + "," + cg + "," + cb + ",0.9)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, drawR, 0, Math.PI * 2);
      ctx.fill();

      /* Soft halo — larger, no shadow */
      ctx.fillStyle = "rgba(" + cr + "," + cg + "," + cb + ",0.08)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, drawR * 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      /* Free-floating ambient particles */
      p.y -= p.speed;
      p.x += p.xSpeed;
      if (p.y < -10) { p.y = 1930; p.x = Math.random() * 1920; }
      if (p.x < -10) p.x = 1930;
      if (p.x > 1930) p.x = -10;

      ctx.fillStyle = "rgba(" + cr + "," + cg + "," + cb + ",0.5)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, drawR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  requestAnimationFrame(drawParticles);
}

