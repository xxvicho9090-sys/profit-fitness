'use strict';
/* ProFit — PWA de entrenamiento. Sin dependencias. Datos en localStorage. */
const IMG = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const MUSC = { abdominals: 'Abdominales', abductors: 'Abductores', adductors: 'Aductores', biceps: 'Bíceps', calves: 'Pantorrillas', chest: 'Pecho', forearms: 'Antebrazos', glutes: 'Glúteos', hamstrings: 'Isquiotibiales', lats: 'Dorsales', 'lower back': 'Lumbar', 'middle back': 'Espalda media', neck: 'Cuello', quadriceps: 'Cuádriceps', shoulders: 'Hombros', traps: 'Trapecio', triceps: 'Tríceps' };
const EQUIP = { 'body only': 'Peso corporal', machine: 'Máquina', other: 'Otro', 'foam roll': 'Rodillo', none: 'Sin especificar', kettlebells: 'Kettlebell', dumbbell: 'Mancuernas', cable: 'Polea', barbell: 'Barra', bands: 'Bandas', 'medicine ball': 'Balón medicinal', 'exercise ball': 'Pelota suiza', 'e-z curl bar': 'Barra Z' };
const CAT = { strength: 'Fuerza', stretching: 'Estiramiento', plyometrics: 'Pliometría', strongman: 'Strongman', powerlifting: 'Powerlifting', 'olympic weightlifting': 'Halterofilia', cardio: 'Cardio' };
const LVL = { beginner: 'Principiante', intermediate: 'Intermedio', expert: 'Experto' };
const FOCUS = { m: ['chest', 'lats', 'shoulders', 'biceps', 'triceps', 'traps', 'middle back', 'forearms'], f: ['glutes', 'hamstrings', 'abductors', 'adductors', 'quadriceps', 'abdominals', 'calves'] };
const ACT = [[1.2, 'Sedentario'], [1.375, 'Ligero (1-3 d/sem)'], [1.55, 'Moderado (3-5 d/sem)'], [1.725, 'Alto (6-7 d/sem)'], [1.9, 'Muy alto / trabajo físico']];
const GOALS = { lose: 'Perder grasa', maintain: 'Mantener', gain: 'Ganar músculo', recomp: 'Recomposición' };
// Campos de medición: [clave, etiqueta, unidad, grupo]
const FIELDS = [
  ['weight', 'Peso', 'kg', 'Composición'], ['bf', '% grasa', '%', 'Composición'], ['muscle', 'Masa muscular', 'kg', 'Composición'], ['water', 'Agua corporal', '%', 'Composición'], ['visceral', 'Grasa visceral', 'nivel', 'Composición'], ['bone', 'Masa ósea', 'kg', 'Composición'],
  ['neck', 'Cuello', 'cm', 'Perímetros'], ['shoulders', 'Hombros', 'cm', 'Perímetros'], ['chest', 'Pecho', 'cm', 'Perímetros'], ['waist', 'Cintura', 'cm', 'Perímetros'], ['abdomen', 'Abdomen (ombligo)', 'cm', 'Perímetros'], ['hip', 'Cadera / glúteos', 'cm', 'Perímetros'],
  ['bicepL', 'Bíceps izq.', 'cm', 'Perímetros'], ['bicepR', 'Bíceps der.', 'cm', 'Perímetros'], ['forearm', 'Antebrazo', 'cm', 'Perímetros'], ['wrist', 'Muñeca', 'cm', 'Perímetros'],
  ['thighL', 'Muslo izq.', 'cm', 'Perímetros'], ['thighR', 'Muslo der.', 'cm', 'Perímetros'], ['calf', 'Pantorrilla', 'cm', 'Perímetros'],
  ['skfTri', 'Pliegue tríceps', 'mm', 'Pliegues'], ['skfSub', 'Pliegue subescapular', 'mm', 'Pliegues'], ['skfSup', 'Pliegue suprailíaco', 'mm', 'Pliegues'], ['skfAbd', 'Pliegue abdominal', 'mm', 'Pliegues'], ['skfThigh', 'Pliegue muslo', 'mm', 'Pliegues'],
  ['rhr', 'FC en reposo', 'lpm', 'Salud'], ['hrv', 'VFC (HRV)', 'ms', 'Salud'], ['sys', 'Presión sistólica', 'mmHg', 'Salud'], ['dia', 'Presión diastólica', 'mmHg', 'Salud'], ['spo2', 'SpO₂', '%', 'Salud'], ['glu', 'Glucosa en ayunas', 'mg/dL', 'Salud'], ['temp', 'Temperatura', '°C', 'Salud'],
  ['sleep', 'Sueño', 'h', 'Hábitos'], ['steps', 'Pasos', 'pasos', 'Hábitos'], ['kcal', 'Calorías ingeridas', 'kcal', 'Hábitos'], ['prot', 'Proteína', 'g', 'Hábitos'], ['h2o', 'Agua bebida', 'L', 'Hábitos'], ['stress', 'Estrés (1-10)', '', 'Hábitos'], ['energy', 'Energía (1-10)', '', 'Hábitos'],
  ['jump', 'Salto vertical', 'cm', 'Rendimiento'], ['grip', 'Fuerza de agarre', 'kg', 'Rendimiento'], ['run1k', 'Carrera 1 km', 'min', 'Rendimiento'], ['run5k', 'Carrera 5 km', 'min', 'Rendimiento'], ['plank', 'Plancha máx.', 'seg', 'Rendimiento'], ['pushups', 'Flexiones máx.', 'rep', 'Rendimiento'], ['pullups', 'Dominadas máx.', 'rep', 'Rendimiento'], ['flex', 'Sit & reach', 'cm', 'Rendimiento'], ['vo2', 'VO₂máx', 'ml/kg/min', 'Rendimiento']
];
const FMAP = Object.fromEntries(FIELDS.map(f => [f[0], f]));

let EX = [], EXMAP = {};
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (n, d = 1) => (n == null || isNaN(n)) ? '—' : (+n).toFixed(d).replace(/\.0+$/, '');
const fdate = iso => new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' });

/* ---------- Estado ---------- */
const KEY = 'profit.v1';
let S = { profile: { sex: '', name: '', dob: '', height: '', activity: 1.55, goal: 'maintain', level: 'beginner', rest: 90 }, measures: [], workouts: [], routines: [], active: null };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { }
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const P = () => S.profile;
const age = () => Calc.ageFrom(P().dob);
const latest = k => { for (let i = S.measures.length - 1; i >= 0; i--) { const v = S.measures[i][k]; if (v != null && v !== '') return +v; } return null; };
const series = k => S.measures.filter(m => m[k] != null && m[k] !== '').map(m => ({ d: m.d, v: +m[k] }));

/* ---------- Utilidades de ejercicio ---------- */
const exName = id => EXMAP[id]?.n || id;
const e1rm = s => (s.w > 0 && s.r > 0) ? Calc.epley(s.w, s.r) : 0;
function bestBefore(id, exceptWorkout) {
  let best = 0;
  for (const w of S.workouts) { if (w === exceptWorkout) continue; for (const e of w.ex) if (e.id === id) for (const s of e.sets) if (s.done) best = Math.max(best, e1rm(s)); }
  return best;
}
function lastSets(id) {
  for (let i = S.workouts.length - 1; i >= 0; i--) { const e = S.workouts[i].ex.find(x => x.id === id); if (e) { const d = e.sets.filter(s => s.done); if (d.length) return d; } }
  return [];
}
const wVolume = w => w.ex.reduce((a, e) => a + e.sets.reduce((b, s) => b + (s.done ? (s.w || 0) * (s.r || 0) : 0), 0), 0);
const wSets = w => w.ex.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);
const daysAgo = n => Date.now() - n * 864e5;

