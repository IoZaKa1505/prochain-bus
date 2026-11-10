/* Prochain bus — afficheur LED dessiné point par point + bus de face (dessins originaux, sans logos). */
"use strict";

/* ================== police LED 5x7 proportionnelle ================== */
const LED = (() => {
  const g = s => s.trim().split(/\s+/);
  const F = {
    "A": g(".###. #...# #...# ##### #...# #...# #...#"),
    "B": g("####. #...# #...# ####. #...# #...# ####."),
    "C": g(".###. #...# #.... #.... #.... #...# .###."),
    "D": g("####. #...# #...# #...# #...# #...# ####."),
    "E": g("##### #.... #.... ####. #.... #.... #####"),
    "F": g("##### #.... #.... ####. #.... #.... #...."),
    "G": g(".###. #...# #.... #.### #...# #...# .####"),
    "H": g("#...# #...# #...# ##### #...# #...# #...#"),
    "I": g("### .#. .#. .#. .#. .#. ###"),
    "J": g("..### ...#. ...#. ...#. ...#. #..#. .##.."),
    "K": g("#...# #..#. #.#.. ##... #.#.. #..#. #...#"),
    "L": g("#.... #.... #.... #.... #.... #.... #####"),
    "M": g("#...# ##.## #.#.# #.#.# #...# #...# #...#"),
    "N": g("#...# #...# ##..# #.#.# #..## #...# #...#"),
    "O": g(".###. #...# #...# #...# #...# #...# .###."),
    "P": g("####. #...# #...# ####. #.... #.... #...."),
    "Q": g(".###. #...# #...# #...# #.#.# #..#. .##.#"),
    "R": g("####. #...# #...# ####. #.#.. #..#. #...#"),
    "S": g(".#### #.... #.... .###. ....# ....# ####."),
    "T": g("##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#.."),
    "U": g("#...# #...# #...# #...# #...# #...# .###."),
    "V": g("#...# #...# #...# #...# #...# .#.#. ..#.."),
    "W": g("#...# #...# #...# #.#.# #.#.# #.#.# .#.#."),
    "X": g("#...# #...# .#.#. ..#.. .#.#. #...# #...#"),
    "Y": g("#...# #...# .#.#. ..#.. ..#.. ..#.. ..#.."),
    "Z": g("##### ....# ...#. ..#.. .#... #.... #####"),
    "0": g(".###. #...# #...# #...# #...# #...# .###."),
    "1": g(".#. ##. .#. .#. .#. .#. ###"),
    "2": g(".###. #...# ....# ...#. ..#.. .#... #####"),
    "3": g(".###. #...# ....# ..##. ....# #...# .###."),
    "4": g("...#. ..##. .#.#. #..#. ##### ...#. ...#."),
    "5": g("##### #.... ####. ....# ....# #...# .###."),
    "6": g("..##. .#... #.... ####. #...# #...# .###."),
    "7": g("##### ....# ...#. ..#.. .#... .#... .#..."),
    "8": g(".###. #...# #...# .###. #...# #...# .###."),
    "9": g(".###. #...# #...# .#### ....# ...#. .##.."),
    ":": g(". . # . # . ."),
    "-": g("... ... ... ### ... ... ..."),
    ".": g(". . . . . . #"),
    "'": g("# # . . . . ."),
    "’": g("# # . . . . ."),
    "/": g("....# ...#. ...#. ..#.. .#... .#... #...."),
    "(": g("..# .#. #.. #.. #.. .#. ..#"),
    ")": g("#.. .#. ..# ..# ..# .#. #.."),
    "°": g(".#. #.# .#. ... ... ... ..."),
    " ": g("... ... ... ... ... ... ..."),
    "Œ": g(".###### #..#... #..#... #..#### #..#... #..#... .######"),
    "Ç": g(".###. #...# #.... #.... #...# .###. ..#.."),
  };
  // capitales accentuées : accent sur la 1re rangée, lettre ramassée sur 6 rangées
  const six = {
    E: g("##### #.... ####. #.... #.... #####"), A: g(".###. #...# #...# ##### #...# #...#"),
    I: g("### .#. .#. .#. .#. ###"), O: g(".###. #...# #...# #...# #...# .###."),
    U: g("#...# #...# #...# #...# #...# .###.")
  };
  const acc = { "É":["E","...#."], "È":["E",".#..."], "Ê":["E","..#.."], "Ë":["E",".#.#."],
    "À":["A",".#..."], "Â":["A","..#.."], "Ä":["A",".#.#."], "Î":["I",".#."], "Ï":["I","#.#"],
    "Ô":["O","..#.."], "Ö":["O",".#.#."], "Û":["U","..#.."], "Ü":["U",".#.#."], "Ù":["U",".#..."] };
  for (const [ch, [b, a]] of Object.entries(acc)) F[ch] = [a, ...six[b]];

  // police étroite (4 colonnes) pour les destinations longues, comme sur les vrais afficheurs
  const N = {
    "A": g(".##. #..# #..# #### #..# #..# #..#"), "B": g("###. #..# #..# ###. #..# #..# ###."),
    "C": g(".##. #..# #... #... #... #..# .##."), "D": g("###. #..# #..# #..# #..# #..# ###."),
    "E": g("#### #... #... ###. #... #... ####"), "F": g("#### #... #... ###. #... #... #..."),
    "G": g(".##. #..# #... #.## #..# #..# .###"), "H": g("#..# #..# #..# #### #..# #..# #..#"),
    "I": g("# # # # # # #"), "J": g("...# ...# ...# ...# ...# #..# .##."),
    "K": g("#..# #.#. ##.. ##.. #.#. #..# #..#"), "L": g("#... #... #... #... #... #... ####"),
    "M": F["M"], "N": g("#..# ##.# ##.# #.## #.## #..# #..#"),
    "O": g(".##. #..# #..# #..# #..# #..# .##."), "P": g("###. #..# #..# ###. #... #... #..."),
    "Q": g(".##. #..# #..# #..# #.#. #..# .#.#"), "R": g("###. #..# #..# ###. #.#. #..# #..#"),
    "S": g(".### #... #... .##. ...# ...# ###."), "T": g("### .#. .#. .#. .#. .#. .#."),
    "U": g("#..# #..# #..# #..# #..# #..# .##."), "V": g("#..# #..# #..# #..# #..# .##. .##."),
    "W": F["W"], "X": g("#..# #..# .##. .##. .##. #..# #..#"), "Y": g("#.# #.# #.# .#. .#. .#. .#."),
    "Z": g("#### ...# ..#. .#.. .#.. #... ####"),
    "0": g(".##. #..# #..# #..# #..# #..# .##."), "1": g(".# ## .# .# .# .# .#"),
    "2": g(".##. #..# ...# ..#. .#.. #... ####"), "3": g("###. ...# ...# .##. ...# ...# ###."),
    "4": g("..#. .##. #.#. #.#. #### ..#. ..#."), "5": g("#### #... ###. ...# ...# #..# .##."),
    "6": g(".##. #... #... ###. #..# #..# .##."), "7": g("#### ...# ..#. ..#. .#.. .#.. .#.."),
    "8": g(".##. #..# #..# .##. #..# #..# .##."), "9": g(".##. #..# #..# .### ...# ...# .##."),
    " ": g(".. .. .. .. .. .. .."), "-": g(".. .. .. ## .. .. .."), "/": g("..# ..# .#. .#. .#. #.. #.."),
    "Ç": g(".##. #..# #... #... #..# .##. .#.."),
  };
  const nsix = { E: g("#### #... ###. #... #... ####"), A: g(".##. #..# #..# #### #..# #..#"),
    I: g("# # # # # #"), O: g(".##. #..# #..# #..# #..# .##."), U: g("#..# #..# #..# #..# #..# .##.") };
  const nacc = { "É":["E","..#."], "È":[ "E",".#.."], "Ê":["E",".##."], "Ë":["E","#..#"], "À":["A",".#.."], "Â":["A",".##."],
    "Ä":["A","#..#"], "Î":["I","#"], "Ï":["I","#"], "Ô":["O",".##."], "Ö":["O","#..#"], "Û":["U",".##."], "Ü":["U","#..#"], "Ù":["U",".#.."] };
  for (const [ch, [b, a]] of Object.entries(nacc)) N[ch] = [a, ...nsix[b]];

  const strip = ch => ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
  function glyph(ch, narrow){
    if (narrow){ if (N[ch]) return N[ch]; const b = strip(ch); if (N[b]) return N[b]; }
    if (F[ch]) return F[ch];
    return F[strip(ch)] || null;
  }
  /* -> { w: largeur en colonnes, px: [[x,y],...] } */
  function layout(text, narrow){
    let x = 0; const px = [];
    for (const ch of String(text).toUpperCase()){
      const gl = glyph(ch, narrow);
      if (!gl){ x += narrow ? 3 : 4; continue; }
      gl.forEach((row, y) => { for (let i = 0; i < row.length; i++) if (row[i] === "#") px.push([x + i, y]); });
      x += gl[0].length + 1;
    }
    return { w: Math.max(0, x - 1), px };
  }
  return { layout };
})();

