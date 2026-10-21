/* Network globe — canvas 2D orthographic dot-matrix globe. No dependencies.
   Land masses are coarse hand-traced polygons (stylised, not cartographic). */
(function () {
  "use strict";
  var D = Math.PI / 180;
  // [lon,lat,lon,lat,...]
  var LAND = [
    // Africa
    [-5.9,35.8,-2,35.1,3,36.8,10.2,37.3,11,36.9,10.3,34,11.5,33.2,13,32.9,15.2,32.4,17,31,19,30.3,20.1,32.1,22,33,25,31.6,29.9,31.2,32.3,31.3,32.5,29.9,33.8,27.2,35.5,23.5,37.2,19.6,39.5,15.6,42.7,13,43.1,11.6,45,10.4,48,11.2,51.3,11.8,51,10.4,49.5,6.8,48.5,5.3,45.3,2,42.5,-0.4,40.9,-2.3,39.7,-4,39.3,-6.8,40.5,-10.3,40.5,-12.9,39.9,-16.2,34.9,-19.8,35.5,-23.5,32.6,-25.9,31,-29.9,27.9,-33,25.6,-34,20,-34.8,18.4,-34,18,-32,16.4,-28.6,15.1,-26.6,14.5,-22.9,11.8,-17.3,12.1,-15.2,13.4,-12.6,13.2,-8.8,12.2,-6,11.8,-4.8,8.8,-0.7,9.4,0.4,9.7,2,9.7,4,8.3,4.9,6,4.3,3.4,6.4,-0.2,5.6,-2,4.7,-4,5.3,-7.5,4.4,-10.8,6.3,-13.2,8.5,-13.7,9.5,-15.6,11.8,-17.5,14.7,-16.5,16,-16,18.1,-16.9,21,-15.9,23.7,-13.2,27.1,-9.6,30.4,-7.6,33.6],
    // Madagascar
    [49.3,-12,50.2,-15,49.4,-17.9,48.5,-20.5,47.2,-24.9,45.4,-25.6,43.7,-23.5,43.3,-21.5,44.4,-19.9,44,-17.4,46.3,-15.8,47.9,-14.9,48.3,-13.3],
    // Eurasia
    [-5.9,36,-9.5,37,-9.3,39,-9,43,-1.8,43.4,-1.2,46,-4.5,48.4,-1.6,49.7,1.6,50.9,4.5,52.5,8.5,54,8.2,57,10.5,57.6,10.8,54.5,14,54,19,54.4,21,56.5,24,57.5,23.5,59.2,28,59.8,30,60,25,60.2,22.5,60,21.5,61.5,25,65,24,65.8,21.5,65.7,17.5,62.5,18.5,60,16.5,57,12.5,56,11,58.9,8,58,5.5,59,5,62,10,64,14,67.5,18,69.8,25,71,31,70,40,67.5,41,67,44,68,53,68.8,60,69,68,68.5,69,73,80,72,87,75.5,100,76.5,105,77.7,113,74,130,71,140,72.5,160,70,170,70,180,68.8,180,66,162,60,156,51.2,157,56,143,59,137,54,140,48,133,43,129,41,129.4,35.2,126.5,34.4,126.5,37.5,125,39.5,121.5,39,122,40.8,118,39,119,37,122.5,37,120.5,35.5,121.8,31.5,122,29.5,120,26,117,23.5,113,22,110,21,108,21.5,106.5,20,105.8,19,108.5,15.5,109.3,12,107,10.5,105,8.6,104.8,10.5,103,10.5,100.5,13.4,99.5,10.5,100.3,8,103.5,1.3,101,2.8,100.3,5.5,98.5,8,98.4,10.5,98.7,13.5,97.5,16.5,94.5,16.2,94.3,18.5,92.3,20.7,91.5,22.8,89,22,87,21.5,86.5,20,84.5,18.5,82,16.5,80.3,15.5,80.2,13,79.8,10.5,78.2,8.8,77.5,8.1,76.3,9.7,74.8,12.8,73.3,16.2,72.9,19,72.7,21,70.5,20.8,69,22.3,70.5,23,68.5,23.5,67,24.8,66.5,25.4,62,25.2,57.5,25.7,56.3,27,54,26.7,51.5,27.9,50,30,48.5,30,47.8,29.3,48.5,28,50,26.5,50.2,25.5,51.5,24.2,54,24.2,56,25.5,56.5,24.5,58.8,23.5,59.9,22.3,58.5,20.5,57.7,19,55.5,17.5,52.3,16,49,14.2,45,12.8,43.5,12.7,42.8,15,42.8,17,41,19.5,39.5,22,38.5,24,36.8,26,35,28.2,34.9,29.5,34.6,28,34.2,27.8,33.5,28.3,32.6,29.9,32.3,31.3,34.2,31.3,35,33,35.8,34.5,36,36,36.2,36.7,34,36.2,32.5,36.1,30.5,36.7,28,36.7,27.2,37.3,26.7,38.5,26.2,40.1,24,40.8,23,40.3,23.7,38,22.8,36.5,21.7,36.8,21.1,38.3,20.2,39.7,19.4,41.8,19.5,42.3,17.5,43,15.5,44.5,13.8,45,13.5,45.7,12.3,45.2,12.4,44,13.6,43.5,14.2,42,16,41.9,18.5,40.1,17.1,39.4,16.5,38.2,15.7,38,15.9,39.6,15.7,40,14.3,40.7,13,41.3,11.2,42.4,10.2,43.8,8.8,44.4,7.3,43.7,6,43.1,4.5,43.4,3.1,43.1,3,42,0.9,41,0,39.5,-0.5,38.3,-2,36.8,-4.5,36.7],
    // British Isles, Japan, Indonesia, New Guinea, Australia
    [-5,50,-3,50.7,1.3,51.2,1.7,52.7,0.2,53.5,-1.5,55,-2,56,-3,58.5,-5,58.6,-6,56.5,-5,55,-3.2,54.9,-3,53.5,-4.7,52.8,-4.2,51.6,-5.2,51.7],
    [-10,51.8,-6,52.2,-6,54.5,-8,55.2,-10,54],
    [130,31,131.5,33,135,34,140,35,141.5,38.5,141.8,41.2,143,43.3,141.5,45,140,43,139.5,40,136.5,37,133,35.5,130.5,33.8],
    [95.3,5.6,98,4,100.5,2,104,-1.5,106,-3,105.8,-5.8,102,-4,99,0,96,3],
    [109,1.5,111.5,2.5,117,7,119,5,117.5,1,116.5,-3.5,114.5,-4,111,-3,110,-1.5],
    [105.2,-6.8,108,-6.3,112,-6.8,114.5,-7.8,110,-8.2,106,-7.5],
    [131,-1,135,-3.3,138,-1.7,141,-2.6,145,-4.5,147.5,-6,150.5,-10.5,147,-10,143.5,-8.5,141,-9.2,138,-8.3,137.5,-5.5,133.5,-4,132,-2.5],
    [114,-22,113.5,-26,115,-34,118,-35,123.5,-34,129,-31.6,134,-32.8,138,-35,140,-38,146,-39,150,-37.5,153,-31,153.5,-27,150,-22.5,146,-19,145,-15,143.5,-12.5,142.5,-10.7,141.5,-13,141,-17,139.5,-17.5,136,-15,137,-12,135,-12,131,-12,130,-13.5,127,-14,125,-15,122,-17.5,120,-19.5,117,-20.8],
    // North America
    [-166,68.5,-156,71.3,-141,69.7,-125,70,-108,68,-95,70,-85,69.5,-82,67,-81,63,-77,60,-72,58,-64,60,-61,56,-56,52,-60,47,-66,44.5,-70,42,-74,40.5,-76,37,-76,35,-81,31.5,-80,26,-81,25.2,-82.8,27.5,-84,30,-88,30.3,-90,29,-94,29.5,-97.2,27.5,-97.5,24,-97.8,21,-96,19,-94.5,18.2,-91,18.8,-90.5,21,-87,21.5,-87.5,18,-88.2,16,-83.5,15,-83.2,11,-81.7,9,-79.5,9.4,-77.5,8.6,-78.5,8,-80.5,7.3,-82.8,8.3,-85.7,10,-87.7,13,-91.5,14,-94.5,16,-97,15.8,-101,17.2,-105.5,20,-105.3,22.5,-108,25.5,-112.5,29.5,-114.7,31.7,-112.3,28.5,-110.5,24.2,-109.5,23,-112,24.5,-114.5,27.5,-116.8,31.5,-118.5,34,-120.6,34.6,-122.5,37.5,-124.3,40.3,-124.1,46.3,-124.7,48.4,-127,50.5,-130,54.5,-134,58,-138,59.2,-146,60.5,-152,59.5,-154,57.5,-163,54.8,-165,60.5,-166,64],
    // Greenland
    [-73,78,-60,82,-30,83.5,-20,80,-18,75,-22,70,-32,68,-42,60,-50,62,-54,67,-58,75],
    // South America
    [-77.3,8.6,-75.5,10.7,-72,12,-68,10.6,-64,10.6,-62,10.7,-60,8.5,-57,6,-52,5,-50,1.5,-50,0,-48,-1,-44.5,-2.5,-40,-3,-35.2,-5.3,-34.8,-7.5,-37,-11.5,-39,-14,-39,-18,-41,-22,-44,-23,-48,-26,-48.7,-28.5,-52,-32,-54,-34.7,-58.4,-34.5,-57,-36.5,-57.5,-38,-62,-39,-64,-41,-65,-45,-67.5,-46.5,-66,-48,-68,-50,-69,-52.3,-68,-53.5,-71,-54,-74.5,-52,-75.5,-47,-73.7,-43,-73.5,-37,-71.7,-32,-71.5,-28,-70.3,-18.5,-76,-14,-79.5,-8,-81.3,-5,-80.9,-2,-80,0.5,-79,1.5,-77.5,4]
  ];
  var WATER = [
    [28,41.5,28,43.5,30,45.5,33,46,35,45,37,44.5,40,43.5,41.5,41.8,39,41,35,42,31,41.2],            // Black Sea
    [47,45,49,46.5,53,46.5,53,42,54,38.5,51,36.8,49,37.5,49,40,47.5,42.5],                          // Caspian
    [-95,59,-94,61,-90,64,-86,66,-82,63.5,-79,62,-77,59,-79,56,-79,52,-82,52.5,-85,55,-90,57,-93,57.5] // Hudson Bay
  ];
  function inPoly(lon, lat, p) {
    var c = false;
    for (var i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
      var xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function isLand(lon, lat) {
    var l = false, i;
    for (i = 0; i < LAND.length; i++) if (inPoly(lon, lat, LAND[i])) { l = true; break; }
    if (!l) return false;
    for (i = 0; i < WATER.length; i++) if (inPoly(lon, lat, WATER[i])) return false;
    return true;
  }
  // sites listed in the company profile (Rwanda: country only, no address provided)
  var NODES = [
    { name: "Goma", lat: -1.68, lon: 29.22, hq: true, dx: -12, dy: 4, al: "right" },
    { name: "Kampala", lat: 0.3, lon: 32.58, dx: 12, dy: 2, al: "left" },
    { name: "Juba", lat: 4.85, lon: 31.6, dx: 12, dy: -8, al: "left" },
    { name: "Rwanda", lat: -1.95, lon: 30.06, ring: true, dx: 12, dy: 16, al: "left" }
  ];
  var LINKS = [[0, 1], [0, 2], [1, 2]];

  function vec(lat, lon) { var c = Math.cos(lat * D); return [c * Math.cos(lon * D), c * Math.sin(lon * D), Math.sin(lat * D)]; }

  function init(cv) {
    var ctx = cv.getContext && cv.getContext("2d");
    if (!ctx) { document.documentElement.classList.add("no-canvas"); return; }
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.connection && navigator.connection.saveData);
    var N = lowPower ? 4800 : 9500, pts = [], i;
    var ga = Math.PI * (3 - Math.sqrt(5));
    for (i = 0; i < N; i++) {
      var y = 1 - 2 * (i + .5) / N, lat = Math.asin(y) / D, lon = ((i * ga) / D) % 360;
      if (lon > 180) lon -= 360; if (lon < -180) lon += 360;
      var la = lat * D, lo = lon * D;
      pts.push({ cl: Math.cos(lo), sl: Math.sin(lo), sp: Math.sin(la), cp: Math.cos(la), land: isLand(lon, lat) });
    }
    var arcs = LINKS.map(function (l) {
      var a = vec(NODES[l[0]].lat, NODES[l[0]].lon), b = vec(NODES[l[1]].lat, NODES[l[1]].lon);
      var dot = Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]), om = Math.acos(dot), s = Math.sin(om), seg = [];
      for (var k = 0; k <= 40; k++) {
        var t = k / 40, w1 = Math.sin((1 - t) * om) / s, w2 = Math.sin(t * om) / s, lift = 1 + 0.5 * om * Math.sin(Math.PI * t) * 0.9;
        seg.push([(a[0] * w1 + b[0] * w2) * lift, (a[1] * w1 + b[1] * w2) * lift, (a[2] * w1 + b[2] * w2) * lift]);
      }
      return seg;
    });
    var W = 0, H = 0, dpr = 1, R = 0, cx = 0, cy = 0, lon0 = 28, lat0 = 8 * D, drag = null, off = 0, offLat = 0, running = false, visible = true, t0 = performance.now();

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(200, cv.clientWidth); H = Math.max(200, cv.clientHeight);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W, H) * 0.405; cx = W / 2; cy = H / 2;
    }
    function proj(X, Y, Z, l0, p0) {
      var cl0 = Math.cos(l0), sl0 = Math.sin(l0);
      var a = X * cl0 + Y * sl0, b = -X * sl0 + Y * cl0;
      return [b, Math.cos(p0) * Z - Math.sin(p0) * a, Math.sin(p0) * Z + Math.cos(p0) * a];
    }
    function frame(now) {
      var t = (now - t0) / 1000;
      var auto = reduce ? 0 : Math.sin(t * 0.14) * 34;
      var l0 = (28 + auto + off) * D, p0 = lat0 + offLat;
      ctx.clearRect(0, 0, W, H);
      // atmosphere + sphere
      var g = ctx.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R * 1.02);
      g.addColorStop(0, "#27465a"); g.addColorStop(.6, "#10222d"); g.addColorStop(1, "#0a141b");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fillStyle = g; ctx.fill();
      var h = ctx.createRadialGradient(cx, cy, R * .96, cx, cy, R * 1.18);
      h.addColorStop(0, "rgba(116,198,28,.22)"); h.addColorStop(1, "rgba(116,198,28,0)");
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.18, 0, 6.2832); ctx.fillStyle = h; ctx.fill();
      // graticule
      ctx.lineWidth = 1; ctx.strokeStyle = "rgba(155,178,193,.13)";
      var la, lo, k, p, started;
      for (la = -60; la <= 60; la += 30) {
        ctx.beginPath(); started = false;
        for (lo = -180; lo <= 180; lo += 6) { var v = vec(la, lo); p = proj(v[0], v[1], v[2], l0, p0); if (p[2] > 0) { var X = cx + p[0] * R, Y = cy - p[1] * R; started ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); started = true; } else started = false; }
        ctx.stroke();
      }
      for (lo = -180; lo < 180; lo += 30) {
        ctx.beginPath(); started = false;
        for (la = -84; la <= 84; la += 6) { var v2 = vec(la, lo); p = proj(v2[0], v2[1], v2[2], l0, p0); if (p[2] > 0) { var X2 = cx + p[0] * R, Y2 = cy - p[1] * R; started ? ctx.lineTo(X2, Y2) : ctx.moveTo(X2, Y2); started = true; } else started = false; }
        ctx.stroke();
      }
      // dots
      var cl0 = Math.cos(l0), sl0 = Math.sin(l0), cp0 = Math.cos(p0), sp0 = Math.sin(p0), ds = Math.max(1, R / 200);
      for (i = 0; i < pts.length; i++) {
        var q = pts[i], cdl = q.cl * cl0 + q.sl * sl0, sdl = q.sl * cl0 - q.cl * sl0;
        var z = sp0 * q.sp + cp0 * q.cp * cdl;
        if (z <= 0.02) continue;
        var x = q.cp * sdl, y2 = cp0 * q.sp - sp0 * q.cp * cdl;
        if (q.land) { ctx.fillStyle = "rgba(" + (150 + z * 90 | 0) + "," + (185 + z * 55 | 0) + "," + (205 + z * 40 | 0) + "," + (.5 + z * .5) + ")"; ctx.fillRect(cx + x * R - ds * .85, cy - y2 * R - ds * .85, ds * 1.7, ds * 1.7); }
        else { ctx.fillStyle = "rgba(120,150,170," + (.04 + z * .10) + ")"; ctx.fillRect(cx + x * R - ds * .4, cy - y2 * R - ds * .4, ds * .8, ds * .8); }
      }
      // arcs + pulses
      arcs.forEach(function (seg, ai) {
        ctx.beginPath(); var st = false;
        for (k = 0; k < seg.length; k++) { p = proj(seg[k][0], seg[k][1], seg[k][2], l0, p0); if (p[2] > 0.05) { var AX = cx + p[0] * R, AY = cy - p[1] * R; st ? ctx.lineTo(AX, AY) : ctx.moveTo(AX, AY); st = true; } else st = false; }
        ctx.strokeStyle = "rgba(116,198,28,.75)"; ctx.lineWidth = 1.6; ctx.stroke();
        var f = reduce ? .5 : (((t * .22 + ai * .31) % 1) + 1) % 1, idx = Math.floor(f * 40), pp = proj(seg[idx][0], seg[idx][1], seg[idx][2], l0, p0);
        if (pp[2] > 0.05) {
          var PX = cx + pp[0] * R, PY = cy - pp[1] * R, gg = ctx.createRadialGradient(PX, PY, 0, PX, PY, 10);
          gg.addColorStop(0, "rgba(220,255,160,.95)"); gg.addColorStop(1, "rgba(116,198,28,0)");
          ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(PX, PY, 10, 0, 6.2832); ctx.fill();
        }
      });
      // nodes
      ctx.font = "700 " + Math.max(12, R / 22) + "px 'ITC Text',Carlito,Calibri,sans-serif";
      NODES.forEach(function (n) {
        var v = vec(n.lat, n.lon), pn = proj(v[0], v[1], v[2], l0, p0);
        if (pn[2] < 0.12) return;
        var NX = cx + pn[0] * R, NY = cy - pn[1] * R, pulse = reduce ? 0 : (((t * .8 + n.lat) % 1) + 1) % 1;
        if (!n.ring) { ctx.beginPath(); ctx.arc(NX, NY, 4 + pulse * 16, 0, 6.2832); ctx.strokeStyle = "rgba(116,198,28," + (.6 * (1 - pulse)) + ")"; ctx.lineWidth = 1.5; ctx.stroke(); }
        ctx.beginPath(); ctx.arc(NX, NY, n.hq ? 5.5 : 4, 0, 6.2832);
        if (n.ring) { ctx.strokeStyle = "#cfe9a8"; ctx.lineWidth = 1.6; ctx.fillStyle = "#10222d"; ctx.fill(); ctx.stroke(); }
        else { ctx.fillStyle = n.hq ? "#ffffff" : "#74c61c"; ctx.fill(); ctx.strokeStyle = "#74c61c"; ctx.lineWidth = 2; ctx.stroke(); }
        ctx.textAlign = n.al; ctx.shadowColor = "rgba(0,0,0,.8)"; ctx.shadowBlur = 5; ctx.fillStyle = "#fff";
        ctx.fillText(n.name, NX + n.dx, NY + n.dy); ctx.shadowBlur = 0;
      });
      // limb
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.strokeStyle = "rgba(155,178,193,.35)"; ctx.lineWidth = 1; ctx.stroke();
      // ease manual rotation back
      if (!drag) { off *= .985; offLat *= .985; }
    }
    function loop(now) { if (!running) return; frame(now); requestAnimationFrame(loop); }
    function start() { if (reduce || running || !visible || document.hidden) return; running = true; requestAnimationFrame(loop); }
    function stop() { running = false; }
    size(); frame(performance.now());
    if (!reduce) {
      if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible ? start() : stop(); }).observe(cv);
      document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
      start();
    }
    var rt; function rs() { clearTimeout(rt); rt = setTimeout(function () { size(); frame(performance.now()); }, 80); }
    if (window.ResizeObserver) new ResizeObserver(rs).observe(cv); else window.addEventListener("resize", rs);
    // pointer drag (rotate)
    cv.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, y: e.clientY, off: off, lat: offLat }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", function (e) {
      if (!drag) return;
      off = drag.off - (e.clientX - drag.x) * .35; offLat = Math.max(-.6, Math.min(.6, drag.lat + (e.clientY - drag.y) * .004));
      if (reduce) frame(performance.now());
    });
    var end = function () { drag = null; }; cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
    cv.setAttribute("role", "img");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var list = document.querySelectorAll("canvas[data-globe]");
    for (var i = 0; i < list.length; i++) init(list[i]);
  });
})();