/* ---------- UI helpers ---------- */
function modal(html) { $('#sheet').innerHTML = html; $('#modal').hidden = false; $('#sheet').scrollTop = 0; }
function closeModal() { $('#modal').hidden = true; $('#sheet').innerHTML = ''; }
function toast(t) { const el = $('#timer'); el.hidden = false; el.textContent = t; clearTimeout(toast.t); toast.t = setTimeout(() => { if (!rest.end) el.hidden = true; }, 2200); }
const field = (id, label, val = '', type = 'number', extra = '') => `<div class="f"><label for="${id}">${label}</label><input id="${id}" type="${type}" ${type === 'number' ? 'inputmode="decimal" step="any"' : ''} value="${esc(val)}" ${extra}></div>`;
const select = (id, label, opts, val) => `<div class="f"><label for="${id}">${label}</label><select id="${id}">${opts.map(([v, t]) => `<option value="${v}" ${String(v) === String(val) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div>`;
const num = id => { const v = $('#' + id)?.value; return v === '' || v == null ? null : +v; };

function lineChart(canvas, pts, unit) {
  const dpr = devicePixelRatio || 1, w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const g = canvas.getContext('2d'); g.scale(dpr, dpr); g.clearRect(0, 0, w, h);
  if (pts.length < 1) { g.fillStyle = '#8a9bb0'; g.font = '13px system-ui'; g.fillText('Sin datos todavía', 12, 24); return; }
  const vs = pts.map(p => p.v), min = Math.min(...vs), max = Math.max(...vs), pad = (max - min) * .15 || 1, lo = min - pad, hi = max + pad;
  const X = i => 34 + (pts.length === 1 ? (w - 50) / 2 : i * (w - 50) / (pts.length - 1)), Y = v => 14 + (h - 36) * (1 - (v - lo) / (hi - lo));
  g.strokeStyle = '#263241'; g.fillStyle = '#8a9bb0'; g.font = '10px system-ui'; g.lineWidth = 1;
  for (let i = 0; i < 4; i++) { const v = lo + (hi - lo) * i / 3, y = Y(v); g.beginPath(); g.moveTo(32, y); g.lineTo(w - 6, y); g.stroke(); g.fillText(fmt(v, 1), 0, y + 3); }
  g.strokeStyle = '#ff5a36'; g.lineWidth = 2.5; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(X(i), Y(p.v)) : g.moveTo(X(i), Y(p.v))); g.stroke();
  g.fillStyle = '#ffb020'; pts.forEach((p, i) => { g.beginPath(); g.arc(X(i), Y(p.v), 3.5, 0, 7); g.fill(); });
  g.fillStyle = '#8a9bb0'; g.fillText(fdate(pts[0].d), 34, h - 4); const lt = fdate(pts[pts.length - 1].d); g.fillText(lt, w - 6 - g.measureText(lt).width, h - 4);
}

/* ---------- Temporizador de descanso ---------- */
const rest = { end: 0, iv: null };
function startRest(sec) {
  rest.end = Date.now() + sec * 1000; clearInterval(rest.iv);
  const tick = () => {
    const left = Math.ceil((rest.end - Date.now()) / 1000), el = $('#timer');
    if (left <= 0) { clearInterval(rest.iv); rest.end = 0; el.textContent = '¡Descanso terminado!'; navigator.vibrate?.([200, 100, 200]); setTimeout(() => { if (!rest.end) el.hidden = true; }, 2500); return; }
    el.hidden = false; el.textContent = `⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}  (toca para saltar)`;
  };
  tick(); rest.iv = setInterval(tick, 500);
}
$('#timer').onclick = () => { clearInterval(rest.iv); rest.end = 0; $('#timer').hidden = true; };

/* ---------- Generador de rutinas ---------- */
const SLOTS = {
  squat: ['Barbell Squat', 'Barbell Full Squat', 'Leg Press', 'Dumbbell Squat', 'Bodyweight Squat'],
  squatH: ['Dumbbell Squat', 'Bodyweight Squat', 'Chair Squat'],
  hinge: ['Romanian Deadlift', 'Barbell Deadlift', 'Stiff-Legged Dumbbell Deadlift', 'Good Morning'],
  hingeH: ['Stiff-Legged Dumbbell Deadlift', 'Single Leg Glute Bridge', 'Butt Lift (Bridge)'],
  thrust: ['Barbell Hip Thrust', 'Barbell Glute Bridge', 'Single Leg Glute Bridge'],
  lunge: ['Dumbbell Lunges', 'Barbell Lunge', 'Bodyweight Walking Lunge', 'Dumbbell Rear Lunge'],
  kick: ['Glute Kickback', 'One-Legged Cable Kickback', 'Donkey Calf Raises'],
  abduct: ['Thigh Abductor', 'Band Hip Adductions', /abduct/i],
  legcurl: ['Lying Leg Curls', 'Seated Leg Curl', 'Ball Leg Curl'],
  legext: ['Leg Extensions'],
  calf: ['Standing Calf Raises', 'Seated Calf Raise', 'Calf Raises - With Bands', 'Calf Raise On A Dumbbell'],
  bench: ['Barbell Bench Press - Medium Grip', 'Dumbbell Bench Press', 'Pushups', 'Machine Bench Press'],
  benchH: ['Pushups', 'Dumbbell Bench Press'],
  incline: ['Barbell Incline Bench Press - Medium Grip', 'Incline Dumbbell Press', 'Incline Push-Up'],
  fly: ['Dumbbell Flyes', 'Butterfly', 'Cable Crossover'],
  row: ['Bent Over Barbell Row', 'Bent Over Two-Dumbbell Row', 'One-Arm Dumbbell Row', 'Seated Cable Rows'],
  pulldown: ['Wide-Grip Lat Pulldown', 'Pullups', 'Chin-Up', 'Straight-Arm Pulldown'],
  ohp: ['Barbell Shoulder Press', 'Dumbbell Shoulder Press', 'Arnold Dumbbell Press'],
  lat: ['Side Lateral Raise', 'Cable Seated Lateral Raise'],
  rear: ['Reverse Flyes', 'Bent Over Dumbbell Rear Delt Raise With Head On Bench', 'Cable Rope Rear-Delt Rows'],
  curl: ['Barbell Curl', 'Dumbbell Bicep Curl', 'Hammer Curls', 'Alternate Hammer Curl'],
  tri: ['Triceps Pushdown', 'Triceps Pushdown - Rope Attachment', 'Bench Dips', 'Dumbbell One-Arm Triceps Extension', 'Tricep Dumbbell Kickback'],
  abs: ['Cable Crunch', 'Crunches', 'Plank', 'Hanging Leg Raise', 'Air Bike'],
  abs2: ['Plank', 'Russian Twist', 'Reverse Crunch', 'Crunches'],
  cardio: ['Jumping Rope', 'Rope Jumping', 'Jogging, Treadmill', 'Rowing, Stationary', 'Mountain Climbers']
};
const DAYS = {
  full_m: ['squat', 'bench', 'row', 'hinge', 'ohp', 'curl', 'abs'],
  full_f: ['squat', 'thrust', 'bench', 'row', 'hinge', 'lat', 'abs'],
  push_m: ['bench', 'incline', 'ohp', 'lat', 'tri', 'fly'],
  push_f: ['incline', 'ohp', 'lat', 'bench', 'tri'],
  pull_m: ['row', 'pulldown', 'rear', 'curl', 'abs'],
  pull_f: ['pulldown', 'row', 'rear', 'curl', 'abs2'],
  legs_m: ['squat', 'hinge', 'lunge', 'legcurl', 'legext', 'calf'],
  legs_f: ['thrust', 'squat', 'hinge', 'lunge', 'kick', 'abduct', 'calf'],
  glute_f: ['thrust', 'hinge', 'lunge', 'kick', 'abduct', 'legcurl', 'abs2'],
  upper_m: ['bench', 'row', 'ohp', 'pulldown', 'curl', 'tri'],
  upper_f: ['incline', 'pulldown', 'ohp', 'row', 'lat', 'tri'],
  lower_m: ['squat', 'hinge', 'lunge', 'legcurl', 'calf', 'abs'],
  lower_f: ['squat', 'thrust', 'hinge', 'abduct', 'legcurl', 'calf']
};
const SPLIT = {
  2: ['full', 'full'], 3: ['full', 'full', 'full'], 4: ['upper', 'lower', 'upper', 'lower'],
  5: ['push', 'pull', 'legs', 'upper', 'glute|lower'], 6: ['push', 'pull', 'legs', 'push', 'pull', 'legs']
};
const DNAME = { full: 'Cuerpo completo', push: 'Empuje', pull: 'Tirón', legs: 'Piernas', upper: 'Tren superior', lower: 'Tren inferior', glute: 'Glúteo y pierna' };
function pickEx(slot, home) {
  let list = SLOTS[slot + (home ? 'H' : '')] || SLOTS[slot];
  for (const c of list) { const f = EX.find(e => c instanceof RegExp ? c.test(e.n) : e.n.toLowerCase() === c.toLowerCase()); if (f) { if (home && ['barbell', 'machine', 'cable', 'e-z curl bar'].includes(f.e)) continue; return f; } }
  if (home && SLOTS[slot + 'H']) return pickEx(slot, false);
  return null;
}
function genRoutine(o) {
  const sx = o.sex === 'f' ? 'f' : 'm';
  const P0 = { hyp: [4, '8-12', 3, '10-15'], str: [5, '3-5', 3, '6-10'], fat: [3, '12-15', 3, '15-20'], end: [3, '15-20', 3, '20-25'] }[o.goal];
  const days = SPLIT[o.days].map((t, i) => {
    const [a, b] = t.split('|'); let key = a;
    if (b) key = sx === 'f' ? a : b;
    let tpl = DAYS[`${key}_${sx}`] || DAYS[`${key}_m`];
    if (o.level === 'beginner') tpl = tpl.slice(0, 6);
    const items = []; const used = new Set();
    tpl.forEach((slot, j) => { const e = pickEx(slot, o.home); if (!e || used.has(e.id)) return; used.add(e.id); const main = j < 2; items.push({ id: e.id, sets: main ? P0[0] : P0[2], reps: main ? P0[1] : P0[3] }); });
    if (o.goal === 'fat' || o.goal === 'end') { const c = pickEx('cardio', o.home); if (c) items.push({ id: c.id, sets: 1, reps: '10-15 min' }); }
    return { name: `Día ${i + 1} · ${DNAME[key] || key}`, items };
  });
  const gn = { hyp: 'Hipertrofia', str: 'Fuerza', fat: 'Definición', end: 'Resistencia' }[o.goal];
  return { id: uid(), name: `${gn} ${o.days}d · ${sx === 'f' ? 'Mujer' : 'Hombre'}${o.home ? ' (casa)' : ''}`, days };
}

/* ---------- Entrenamiento activo ---------- */
function startWorkout(name, items) {
  if (S.active && !confirm('Ya tienes un entrenamiento en curso. ¿Reemplazarlo?')) return;
  S.active = { name: name || 'Entrenamiento libre', start: Date.now(), ex: (items || []).map(it => mkEx(it.id, it.sets, it.reps)) };
  save(); location.hash = '#/train'; render();
}
function mkEx(id, nsets = 3, reps = '') {
  const prev = lastSets(id), n = Math.max(nsets, 1);
  return { id, target: reps, sets: Array.from({ length: n }, (_, i) => ({ w: '', r: '', pw: prev[i]?.w ?? prev[prev.length - 1]?.w ?? '', pr: prev[i]?.r ?? prev[prev.length - 1]?.r ?? '', done: false })) };
}
function finishWorkout() {
  const a = S.active; if (!a) return;
  a.ex.forEach(e => e.sets = e.sets.filter(s => s.done));
  a.ex = a.ex.filter(e => e.sets.length);
  if (!a.ex.length) { if (!confirm('No completaste ninguna serie. ¿Descartar entrenamiento?')) return; S.active = null; save(); render(); return; }
  const w = { id: uid(), name: a.name, date: new Date().toISOString(), dur: Math.round((Date.now() - a.start) / 60000), ex: a.ex, note: '' };
  const prs = [];
  w.ex.forEach(e => { const b = bestBefore(e.id), m = Math.max(...e.sets.map(e1rm)); if (m > b && b > 0) prs.push([e.id, m]); });
  const kg = latest('weight') || 70;
  w.kcal = Math.round(Calc.kcal(5, kg, w.dur));
  S.workouts.push(w); S.active = null; save(); clearInterval(rest.iv); rest.end = 0; $('#timer').hidden = true;
  modal(`<h2>🎉 ¡Entrenamiento completo!</h2>
  <div class="grid3"><div class="stat"><b>${w.dur} min</b><span>Duración</span></div><div class="stat"><b>${Math.round(wVolume(w))} kg</b><span>Volumen</span></div><div class="stat"><b>${wSets(w)}</b><span>Series</span></div></div>
  <p class="mut sm">Gasto estimado: ~${w.kcal} kcal</p>
  ${prs.length ? `<h3>🏆 Nuevos récords (1RM est.)</h3>${prs.map(([id, v]) => `<div>${esc(exName(id))}: <b>${fmt(v)} kg</b></div>`).join('')}` : ''}
  <button class="block" style="margin-top:14px" data-act="close">Listo</button>`);
  render();
}

/* ---------- Vistas ---------- */
const views = {};
let exFilter = { q: '', muscle: '', equip: '', cat: '', level: '', mine: false, n: 50 };

views.home = () => {
  const p = P(), wk = S.workouts.filter(w => new Date(w.date) > daysAgo(7));
  const vol = wk.reduce((a, w) => a + wVolume(w), 0);
  const mus = {}; wk.forEach(w => w.ex.forEach(e => { const m = EXMAP[e.id]?.p[0]; if (m) mus[m] = (mus[m] || 0) + e.sets.length; }));
  const mx = Math.max(1, ...Object.values(mus));
  const days = new Set(S.workouts.map(w => w.date.slice(0, 10))); let streak = 0; for (let i = 0; i < 365; i++) { const d = new Date(daysAgo(i)).toISOString().slice(0, 10); if (days.has(d)) streak++; else if (i > 0) break; }
  const bmi = latest('weight') && p.height ? Calc.bmi(latest('weight'), +p.height) : null;
  return `
  ${!p.sex ? `<div class="card" style="border-color:var(--acc)"><h2>👋 Bienvenido a ProFit</h2><p class="mut">Configura tu perfil (sexo, estatura, nacimiento) para personalizar rutinas, calculadoras y recomendaciones.</p><button data-act="profile">Configurar perfil</button></div>` : `<h2 style="margin:4px 2px 12px">Hola${p.name ? ', ' + esc(p.name) : ''} 💪</h2>`}
  <div class="grid3"><div class="stat"><b>${wk.length}</b><span>Entrenos (7d)</span></div><div class="stat"><b>${Math.round(vol / 1000 * 10) / 10} t</b><span>Volumen (7d)</span></div><div class="stat"><b>${streak}</b><span>Racha (días)</span></div></div>
  <div class="card" style="margin-top:12px"><div class="row sp"><h3>Empezar</h3></div>
    <div class="row wrap"><button data-act="newfree">▶ Entrenamiento libre</button><button class="ghost" data-act="gen">⚡ Generar rutina</button></div>
    ${S.active ? `<p class="sm" style="margin-top:10px">Tienes un entrenamiento en curso: <a style="color:var(--acc)" href="#/train">continuar</a></p>` : ''}</div>
  ${bmi ? `<div class="card"><h3>Tu estado</h3><div class="grid3"><div class="stat"><b>${fmt(latest('weight'))}</b><span>kg</span></div><div class="stat"><b>${fmt(bmi)}</b><span>IMC · ${Calc.bmiCat(bmi)}</span></div><div class="stat"><b>${fmt(latest('bf'))}${latest('bf') ? '%' : ''}</b><span>grasa</span></div></div></div>` : ''}
  <h2 class="sec">Series por músculo (7 días)</h2><div class="card">${Object.keys(mus).length ? Object.entries(mus).sort((a, b) => b[1] - a[1]).map(([m, n]) => `<div class="row sp sm"><span style="width:110px">${MUSC[m] || m}</span><div class="bar grow"><div style="width:${n / mx * 100}%"></div></div><b style="width:26px;text-align:right">${n}</b></div>`).join('') : '<p class="mut c">Aún no hay series esta semana.</p>'}</div>
  <h2 class="sec">Últimos entrenamientos</h2>${S.workouts.slice(-5).reverse().map(wCard).join('') || '<p class="mut c">Sin entrenamientos registrados.</p>'}`;
};
const wCard = w => `<div class="card" data-act="wdetail" data-id="${w.id}" style="cursor:pointer"><div class="row sp"><b>${esc(w.name)}</b><span class="mut sm">${fdate(w.date)}</span></div><div class="mut sm">${w.dur} min · ${wSets(w)} series · ${Math.round(wVolume(w))} kg · ${w.ex.length} ejercicios</div></div>`;

views.train = () => {
  const a = S.active;
  if (a) {
    return `<div class="card"><div class="row sp"><input id="wname" value="${esc(a.name)}" style="font-weight:700"><b id="elapsed" class="ok" style="white-space:nowrap">0:00</b></div></div>
    ${a.ex.map((e, ei) => `<div class="card"><div class="row sp"><b data-act="exinfo" data-id="${e.id}" style="cursor:pointer">${esc(exName(e.id))}</b><button class="ghost sm" data-act="rmex" data-i="${ei}">✕</button></div>
      <div class="mut sm">${e.target ? 'Objetivo: ' + esc(e.target) + ' reps · ' : ''}${(EXMAP[e.id]?.p || []).map(m => MUSC[m]).join(', ')}</div>
      <div class="setrow mut sm" style="margin-top:8px"><span class="n">#</span><span class="c">kg</span><span class="c">reps</span><span class="c">1RM est.</span><span></span></div>
      ${e.sets.map((s, si) => `<div class="setrow ${s.done ? 'done' : ''}"><span class="n">${si + 1}</span>
        <input type="number" inputmode="decimal" step="any" data-set="${ei}.${si}.w" value="${s.w}" placeholder="${s.pw || ''}">
        <input type="number" inputmode="numeric" data-set="${ei}.${si}.r" value="${s.r}" placeholder="${s.pr || ''}">
        <span class="c sm mut">${s.done && e1rm(s) ? fmt(e1rm(s)) : ''}</span>
        <button class="${s.done ? '' : 'ghost'} sm" data-act="done" data-i="${ei}.${si}">✓</button></div>`).join('')}
      <div class="row"><button class="ghost sm" data-act="addset" data-i="${ei}">+ Serie</button><button class="ghost sm" data-act="rmset" data-i="${ei}">− Serie</button></div></div>`).join('')}
    <button class="ghost block" data-act="addex">+ Añadir ejercicio</button>
    <div class="row" style="margin-top:12px"><button class="block grow" data-act="finish">✔ Terminar</button><button class="danger" data-act="discard">Descartar</button></div>`;
  }
  const hist = S.workouts.slice().reverse();
  return `<div class="row wrap"><button data-act="newfree">▶ Entreno libre</button><button class="ghost" data-act="gen">⚡ Generar rutina</button></div>
  <h2 class="sec">Mis rutinas</h2>${S.routines.map(r => `<details class="card"><summary>${esc(r.name)}</summary>
    ${r.days.map((d, di) => `<div class="card" style="background:var(--card2)"><div class="row sp"><b>${esc(d.name)}</b><button class="sm" data-act="startroutine" data-r="${r.id}" data-d="${di}">Iniciar</button></div>
      ${d.items.map(it => `<div class="sm mut">${it.sets}×${esc(it.reps)} · ${esc(exName(it.id))}</div>`).join('')}</div>`).join('')}
    <button class="danger sm" data-act="rmroutine" data-r="${r.id}">Eliminar rutina</button></details>`).join('') || '<p class="mut c">Aún no tienes rutinas. Genera una con el botón de arriba.</p>'}
  <h2 class="sec">Historial</h2>${hist.map(wCard).join('') || '<p class="mut c">Sin entrenamientos aún.</p>'}`;
};

views.exercises = () => {
  const f = exFilter, p = P(), foc = FOCUS[p.sex] || [];
  const list = EX.filter(e => (!f.q || e.n.toLowerCase().includes(f.q)) && (!f.muscle || e.p.includes(f.muscle) || e.s.includes(f.muscle)) && (!f.equip || e.e === f.equip) && (!f.cat || e.c === f.cat) && (!f.level || e.l === f.level) && (!f.mine || e.p.some(m => foc.includes(m))));
  const opts = (map, cur) => `<option value="">Todos</option>` + Object.entries(map).map(([k, v]) => `<option value="${k}" ${cur === k ? 'selected' : ''}>${v}</option>`).join('');
  return `<input id="exq" placeholder="Buscar entre ${EX.length} ejercicios…" value="${esc(f.q)}" style="margin-bottom:8px">
  <div class="grid3" style="margin-bottom:8px"><select data-ef="muscle">${opts(MUSC, f.muscle)}</select><select data-ef="equip">${opts(EQUIP, f.equip)}</select><select data-ef="cat">${opts(CAT, f.cat)}</select></div>
  <div class="chips">${p.sex ? `<span class="chip ${f.mine ? 'on' : ''}" data-act="mine">⭐ Enfoque ${p.sex === 'f' ? 'mujer' : 'hombre'}</span>` : ''}${Object.entries(LVL).map(([k, v]) => `<span class="chip ${f.level === k ? 'on' : ''}" data-act="lvl" data-v="${k}">${v}</span>`).join('')}</div>
  <div class="mut sm" style="margin:2px 2px 8px">${list.length} ejercicios</div>
  <div id="exlist">${list.slice(0, f.n).map(exRow).join('')}</div>
  ${list.length > f.n ? `<button class="ghost block" data-act="more">Mostrar más (${list.length - f.n})</button>` : ''}`;
};
const exRow = e => `<div class="ex" data-act="exinfo" data-id="${e.id}"><img loading="lazy" src="${IMG}${e.id}/0.jpg" alt="" onerror="this.style.visibility='hidden'"><div class="grow"><div class="t">${esc(e.n)}</div><span class="tag acc">${MUSC[e.p[0]] || e.p[0] || '—'}</span><span class="tag">${EQUIP[e.e] || e.e}</span><span class="tag">${LVL[e.l]}</span></div></div>`;

views.body = () => {
  const k = views.body.key || 'weight', f = FMAP[k], groups = [...new Set(FIELDS.map(x => x[3]))];
  const p = P(), a = age(), h = +p.height, kg = latest('weight'), nk = latest('neck'), wa = latest('waist'), hi = latest('hip');
  const rows = [];
  if (kg && h) { const b = Calc.bmi(kg, h); rows.push(['IMC', fmt(b), Calc.bmiCat(b)]); rows.push(['Peso ideal (Devine)', fmt(Calc.idealWeight(p.sex || 'm', h)) + ' kg', '']); }
  let bf = latest('bf');
  if (!bf && p.sex && h && nk && wa && (p.sex === 'm' || hi)) { const b = Calc.navyBF(p.sex, h, nk, wa, hi); if (b) { bf = b; rows.push(['% grasa (Marina)', fmt(b) + '%', Calc.bfCat(p.sex, b)]); } }
  else if (bf && p.sex) rows.push(['% grasa', fmt(bf) + '%', Calc.bfCat(p.sex, bf)]);
  if (kg && bf) { const l = Calc.lean(kg, bf); rows.push(['Masa magra', fmt(l) + ' kg', '']); rows.push(['Masa grasa', fmt(Calc.fat(kg, bf)) + ' kg', '']); if (h) rows.push(['FFMI', fmt(Calc.ffmi(l, h)), '']); }
  if (wa && hi && p.sex) { const r = Calc.whr(wa, hi); rows.push(['Cintura/cadera', fmt(r, 2), Calc.whrRisk(p.sex, r)]); }
  if (wa && h) { const r = Calc.whtr(wa, h); rows.push(['Cintura/estatura', fmt(r, 2), Calc.whtrRisk(r)]); }
  if (kg && h && a && p.sex) rows.push(['TMB (Mifflin)', Math.round(Calc.bmr(p.sex, kg, h, a)) + ' kcal', 'Gasto total: ' + Math.round(Calc.bmr(p.sex, kg, h, a) * p.activity) + ' kcal']);
  const bl = latest('bicepL'), br = latest('bicepR'), tl = latest('thighL'), tr = latest('thighR');
  if (bl && br) rows.push(['Simetría bíceps', fmt(Math.abs(bl - br)) + ' cm dif.', '']);
  if (tl && tr) rows.push(['Simetría muslo', fmt(Math.abs(tl - tr)) + ' cm dif.', '']);
  const s = series(k), d = s.length > 1 ? s[s.length - 1].v - s[0].v : null;
  return `<div class="row sp"><h2 style="margin:0;font-size:17px">Mediciones</h2><button data-act="newmeasure">+ Registrar</button></div>
  <div class="chips" style="margin-top:10px">${FIELDS.map(x => `<span class="chip ${x[0] === k ? 'on' : ''}" data-act="mk" data-k="${x[0]}">${x[1]}</span>`).join('')}</div>
  <div class="card"><div class="row sp"><b>${f[1]} <span class="mut sm">${f[2]}</span></b><span class="sm ${d == null ? 'mut' : ''}">${d == null ? '' : (d > 0 ? '+' : '') + fmt(d) + ' desde el inicio'}</span></div><canvas id="chart"></canvas></div>
  <h2 class="sec">Métricas derivadas</h2><div class="card">${rows.length ? `<table>${rows.map(r => `<tr><td>${r[0]}</td><td><b>${r[1]}</b></td><td class="mut sm">${r[2]}</td></tr>`).join('')}</table>` : '<p class="mut c">Registra peso y estatura (en tu perfil) para ver métricas.</p>'}</div>
  <h2 class="sec">Historial</h2>${S.measures.slice().reverse().slice(0, 15).map((m, i) => `<div class="card sm"><div class="row sp"><b>${fdate(m.d)}</b><button class="danger sm" data-act="rmmeasure" data-d="${S.measures.length - 1 - i}">Borrar</button></div><div class="mut">${FIELDS.filter(x => m[x[0]] != null && m[x[0]] !== '').map(x => `${x[1]}: ${m[x[0]]}${x[2] ? ' ' + x[2] : ''}`).join(' · ')}</div></div>`).join('') || '<p class="mut c">Sin registros.</p>'}`;
};
views.body.after = () => { const c = $('#chart'); if (c) lineChart(c, series(views.body.key || 'weight')); };

/* ---------- Calculadoras ---------- */
const sexOpt = [['m', 'Hombre'], ['f', 'Mujer']];
const TOOLS = [
  { id: 'rm', t: '🏆 1RM y tabla de porcentajes', f: () => [['w', 'Peso levantado (kg)', ''], ['r', 'Repeticiones', 5]], run: v => {
      if (!v.w || !v.r) return ''; const ep = Calc.epley(v.w, v.r), br = Calc.brzycki(v.w, v.r), avg = isNaN(br) ? ep : (ep + br) / 2;
      return `1RM estimado: <b>${fmt(avg)} kg</b> <span class="mut sm">(Epley ${fmt(ep)} · Brzycki ${fmt(br)})</span><table style="margin-top:8px">${Calc.pct1RM.map(([p, r]) => `<tr><td>${p}%</td><td><b>${fmt(avg * p / 100, 1)} kg</b></td><td class="mut">~${r} reps</td></tr>`).join('')}</table>`; } },
  { id: 'bmi', t: '⚖️ IMC y peso ideal', f: () => [['kg', 'Peso (kg)', latest('weight') || ''], ['cm', 'Estatura (cm)', P().height], ['sex', 'Sexo', P().sex || 'm', sexOpt]], run: v => {
      if (!v.kg || !v.cm) return ''; const b = Calc.bmi(v.kg, v.cm), id = Calc.idealWeight(v.sex, v.cm), m = Math.pow(v.cm / 100, 2);
      return `IMC <b>${fmt(b)}</b> — ${Calc.bmiCat(b)}<br>Rango saludable (18.5–24.9): <b>${fmt(18.5 * m)} – ${fmt(24.9 * m)} kg</b><br>Peso ideal (Devine): <b>${fmt(id)} kg</b>`; } },
  { id: 'navy', t: '📐 % de grasa (método Marina)', f: () => [['sex', 'Sexo', P().sex || 'm', sexOpt], ['cm', 'Estatura (cm)', P().height], ['neck', 'Cuello (cm)', latest('neck') || ''], ['waist', 'Cintura al ombligo (cm)', latest('waist') || ''], ['hip', 'Cadera (cm, solo mujer)', latest('hip') || ''], ['kg', 'Peso (kg, opcional)', latest('weight') || '']], run: v => {
      const b = Calc.navyBF(v.sex, v.cm, v.neck, v.waist, v.hip); if (!b || isNaN(b)) return 'Revisa las medidas.';
      return `Grasa corporal: <b>${fmt(b)}%</b> — ${Calc.bfCat(v.sex, b)}${v.kg ? `<br>Masa magra: <b>${fmt(Calc.lean(v.kg, b))} kg</b> · Masa grasa: <b>${fmt(Calc.fat(v.kg, b))} kg</b>` : ''}`; } },
  { id: 'cun', t: '🧬 % de grasa estimado (CUN-BAE)', f: () => [['sex', 'Sexo', P().sex || 'm', sexOpt], ['age', 'Edad', age() || ''], ['kg', 'Peso (kg)', latest('weight') || ''], ['cm', 'Estatura (cm)', P().height]], run: v => {
      if (!v.age || !v.kg || !v.cm) return ''; const bf = Calc.cunBAE(v.sex, v.age, Calc.bmi(v.kg, v.cm)); return `Grasa estimada: <b>${fmt(bf)}%</b> — ${Calc.bfCat(v.sex, bf)}<br><span class="mut sm">Sin cinta métrica; menos preciso que Marina.</span>`; } },
  { id: 'tdee', t: '🔥 Calorías y macros (TMB/TDEE)', f: () => [['sex', 'Sexo', P().sex || 'm', sexOpt], ['age', 'Edad', age() || ''], ['kg', 'Peso (kg)', latest('weight') || ''], ['cm', 'Estatura (cm)', P().height], ['act', 'Actividad', P().activity, ACT], ['goal', 'Objetivo', P().goal, Object.entries(GOALS)], ['bf', '% grasa (opcional, usa Katch-McArdle)', latest('bf') || '']], run: v => {
      if (!v.age || !v.kg || !v.cm) return ''; const bmr = v.bf ? Calc.bmrKatch(Calc.lean(v.kg, v.bf)) : Calc.bmr(v.sex, v.kg, v.cm, v.age), t = bmr * v.act, m = Calc.macros(t, v.kg, v.goal);
      return `TMB: <b>${Math.round(bmr)} kcal</b> · Mantenimiento: <b>${Math.round(t)} kcal</b><br>Objetivo (${GOALS[v.goal]}): <b>${Math.round(m.kcal)} kcal/día</b><table style="margin-top:8px"><tr><td>Proteína</td><td><b>${Math.round(m.protein)} g</b></td></tr><tr><td>Grasas</td><td><b>${Math.round(m.fat)} g</b></td></tr><tr><td>Carbohidratos</td><td><b>${Math.round(m.carb)} g</b></td></tr></table>`; } },
  { id: 'hr', t: '❤️ Zonas de frecuencia cardiaca', f: () => [['age', 'Edad', age() || ''], ['rest', 'FC en reposo (lpm)', latest('rhr') || 60]], run: v => {
      if (!v.age || !v.rest) return ''; return `FC máx. (Tanaka): <b>${Math.round(Calc.hrMax(v.age))} lpm</b><table style="margin-top:8px">${Calc.zones(v.age, v.rest).map(z => `<tr><td>${z.n}</td><td><b>${z.lo}–${z.hi}</b></td></tr>`).join('')}</table>`; } },
  { id: 'vo2', t: '🫁 VO₂máx estimado', f: () => [['sex', 'Sexo', P().sex || 'm', sexOpt], ['age', 'Edad', age() || ''], ['dist', 'Distancia en 12 min (m) — test de Cooper', ''], ['rest', 'o FC en reposo (lpm)', latest('rhr') || '']], run: v => {
      if (!v.age) return ''; const x = v.dist ? Calc.vo2Cooper(v.dist) : v.rest ? Calc.vo2Rest(v.age, v.rest) : 0; if (!x) return ''; return `VO₂máx: <b>${fmt(x)} ml/kg/min</b> — ${Calc.vo2Cat(v.sex, v.age, x)}`; } },
  { id: 'water', t: '💧 Hidratación diaria', f: () => [['kg', 'Peso (kg)', latest('weight') || ''], ['act', 'Entrenas hoy', 1, [[1, 'Sí'], [0, 'No']]]], run: v => v.kg ? `Meta: <b>${fmt(Calc.water(v.kg, +v.act), 1)} L</b> de agua al día` : '' },
  { id: 'met', t: '🏃 Calorías de una actividad', f: () => [['kg', 'Peso (kg)', latest('weight') || ''], ['met', 'Actividad', 6, [[3.5, 'Caminar rápido'], [5, 'Pesas (moderado)'], [6, 'Pesas (intenso)'], [7, 'Ciclismo moderado'], [8, 'Trotar'], [10, 'Correr 10 km/h'], [12, 'Correr 12 km/h'], [8, 'Natación'], [10, 'HIIT / CrossFit'], [7, 'Fútbol'], [8, 'Boxeo / artes marciales'], [12, 'Saltar cuerda'], [3, 'Yoga / pilates']]], ['min', 'Minutos', 45]], run: v => v.kg && v.min ? `Gasto estimado: <b>${Math.round(Calc.kcal(+v.met, v.kg, v.min))} kcal</b>` : '' },
  { id: 'pl', t: '🧮 Total de powerlifting y Wilks', f: () => [['sex', 'Sexo', P().sex || 'm', sexOpt], ['bw', 'Peso corporal (kg)', latest('weight') || ''], ['s', 'Sentadilla (kg)', ''], ['b', 'Press banca (kg)', ''], ['d', 'Peso muerto (kg)', '']], run: v => {
      const t = (v.s || 0) + (v.b || 0) + (v.d || 0); if (!t || !v.bw) return ''; return `Total: <b>${fmt(t)} kg</b> · Wilks: <b>${fmt(Calc.wilks(v.sex, v.bw, t))}</b>`; } },
  { id: 'str', t: '💪 Nivel de fuerza relativa', f: () => [['sex', 'Sexo', P().sex || 'm', sexOpt], ['bw', 'Peso corporal (kg)', latest('weight') || ''], ['ex', 'Ejercicio', 'squat', [['squat', 'Sentadilla'], ['bench', 'Press banca'], ['deadlift', 'Peso muerto'], ['ohp', 'Press militar'], ['row', 'Remo con barra']]], ['w', '1RM (kg)', '']], run: v => {
      if (!v.bw || !v.w) return ''; const ref = Calc.strengthRatio[v.ex][v.sex === 'f' ? 1 : 0], r = v.w / v.bw, lv = r < ref * .5 ? 'Principiante' : r < ref * .8 ? 'Novato' : r < ref * 1.2 ? 'Intermedio' : r < ref * 1.6 ? 'Avanzado' : 'Élite'; return `Relación: <b>${fmt(r, 2)}× tu peso</b> — nivel <b>${lv}</b><br><span class="mut sm">Intermedio ≈ ${fmt(ref, 2)}× peso corporal</span>`; } },
  { id: 'pace', t: '⏱ Ritmo de carrera', f: () => [['km', 'Distancia (km)', 5], ['min', 'Tiempo (minutos)', 30]], run: v => { if (!v.km || !v.min) return ''; const p = v.min / v.km, m = Math.floor(p), s = Math.round((p - m) * 60); return `Ritmo: <b>${m}:${String(s).padStart(2, '0')} min/km</b> · Velocidad: <b>${fmt(v.km / v.min * 60)} km/h</b><br>10K: ${fmt(p * 10, 0)} min · Media maratón: ${fmt(p * 21.0975 / 60, 2)} h · Maratón: ${fmt(p * 42.195 / 60, 2)} h`; } },
  { id: 'plates', t: '🏗 Discos de la barra', f: () => [['w', 'Peso objetivo (kg)', 100], ['bar', 'Barra', 20, [[20, 'Olímpica 20 kg'], [15, 'Mujer 15 kg'], [10, 'Corta 10 kg']]]], run: v => {
      let left = (v.w - v.bar) / 2; if (left < 0) return 'Menor que la barra.'; const out = []; for (const p of [25, 20, 15, 10, 5, 2.5, 1.25]) { const n = Math.floor(left / p + 1e-9); if (n) { out.push(`${n}×${p}`); left -= n * p; } } return `Por lado: <b>${out.join(' + ') || '—'}</b> kg${left > 0.01 ? `<br><span class="mut sm">Sobran ${fmt(left * 2, 2)} kg no cargables</span>` : ''}`; } }
];
views.tools = () => `<p class="mut sm" style="margin:0 2px 10px">Se rellenan con tu perfil y última medición. Fórmulas de referencia; no sustituyen a un profesional de la salud.</p>` + TOOLS.map(t => {
  const fs = t.f();
  return `<details class="card" data-tool="${t.id}"><summary>${t.t}</summary>${fs.map(([k, l, d, o]) => o ? select(`t_${t.id}_${k}`, l, o, d) : field(`t_${t.id}_${k}`, l, d ?? '')).join('')}<button class="block" data-act="calc" data-t="${t.id}">Calcular</button><div class="res" id="r_${t.id}" hidden></div></details>`;
}).join('');
function runTool(id) {
  const t = TOOLS.find(x => x.id === id), v = {};
  t.f().forEach(([k, , , o]) => { const el = $(`#t_${id}_${k}`); v[k] = o ? (isNaN(+el.value) || el.value === '' ? el.value : +el.value) : (el.value === '' ? null : +el.value); });
  const r = $('#r_' + id), out = t.run(v); r.hidden = false; r.innerHTML = out || 'Completa los datos.';
}