/* ================== couleurs ================== */
function ledColor(hex){
  // éclaircit les couleurs sombres pour qu'elles se lisent comme des LED allumées
  let r = parseInt(hex.slice(1,3),16)/255, gg = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  const mx = Math.max(r,gg,b), mn = Math.min(r,gg,b); let h = 0, s = 0, l = (mx+mn)/2;
  if (mx !== mn){ const d = mx-mn; s = l > .5 ? d/(2-mx-mn) : d/(mx+mn);
    h = mx === r ? (gg-b)/d + (gg < b ? 6 : 0) : mx === gg ? (b-r)/d + 2 : (r-gg)/d + 4; h /= 6; }
  l = Math.max(l, .6); if (s < .12) l = Math.max(l, .72);
  return `hsl(${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%)`;
}

let LEDID = 0;
const r2 = n => Math.round(n * 100) / 100;

/* ================== afficheur avant (dans le bus) ================== */
// abréviations légères (comme sur les vrais afficheurs) puis fortes (dernier recours)
const LIGHT = [[/\bCHAPELLE-LEZ-HERLAIMONT\b/g,"CHAPELLE"],[/\s*\([^)]*\)/g,""],[/\bSAINTE-/g,"STE-"],[/\bSAINT-/g,"ST-"],
  [/\bSAINTE\b/g,"STE"],[/\bSAINT\b/g,"ST"],[/([A-ZÀ-ÞŒ.'\-]+)\/[A-ZÀ-ÞŒ.'\-]+/g,"$1"]]; // noms bilingues : on garde le français
