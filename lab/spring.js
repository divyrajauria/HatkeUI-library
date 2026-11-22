/* Hatke UI lab: the shared physics used by every component page. */
var RM = matchMedia('(prefers-reduced-motion: reduce)');
/* A damped spring, integrated in small steps so it stays stable at any frame rate. */
function Spring(x, k, d){ this.x = x; this.v = 0; this.t = x; this.k = k || 170; this.d = d || 18; }
Spring.prototype.step = function(dt){
  var n = Math.ceil(dt / .004), h = dt / n;
  for (var i = 0; i < n; i++){ var f = -this.k * (this.x - this.t) - this.d * this.v; this.v += f * h; this.x += this.v * h; }
  return Math.abs(this.v) < .02 && Math.abs(this.x - this.t) < .02;
};
Spring.prototype.snap = function(){ this.x = this.t; this.v = 0; };
/* Runs fn(dt) every frame until it returns true. With reduced motion, snaps instead. */
function Loop(fn, snap){
  var running = false, last = 0;
  function tick(now){ var dt = Math.min(.034, (now - last) / 1000); last = now; if (fn(dt)) { running = false; return; } requestAnimationFrame(tick); }
  return { kick: function(){ if (RM.matches && snap) { snap(); return; } if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); } } };
}
var clamp = function(v, a, b){ return Math.max(a, Math.min(b, v)); };