/* ---------- Modales ---------- */
function profileModal() {
  const p = P();
  modal(`<h2>Perfil</h2>${field('p_name', 'Nombre', p.name, 'text')}${select('p_sex', 'Sexo biológico (para fórmulas y rutinas)', [['', '—'], ['m', 'Hombre'], ['f', 'Mujer']], p.sex)}${field('p_dob', 'Fecha de nacimiento', p.dob, 'date')}${field('p_height', 'Estatura (cm)', p.height)}
  ${select('p_act', 'Nivel de actividad', ACT, p.activity)}${select('p_goal', 'Objetivo', Object.entries(GOALS), p.goal)}${select('p_level', 'Experiencia', Object.entries(LVL), p.level)}${field('p_rest', 'Descanso entre series (seg)', p.rest)}
  <button class="block" data-act="saveprofile">Guardar</button>
  <h3 style="margin-top:18px">Datos</h3><div class="row wrap"><button class="ghost" data-act="export">⬇ Exportar respaldo</button><button class="ghost" data-act="import">⬆ Importar</button><button class="danger" data-act="reset">Borrar todo</button></div>
  <p class="mut sm">Tus datos se guardan solo en este dispositivo. Exporta un respaldo de vez en cuando.</p>`);
}
function exModal(id) {
  const e = EXMAP[id]; if (!e) return;
  const hist = []; S.workouts.forEach(w => w.ex.forEach(x => { if (x.id === id) hist.push({ d: w.date, v: Math.max(...x.sets.map(e1rm)) }); }));
  const pr = Math.max(0, ...hist.map(h => h.v));
  modal(`<div class="row sp"><h2 style="margin:0">${esc(e.n)}</h2><button class="ghost sm" data-act="close">✕</button></div>
  <div class="imgs" style="margin:10px 0">${Array.from({ length: e.k }, (_, i) => `<img src="${IMG}${id}/${i}.jpg" alt="" onerror="this.remove()">`).join('')}</div>
  <div><span class="tag acc">${(e.p.map(m => MUSC[m]).join(', ')) || '—'}</span><span class="tag">${CAT[e.c] || e.c}</span><span class="tag">${EQUIP[e.e] || e.e}</span><span class="tag">${LVL[e.l]}</span>${e.m ? `<span class="tag">${e.m === 'compound' ? 'Compuesto' : 'Aislamiento'}</span>` : ''}</div>
  ${e.s.length ? `<p class="sm mut">Secundarios: ${e.s.map(m => MUSC[m]).join(', ')}</p>` : ''}
  ${pr ? `<div class="res">🏆 Mejor 1RM estimado: <b>${fmt(pr)} kg</b></div>` : ''}
  <h3>Cómo se hace</h3><ol>${e.i.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
  <div class="row"><button class="block grow" data-act="addtoworkout" data-id="${id}">${S.active ? '+ Añadir al entrenamiento' : '▶ Entrenar este ejercicio'}</button></div>`);
}
function pickerModal() {
  modal(`<div class="row sp"><h2 style="margin:0">Añadir ejercicio</h2><button class="ghost sm" data-act="close">✕</button></div><input id="pq" placeholder="Buscar…" style="margin:10px 0"><div id="plist"></div>`);
  const draw = () => { const q = $('#pq').value.toLowerCase(); $('#plist').innerHTML = EX.filter(e => !q || e.n.toLowerCase().includes(q) || e.p.some(m => (MUSC[m] || '').toLowerCase().includes(q))).slice(0, 40).map(e => `<div class="ex" data-act="pick" data-id="${e.id}"><div class="grow"><div class="t">${esc(e.n)}</div><span class="tag acc">${MUSC[e.p[0]] || ''}</span><span class="tag">${EQUIP[e.e] || e.e}</span></div></div>`).join(''); };
  $('#pq').oninput = draw; draw();
}
function genModal() {
  const p = P();
  modal(`<div class="row sp"><h2 style="margin:0">⚡ Generar rutina</h2><button class="ghost sm" data-act="close">✕</button></div>
  <p class="mut sm">Se adapta a tu sexo: mujeres con énfasis en glúteo/pierna y tren superior tonificado; hombres con énfasis en pecho, espalda, hombros y brazos. Puedes cambiar cualquier ejercicio después.</p>
  ${select('g_sex', 'Sexo', [['m', 'Hombre'], ['f', 'Mujer']], p.sex || 'm')}${select('g_goal', 'Objetivo', [['hyp', 'Hipertrofia (masa muscular)'], ['str', 'Fuerza'], ['fat', 'Definición / pérdida de grasa'], ['end', 'Resistencia muscular']], 'hyp')}
  ${select('g_days', 'Días por semana', [2, 3, 4, 5, 6].map(n => [n, n + ' días']), 3)}${select('g_level', 'Experiencia', Object.entries(LVL), p.level)}${select('g_home', 'Dónde entrenas', [[0, 'Gimnasio'], [1, 'Casa (mancuernas / peso corporal)']], 0)}
  <button class="block" data-act="dogen">Generar</button>`);
}