const HEAVY = [[/\bCARREFOUR\b/g,"CARREF."],[/\bCHAUSSÉE\b/g,"CHÉE"],[/\bCOMMUNALE\b/g,"COM."],[/\bCOMMERCIAL\b/g,"COMM."],
  [/\bCENTRE\b/g,"CTRE"],[/\bAVENUE\b/g,"AV."],[/\bBOULEVARD\b/g,"BD"],[/\bROUTE\b/g,"RTE"],[/\bPLACE\b/g,"PL."],[/\bRUE\b/g,"R."],
  [/\bCHARBONNAGE\b/g,"CHARB."],[/\bHÔPITAL\b/g,"HÔP."],[/-LEZ-/g,"-L-"],[/\bSTATION\b/g,"ST."],[/\bÉGLISE\b/g,"ÉGL."]];
const abbr = (t, list) => list.reduce((acc, [re, r]) => acc.replace(re, r), t);
/* meilleure coupure en deux lignes (sur les espaces et les tirets) */
function split2(text, narrow){
  const toks = text.match(/[^ \-\/]+[ \-\/]?/g) || [text];
  let best = null;
  for (let k = 1; k < toks.length; k++){
    const a = toks.slice(0, k).join("").trim(), b = toks.slice(k).join("").trim();
    // couper au milieu d'un nom composé (tiret, barre) seulement en dernier recours
    const m = Math.max(LED.layout(a, narrow).w, LED.layout(b, narrow).w) + (/[\-\/]$/.test(toks[k - 1]) ? 40 : 0);
    if (!best || m < best[0]) best = [m, a, b];
  }
  return best;
}
/* mise en page : la plus grande écriture possible.
   Une ligne si elle donne des lettres au moins aussi grandes que deux lignes ; sinon deux lignes. Jamais de défilement. */
function plan(town, place, aw, ah){
  const T0 = town.toUpperCase(), P0 = place.toUpperCase(), full = (T0 + " " + P0).trim();
  const TL = abbr(T0, LIGHT), PL = abbr(P0, LIGHT), light = (TL + " " + PL).trim();
  const TH = abbr(TL, HEAVY), PH = abbr(PL, HEAVY), heavy = (TH + " " + PH).trim();
  const pitch = (lines, narrow) => {
    const w = Math.max(...lines.map(t => LED.layout(t, narrow).w), 1), rows = lines.length === 1 ? 7 : 15;
    return Math.min(ah / (rows + .4), aw / w);
  };
  const cands = [];
  const add = (lines, narrow, bonus = 1) => { if (lines.every(Boolean)) cands.push({lines, narrow, p: pitch(lines, narrow) * bonus}); };
  // une ligne (complète, puis abréviations légères)
  add([full], false); add([light], false, .97);
  // deux lignes : commune / lieu d'abord, puis meilleure coupure ; police étroite en dernier
  for (const [T, P, txt, k] of [[T0, P0, full, 1], [TL, PL, light, .97], [TH, PH, heavy, .75]])
    for (const narrow of [false, true]){
      const nb = narrow ? .93 : 1;
      if (T && P) add([T, P], narrow, k * nb);
      const sp = split2(txt, narrow); if (sp) add([sp[1], sp[2]], narrow, k * nb * .96);
    }
  add([heavy], false, .75);
  // à taille égale, on préfère une seule ligne
  cands.sort((x, y) => (y.p * (y.lines.length === 1 ? 1.06 : 1)) - (x.p * (x.lines.length === 1 ? 1.06 : 1)));
  const c = cands[0];
  return {lines: c.lines, narrow: c.narrow, p: pitch(c.lines, c.narrow)};
}

/* box: {x,y,w,h} en unités SVG ; num: numéro de ligne ; colors: [fond, texte] de la ligne ; town/place: destination */
function ledDisplay(box, num, colors, town, place){
  const id = "d" + (++LEDID), [bg, fg] = Array.isArray(colors) ? colors : [colors, "#000"];
  const amber = "#FFB01F", pad = box.h * .1;
  // numéro de ligne dans un carré de la couleur de la ligne (comme les pastilles)
  const n = LED.layout(num), nh = box.h - 2 * pad, pn = nh * .74 / 7;
  const nbw = Math.max(nh * .95, n.w * pn + 2.6 * pn), nbx = box.x + pad, nby = box.y + pad;
  const nox = nbx + (nbw - n.w * pn) / 2, noy = nby + (nh - 7 * pn) / 2;
  const numDots = n.px.map(([x, y]) => `<rect x="${r2(nox + x * pn + pn * .08)}" y="${r2(noy + y * pn + pn * .08)}" width="${r2(pn * .84)}" height="${r2(pn * .84)}" rx="${r2(pn * .3)}" fill="${fg}"/>`).join("");
  // destination : remplit toute la zone restante
  const ax = nbx + nbw + pad * 1.1, aw = box.x + box.w - pad * .7 - ax, ay = box.y + pad * .55, ah = box.h - pad * 1.1;
  const L = plan(town || "", place || "", aw, ah), p = L.p, rad = r2(p * .4);
  const rows = L.lines.length === 1 ? 7 : 15;
  const widths = L.lines.map(t => LED.layout(t, L.narrow).w), tw = Math.max(...widths) * p;
  const ox = ax + (aw - tw) / 2, oy = ay + (ah - rows * p) / 2;
  let lit = "";
  L.lines.forEach((t, i) => {
    const lay = LED.layout(t, L.narrow), dx = Math.round((Math.max(...widths) - lay.w) / 2);  // chaque ligne centrée
    for (const [x, y] of lay.px) lit += `<circle cx="${r2(ox + (dx + x + .5) * p)}" cy="${r2(oy + (i * 8 + y + .5) * p)}" r="${rad}" fill="${amber}"/>`;
  });
  return `<g class="led">
    <defs><pattern id="${id}p" width="${r2(p)}" height="${r2(p)}" patternUnits="userSpaceOnUse" x="${r2(ox)}" y="${r2(oy)}">
      <circle cx="${r2(p/2)}" cy="${r2(p/2)}" r="${rad}" fill="#2a1f0a"/></pattern>
      <clipPath id="${id}c"><rect x="${r2(ax - p * .3)}" y="${r2(box.y + 1)}" width="${r2(aw + p * .6)}" height="${r2(box.h - 2)}"/></clipPath>
      <filter id="${id}f" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="${r2(p*.5)}" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <rect x="${r2(box.x - 2)}" y="${r2(box.y - 2)}" width="${r2(box.w + 4)}" height="${r2(box.h + 4)}" rx="2.5" fill="#050505"/>
    <rect x="${r2(ax - p * .3)}" y="${r2(box.y + 1)}" width="${r2(aw + p * .6)}" height="${r2(box.h - 2)}" fill="url(#${id}p)" clip-path="url(#${id}c)"/>
    <rect x="${r2(nbx)}" y="${r2(nby)}" width="${r2(nbw)}" height="${r2(nh)}" rx="${r2(nh * .14)}" fill="${bg}"/>${numDots}
    <g filter="url(#${id}f)">${lit}</g></g>`;
}