/* ---------- Eventos ---------- */
const A = {
  close: closeModal, profile: profileModal, gen: genModal,
  newfree: () => startWorkout('Entrenamiento libre', []),
  saveprofile() { Object.assign(S.profile, { name: $('#p_name').value.trim(), sex: $('#p_sex').value, dob: $('#p_dob').value, height: $('#p_height').value, activity: +$('#p_act').value, goal: $('#p_goal').value, level: $('#p_level').value, rest: +$('#p_rest').value || 90 }); save(); closeModal(); render(); },
  export() { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' })); a.download = `profit-respaldo-${today()}.json`; a.click(); },
  import() { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json'; i.onchange = async () => { try { const d = JSON.parse(await i.files[0].text()); if (!d.profile) throw 0; S = Object.assign(S, d); save(); closeModal(); render(); toast('Respaldo importado'); } catch (e) { alert('Archivo no válido'); } }; i.click(); },
  reset() { if (confirm('¿Borrar TODOS tus datos? No se puede deshacer.')) { localStorage.removeItem(KEY); location.reload(); } },
  dogen() {
    const o = { sex: $('#g_sex').value, goal: $('#g_goal').value, days: +$('#g_days').value, level: $('#g_level').value, home: $('#g_home').value === '1' };
    const r = genRoutine(o); S.routines.unshift(r); save(); closeModal(); location.hash = '#/train'; render(); toast('Rutina creada');
  },
  startroutine(el) { const r = S.routines.find(x => x.id === el.dataset.r), d = r.days[+el.dataset.d]; startWorkout(`${r.name} — ${d.name}`, d.items); },
  rmroutine(el) { if (confirm('¿Eliminar rutina?')) { S.routines = S.routines.filter(r => r.id !== el.dataset.r); save(); render(); } },
  exinfo(el) { exModal(el.dataset.id); },
  addtoworkout(el) { if (!S.active) S.active = { name: 'Entrenamiento libre', start: Date.now(), ex: [] }; S.active.ex.push(mkEx(el.dataset.id)); save(); closeModal(); location.hash = '#/train'; render(); },
  addex: pickerModal,
  pick(el) { S.active.ex.push(mkEx(el.dataset.id)); save(); closeModal(); render(); },
  rmex(el) { S.active.ex.splice(+el.dataset.i, 1); save(); render(); },
  addset(el) { const e = S.active.ex[+el.dataset.i], l = e.sets[e.sets.length - 1] || {}; e.sets.push({ w: '', r: '', pw: l.w || l.pw || '', pr: l.r || l.pr || '', done: false }); save(); render(); },
  rmset(el) { const e = S.active.ex[+el.dataset.i]; if (e.sets.length > 1) e.sets.pop(); save(); render(); },
  done(el) {
    const [ei, si] = el.dataset.i.split('.').map(Number), s = S.active.ex[ei].sets[si];
    if (!s.done) { if (s.w === '' ) s.w = s.pw; if (s.r === '') s.r = s.pr; if (s.r === '' || s.r == null) { toast('Ingresa las repeticiones'); return; } s.w = +s.w || 0; s.r = +s.r; s.done = true; startRest(P().rest || 90);
      const id = S.active.ex[ei].id, b = bestBefore(id); if (b > 0 && e1rm(s) > b) toast('🏆 ¡Nuevo récord!'); } else s.done = false;
    save(); render();
  },
  finish: finishWorkout,
  discard() { if (confirm('¿Descartar este entrenamiento?')) { S.active = null; save(); render(); } },
  wdetail(el) {
    const w = S.workouts.find(x => x.id === el.dataset.id);
    modal(`<div class="row sp"><h2 style="margin:0">${esc(w.name)}</h2><button class="ghost sm" data-act="close">✕</button></div><p class="mut sm">${new Date(w.date).toLocaleString('es')} · ${w.dur} min · ${Math.round(wVolume(w))} kg · ~${w.kcal || 0} kcal</p>
    ${w.ex.map(e => `<div class="card"><b>${esc(exName(e.id))}</b>${e.sets.map((s, i) => `<div class="sm">Serie ${i + 1}: <b>${s.w} kg × ${s.r}</b> <span class="mut">(1RM ≈ ${fmt(e1rm(s))})</span></div>`).join('')}</div>`).join('')}
    <button class="danger" data-act="rmworkout" data-id="${w.id}">Eliminar</button>`);
  },
  rmworkout(el) { if (confirm('¿Eliminar entrenamiento?')) { S.workouts = S.workouts.filter(w => w.id !== el.dataset.id); save(); closeModal(); render(); } },
  more() { exFilter.n += 50; render(); },
  mine() { exFilter.mine = !exFilter.mine; exFilter.n = 50; render(); },
  lvl(el) { exFilter.level = exFilter.level === el.dataset.v ? '' : el.dataset.v; exFilter.n = 50; render(); },
  mk(el) { views.body.key = el.dataset.k; render(); },
  calc(el) { runTool(el.dataset.t); },
  newmeasure() {
    const last = S.measures[S.measures.length - 1] || {}, groups = [...new Set(FIELDS.map(x => x[3]))];
    modal(`<div class="row sp"><h2 style="margin:0">Nueva medición</h2><button class="ghost sm" data-act="close">✕</button></div><p class="mut sm">Llena solo lo que midas hoy.</p>${field('m_d', 'Fecha', today(), 'date')}
    ${groups.map((g, gi) => `<details ${gi < 2 ? 'open' : ''}><summary>${g}</summary><div class="grid">${FIELDS.filter(x => x[3] === g).map(x => field('m_' + x[0], `${x[1]}${x[2] ? ' (' + x[2] + ')' : ''}`, '', 'number', `placeholder="${last[x[0]] ?? ''}"`)).join('')}</div></details>`).join('')}
    <button class="block" data-act="savemeasure">Guardar</button>`);
  },
  savemeasure() {
    const m = { d: $('#m_d').value || today() }; let any = false;
    FIELDS.forEach(x => { const v = num('m_' + x[0]); if (v != null) { m[x[0]] = v; any = true; } });
    if (!any) { alert('Ingresa al menos un valor'); return; }
    S.measures.push(m); S.measures.sort((a, b) => a.d.localeCompare(b.d)); save(); closeModal(); render();
  },
  rmmeasure(el) { if (confirm('¿Borrar este registro?')) { S.measures.splice(+el.dataset.d, 1); save(); render(); } }
};
document.addEventListener('click', e => {
  if (e.target.id === 'modal') return closeModal();
  const el = e.target.closest('[data-act]'); if (!el) return;
  if (el.tagName === 'SUMMARY') return;
  A[el.dataset.act]?.(el);
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.set) { const [ei, si, k] = t.dataset.set.split('.'); S.active.ex[+ei].sets[+si][k] = t.value; save(); }
  else if (t.id === 'wname') { S.active.name = t.value; save(); }
  else if (t.id === 'exq') { exFilter.q = t.value.toLowerCase(); exFilter.n = 50; const pos = t.selectionStart; render(); const n = $('#exq'); n.focus(); n.setSelectionRange(pos, pos); }
});
document.addEventListener('change', e => { const t = e.target; if (t.dataset.ef) { exFilter[t.dataset.ef] = t.value; exFilter.n = 50; render(); } });
$('#topactions').innerHTML = `<button class="ghost sm" data-act="profile">👤 Perfil</button>`;

/* ---------- Router ---------- */
const TITLES = { home: 'ProFit', train: 'Entrenar', exercises: 'Ejercicios', body: 'Medidas', tools: 'Calculadoras' };
function render() {
  const r = (location.hash.slice(2) || 'home'), v = views[r] ? r : 'home';
  const open = [...document.querySelectorAll('details[open]')].map(d => d.dataset.tool || d.firstElementChild?.textContent);
  $('#view').innerHTML = EX.length ? views[v]() : '<p class="c mut">Cargando ejercicios…</p>';
  document.querySelectorAll('details').forEach(d => { if (open.includes(d.dataset.tool || d.firstElementChild?.textContent)) d.open = true; });
  $('#title').textContent = TITLES[v];
  document.querySelectorAll('#tabs a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#/' + v));
  views[v].after?.();
}
addEventListener('hashchange', () => { window.scrollTo(0, 0); render(); });
addEventListener('resize', () => views.body.after?.());
setInterval(() => { const el = $('#elapsed'); if (el && S.active) { const s = Math.floor((Date.now() - S.active.start) / 1000); el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; } }, 1000);

fetch('data/exercises.json').then(r => r.json()).then(d => { EX = d; EXMAP = Object.fromEntries(d.map(e => [e.id, e])); render(); }).catch(() => { $('#view').innerHTML = '<p class="c bad">No se pudo cargar la base de ejercicios.</p>'; });
render();
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