/* ================== grand texte LED (heure / minutes) ================== */
function ledBig(text, pitch = 7, color = "#FFB01F"){
  const id = "b" + (++LEDID), L = LED.layout(text), cols = L.w + 2, rows = 9, rad = r2(pitch * .42);
  const W = cols * pitch, H = rows * pitch;
  const lit = L.px.map(([x, y]) => `<circle cx="${r2((x + 1.5) * pitch)}" cy="${r2((y + 1.5) * pitch)}" r="${rad}" fill="${color}"/>`).join("");
  return `<svg class="ledbig" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${text}">
    <defs><pattern id="${id}p" width="${pitch}" height="${pitch}" patternUnits="userSpaceOnUse"><circle cx="${pitch/2}" cy="${pitch/2}" r="${rad}" fill="#241a07"/></pattern>
    <filter id="${id}f" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="${r2(pitch*.45)}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <rect width="${W}" height="${H}" fill="url(#${id}p)"/><g filter="url(#${id}f)">${lit}</g></svg>`;
}

/* ================== bus de face (dessins originaux) ================== */
const Y = "#FFCD00", YD = "#D9AE00", INK = "#0E0F11";
const shadow = `<ellipse cx="200" cy="330" rx="170" ry="9" fill="rgba(0,0,0,.22)"/>`;
const tires = (y = 286) => `<rect x="72" y="${y}" width="46" height="${328 - y}" rx="8" fill="#111"/><rect x="282" y="${y}" width="46" height="${328 - y}" rx="8" fill="#111"/>
  <rect x="78" y="${y}" width="34" height="${328 - y}" rx="5" fill="url(#TREAD)" opacity=".5"/><rect x="288" y="${y}" width="34" height="${328 - y}" rx="5" fill="url(#TREAD)" opacity=".5"/>`;
const plate = (x, y, txt) => `<rect x="${x}" y="${y}" width="64" height="15" rx="2" fill="#fff" stroke="#9aa0a6" stroke-width=".8"/>
  <rect x="${x}" y="${y}" width="6" height="15" rx="1.5" fill="#1d4fb8"/>
  <text x="${x + 36}" y="${y + 11.3}" text-anchor="middle" font-family="Barlow Condensed,Arial Narrow,sans-serif" font-weight="600" font-size="11" fill="#B0121B">${txt}</text>`;
const pictos = (x, y) => [0, 1, 2].map(i => `<circle cx="${x + i * 14}" cy="${y}" r="6" fill="#1D63C9" stroke="#fff" stroke-width="1"/><circle cx="${x + i * 14}" cy="${y - 2.2}" r="1.5" fill="#fff"/><rect x="${x + i * 14 - 1.2}" y="${y - .2}" width="2.4" height="3.8" rx="1" fill="#fff"/>`).join("");
const wipers = y => `<path d="M118 ${y} L214 ${y - 22}" stroke="#050505" stroke-width="3.2" stroke-linecap="round"/><path d="M226 ${y} L322 ${y - 20}" stroke="#050505" stroke-width="3.2" stroke-linecap="round"/>`;
const glare = (y1, y2) => `<path d="M96 ${y1} L152 ${y1} L106 ${y2} L72 ${y2} Z" fill="rgba(255,255,255,.08)"/><path d="M162 ${y1} L178 ${y1} L130 ${y2} L114 ${y2} Z" fill="rgba(255,255,255,.05)"/>`;
const fleetNo = (x, y, n, c = "#fff") => `<text x="${x}" y="${y}" text-anchor="end" font-family="Barlow Condensed,Arial Narrow,sans-serif" font-weight="700" font-size="15" fill="${c}">${n}</text>`;
const lamp = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#F4F7FA"/><circle cx="${cx - r * .3}" cy="${cy - r * .3}" r="${r * .35}" fill="#fff"/>`;

/* chaque modèle : body (silhouette jaune) + glass (zone vitrée) + détails ; GL = dégradé du vitrage */
const BUSES = [
  { // récent noir et jaune (pare-brise noir intégral, phares en coins anguleux)
    disp: {x: 82, y: 34, w: 236, h: 38},
    body: "M60 42 Q60 16 86 14 L314 14 Q340 16 340 42 L344 286 Q344 300 330 300 L70 300 Q56 300 56 286 Z",
    draw: d => `<path d="M66 38 Q66 22 88 21 L312 21 Q334 22 334 38 L336 208 Q300 220 200 222 Q100 220 64 208 Z" fill="url(#GL)"/>
      ${glare(84, 206)}${d}<path d="M70 80 L330 80" stroke="#000" stroke-width="2" opacity=".7"/>
      ${fleetNo(326, 98, "7381")}${wipers(208)}
      <path d="M57 232 L112 240 L132 288 L60 292 Z" fill="${INK}"/><path d="M343 232 L288 240 L268 288 L340 292 Z" fill="${INK}"/>
      ${lamp(80, 258, 6)}${lamp(99, 265, 5)}${lamp(320, 258, 6)}${lamp(301, 265, 5)}
      <path d="M118 286 L282 286" stroke="#1b1b1b" stroke-width="6" stroke-linecap="round"/>${plate(168, 256, "1-BUS-381")}${pictos(140, 240)}
      <path d="M68 28 Q46 30 40 46" stroke="${INK}" stroke-width="4" fill="none"/><rect x="26" y="44" width="22" height="50" rx="7" fill="${INK}"/>
      <path d="M332 28 Q354 30 360 46" stroke="${INK}" stroke-width="4" fill="none"/><rect x="352" y="44" width="22" height="50" rx="7" fill="${INK}"/>`
  },
  { // articulé classique tout jaune
    disp: {x: 78, y: 54, w: 244, h: 38},
    body: "M58 44 Q58 14 92 12 L308 12 Q342 14 342 44 L344 288 Q344 300 332 300 L68 300 Q56 300 56 288 Z",
    draw: d => `<path d="M64 48 L336 48 L338 214 Q200 230 62 214 Z" fill="url(#GL)"/>${glare(100, 212)}${d}
      ${wipers(214)}${fleetNo(332, 110, "5.703")}
      <path d="M70 238 Q200 252 330 238" stroke="rgba(0,0,0,.18)" stroke-width="2" fill="none"/>
      <rect x="68" y="262" width="52" height="17" rx="7" fill="#E9EEF2" stroke="#59606a" stroke-width="1.5"/><rect x="280" y="262" width="52" height="17" rx="7" fill="#E9EEF2" stroke="#59606a" stroke-width="1.5"/>
      ${lamp(84, 270.5, 5)}${lamp(316, 270.5, 5)}
      ${fleetNo(110, 252, "5703", "#3a3a3a")}${plate(168, 276, "1-BUS-703")}${pictos(132, 286)}
      <path d="M60 60 Q40 60 30 70" stroke="#2a2a2a" stroke-width="4" fill="none"/><rect x="16" y="68" width="20" height="48" rx="6" fill="#2a2a2a"/>`
  },
  { // articulé tout jaune, gros rétros jaunes
    disp: {x: 86, y: 36, w: 228, h: 38},
    body: "M58 40 Q58 14 88 12 L312 12 Q342 14 342 40 L344 288 Q344 300 332 300 L68 300 Q56 300 56 288 Z",
    draw: d => `<path d="M74 30 L326 30 L330 212 Q200 224 70 212 Z" fill="url(#GL)"/>${glare(86, 210)}${d}
      <path d="M74 82 L326 82" stroke="#000" stroke-width="2.5"/>${fleetNo(318, 100, "6255")}${wipers(212)}
      <path d="M70 212 Q200 228 330 212 L330 220 Q200 236 70 220 Z" fill="#0b0b0b"/>
      <path d="M62 250 L120 242 L126 270 L68 278 Z" fill="#DFE4E8" stroke="#6b7177" stroke-width="1.5"/><path d="M338 250 L280 242 L274 270 L332 278 Z" fill="#DFE4E8" stroke="#6b7177" stroke-width="1.5"/>
      ${lamp(84, 261, 6)}${lamp(104, 258, 4.5)}${lamp(316, 261, 6)}${lamp(296, 258, 4.5)}
      <path d="M150 244 Q200 250 250 244" stroke="rgba(0,0,0,.14)" stroke-width="2" fill="none"/>
      ${plate(168, 276, "1-BUS-255")}${pictos(132, 284)}
      <path d="M64 34 Q40 32 30 48" stroke="${YD}" stroke-width="5" fill="none"/><rect x="14" y="46" width="26" height="60" rx="9" fill="url(#BODY)" stroke="${YD}" stroke-width="2"/>
      <path d="M336 34 Q360 32 370 48" stroke="${YD}" stroke-width="5" fill="none"/><rect x="360" y="46" width="26" height="60" rx="9" fill="url(#BODY)" stroke="${YD}" stroke-width="2"/>`
  },
  { // électrique : cadre jaune, masque noir avec bandes chromées
    disp: {x: 84, y: 34, w: 232, h: 38},
    body: "M58 44 Q58 12 94 10 L306 10 Q342 12 342 44 L344 288 Q344 300 332 300 L68 300 Q56 300 56 288 Z",
    draw: d => `<path d="M70 34 Q70 22 92 21 L308 21 Q330 22 330 34 L334 206 L66 206 Z" fill="url(#GL)"/>${glare(84, 204)}${d}
      ${fleetNo(322, 96, "5701")}${wipers(204)}
      <path d="M66 206 L334 206 L338 232 Q300 266 200 268 Q100 266 62 232 Z" fill="#0b0b0b"/>
      <path d="M100 226 L300 226" stroke="url(#CHROME)" stroke-width="3.4" stroke-linecap="round"/><path d="M110 237 L290 237" stroke="url(#CHROME)" stroke-width="3.4" stroke-linecap="round"/>
      ${lamp(88, 248, 6)}${lamp(106, 253, 5)}${lamp(312, 248, 6)}${lamp(294, 253, 5)}
      <rect x="244" y="276" width="56" height="13" rx="3" fill="${YD}" opacity=".55"/>${pictos(132, 282)}
      <path d="M66 30 Q44 30 34 44" stroke="#151515" stroke-width="4" fill="none"/><rect x="20" y="42" width="22" height="54" rx="7" fill="#151515"/>`
  },
  { // ancien carré : pare-brise cerclé de caoutchouc, boîtier fauteuil bleu
    disp: {x: 116, y: 40, w: 202, h: 32},
    body: "M62 28 Q62 14 78 14 L322 14 Q338 14 338 28 L340 298 L60 298 Z",
    draw: d => `<rect x="68" y="22" width="264" height="194" rx="20" fill="#0a0a0a"/><rect x="75" y="29" width="250" height="180" rx="15" fill="url(#GLB)"/>
      ${glare(80, 206)}<rect x="86" y="38" width="26" height="36" rx="2" fill="#2563B8"/>
      <circle cx="99" cy="47" r="2.6" fill="#fff"/><path d="M98 51 L98 60 L105 60 L107 67" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M93 58 A6.5 6.5 0 1 0 104 65" stroke="#fff" stroke-width="2" fill="none"/>
      ${d}${fleetNo(318, 98, "5.207")}${wipers(206)}
      <rect x="74" y="232" width="28" height="10" rx="2" fill="#F28C28"/><rect x="298" y="232" width="28" height="10" rx="2" fill="#F28C28"/>
      <rect x="72" y="252" width="28" height="16" rx="2" fill="#DDE3E8" stroke="#444" stroke-width="1.2"/><rect x="104" y="252" width="28" height="16" rx="2" fill="#DDE3E8" stroke="#444" stroke-width="1.2"/>
      <rect x="300" y="252" width="28" height="16" rx="2" fill="#DDE3E8" stroke="#444" stroke-width="1.2"/><rect x="268" y="252" width="28" height="16" rx="2" fill="#DDE3E8" stroke="#444" stroke-width="1.2"/>
      <rect x="156" y="236" width="88" height="34" rx="4" fill="rgba(0,0,0,.05)" stroke="rgba(0,0,0,.18)"/>
      <rect x="80" y="276" width="240" height="9" rx="4.5" fill="#222"/>${plate(168, 288, "1-BUS-207")}
      <path d="M62 70 L44 72" stroke="#1a1a1a" stroke-width="4"/><rect x="30" y="64" width="16" height="46" rx="4" fill="#1a1a1a"/>
      <path d="M338 70 L356 72" stroke="#1a1a1a" stroke-width="4"/><rect x="354" y="64" width="16" height="46" rx="4" fill="#1a1a1a"/>`
  },
  { // articulé au toit gris, afficheur au-dessus du pare-brise
    disp: {x: 82, y: 36, w: 236, h: 34},
    body: "M60 40 Q60 22 80 20 L320 20 Q340 22 340 40 L344 288 Q344 300 332 300 L68 300 Q56 300 56 288 Z",
    draw: d => `<path d="M62 34 Q66 10 104 8 L296 8 Q334 10 338 34 Z" fill="url(#ROOF)"/>
      <rect x="74" y="30" width="252" height="46" rx="5" fill="#0b0b0b"/>${d}
      <path d="M70 82 L330 82 L332 212 Q200 222 68 212 Z" fill="url(#GL)"/>${glare(86, 210)}${fleetNo(324, 100, "3513")}${wipers(212)}
      <circle cx="84" cy="262" r="8.5" fill="#EEF1F4" stroke="#555" stroke-width="1.5"/><circle cx="104" cy="262" r="8.5" fill="#EEF1F4" stroke="#555" stroke-width="1.5"/>
      <circle cx="316" cy="262" r="8.5" fill="#EEF1F4" stroke="#555" stroke-width="1.5"/><circle cx="296" cy="262" r="8.5" fill="#EEF1F4" stroke="#555" stroke-width="1.5"/>
      ${lamp(84, 262, 4)}${lamp(104, 262, 4)}${lamp(316, 262, 4)}${lamp(296, 262, 4)}
      <rect x="84" y="284" width="232" height="7" rx="3.5" fill="#1c1c1c"/>${plate(168, 262, "1-BUS-513")}${pictos(132, 246)}
      <path d="M62 44 Q42 44 32 58" stroke="#1a1a1a" stroke-width="4" fill="none"/><rect x="18" y="56" width="20" height="48" rx="6" fill="#1a1a1a"/>`
  }
];

/* bus complet : model = index, num = numéro de ligne, col = [fond, texte] de la ligne, l1/l2 = commune / lieu */
function busSVG(model, num, col, l1, l2, label){
  const B = BUSES[((model % BUSES.length) + BUSES.length) % BUSES.length];
  const u = "u" + (++LEDID);
  const defs = `<defs>
    <linearGradient id="${u}BODY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFDA3D"/><stop offset=".55" stop-color="#FFCD00"/><stop offset="1" stop-color="#EFBC00"/></linearGradient>
    <linearGradient id="${u}SIDE" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".09" stop-color="#000" stop-opacity="0"/>
      <stop offset=".91" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
    <linearGradient id="${u}GL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B3139"/><stop offset=".45" stop-color="#14171B"/><stop offset="1" stop-color="#0B0C0E"/></linearGradient>
    <linearGradient id="${u}GLB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2D4256"/><stop offset=".5" stop-color="#18232E"/><stop offset="1" stop-color="#10171E"/></linearGradient>
    <linearGradient id="${u}ROOF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D4D8DC"/><stop offset="1" stop-color="#A9AEB4"/></linearGradient>
    <linearGradient id="${u}CHROME" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E959C"/><stop offset=".5" stop-color="#F1F4F6"/><stop offset="1" stop-color="#8E959C"/></linearGradient>
    <pattern id="${u}TREAD" width="34" height="6" patternUnits="userSpaceOnUse"><rect width="34" height="2" fill="#2b2b2b"/></pattern>
    <clipPath id="${u}CLIP"><path d="${B.body}"/></clipPath></defs>`;
  const fix = s => s.replace(/url\(#(BODY|SIDE|GL|GLB|ROOF|CHROME|TREAD)\)/g, `url(#${u}$1)`);
  const body = `<path d="${B.body}" fill="url(#BODY)"/><rect x="40" y="0" width="320" height="300" fill="url(#SIDE)" clip-path="url(#${u}CLIP)"/>
    <rect x="40" y="290" width="320" height="12" fill="rgba(0,0,0,.10)" clip-path="url(#${u}CLIP)"/>`;
  return `<svg class="bus" viewBox="0 0 400 340" role="img" aria-label="${label || ""}">${defs}${fix(shadow + tires() + body + B.draw(ledDisplay(B.disp, num, col, l1, l2)))}</svg>`;
}
