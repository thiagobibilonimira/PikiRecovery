/* PikiRecovery · interacciones */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const RING = 515.2; // 2·π·82

function countTo(el, to, ms = 800) {
  const from = parseInt(el.textContent) || 0, t0 = performance.now();
  const step = t => {
    const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(from + (to - from) * e) + '%';
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Navegación ---------- */
const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', open);
  links.classList.toggle('open', open);
});
$$('a', links).forEach(a => a.addEventListener('click', () => {
  if (links.classList.contains('open')) burger.click();
}));

// La píldora se esconde al bajar y vuelve al subir
let lastY = scrollY;
addEventListener('scroll', () => {
  const y = scrollY;
  const menuOpen = links.classList.contains('open');
  nav.classList.toggle('hide', !menuOpen && y > lastY && y > 400);
  lastY = y;
}, { passive: true });

const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    $$('a', links).forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => spy.observe(s));

/* ---------- Revelado al scrollear ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => io.observe(el));

/* ---------- Hero: palabra que rota ---------- */
const words = ['Recuperá', 'Descansá', 'Hidratá', 'Respirá', 'Jugá'];
const heroWord = $('#heroWord');
let wi = 0;
if (!reduced) setInterval(() => {
  heroWord.classList.add('out');
  setTimeout(() => {
    wi = (wi + 1) % words.length;
    heroWord.textContent = words[wi];
    heroWord.classList.remove('out');
  }, 450);
}, 2600);

/* ---------- Pilares ---------- */
$$('.pillar').forEach(p => p.addEventListener('click', () => p.classList.toggle('open')));

/* ---------- Cuenta regresiva ---------- */
const EVENT_DATE = new Date('2027-02-27T10:00:00-03:00');
const cd = Object.fromEntries($$('[data-cd]').map(el => [el.dataset.cd, el]));
function tick() {
  let diff = Math.max(0, EVENT_DATE - Date.now()) / 1000;
  const d = Math.floor(diff / 86400); diff -= d * 86400;
  const h = Math.floor(diff / 3600); diff -= h * 3600;
  const m = Math.floor(diff / 60), s = Math.floor(diff - m * 60);
  cd.d.textContent = d;
  cd.h.textContent = String(h).padStart(2, '0');
  cd.m.textContent = String(m).padStart(2, '0');
  cd.s.textContent = String(s).padStart(2, '0');
}
tick(); setInterval(tick, 1000);

/* ---------- Compra de entradas ---------- */
const PRICE = 15000, MAX_QTY = 10;
let qty = 1;
const qtyOut = $('#qty'), qtyTotal = $('#qtyTotal'), buyBtn = $('#buyBtn');
function updateQty() {
  qtyOut.textContent = qty;
  qtyTotal.textContent = '$' + (qty * PRICE).toLocaleString('es-AR');
  $('#qtyMinus').disabled = qty <= 1;
  $('#qtyPlus').disabled = qty >= MAX_QTY;
  buyBtn.textContent = '';
  buyBtn.insertAdjacentHTML('beforeend', `<svg class="btn-ico" aria-hidden="true"><use href="#i-ticket"/></svg>Comprar ${qty > 1 ? qty + ' entradas' : 'entrada'}`);
  // Lleva a la página de compra con la cantidad elegida
  buyBtn.href = `compra.html?cant=${qty}`;
}
$('#qtyMinus').addEventListener('click', () => { if (qty > 1) { qty--; updateQty(); } });
$('#qtyPlus').addEventListener('click', () => { if (qty < MAX_QTY) { qty++; updateQty(); } });
updateQty();

/* ---------- Funcionalidades de la app ---------- */
const screen = $('#appScreen');
screen.alt = $('.feature.active').dataset.alt;
$$('.feature').forEach(f => f.addEventListener('click', () => {
  if (f.classList.contains('active')) return;
  $$('.feature').forEach(x => { x.classList.toggle('active', x === f); x.setAttribute('aria-selected', x === f); });
  screen.classList.add('out');
  setTimeout(() => {
    screen.onload = () => screen.classList.remove('out');
    screen.src = 'img/' + f.dataset.img;
    screen.alt = f.dataset.alt;
  }, 300);
}));

/* ---------- Check-in de demostración ---------- */
const ids = ['sueno', 'animo', 'energia', 'dolor'];
const demoRing = $('#demoRing'), demoPct = $('#demoPct');
function demo() {
  const v = Object.fromEntries(ids.map(id => [id, +$('#' + id).value]));
  ids.forEach(id => {
    const el = $('#' + id);
    el.style.setProperty('--fill', ((el.value - 1) / 4 * 100) + '%');
    $(`output[data-for="${id}"]`).textContent = el.value;
  });
  const score = ((v.sueno + v.animo + v.energia + (6 - v.dolor)) - 4) / 16;
  const pct = Math.round(15 + score * 85);
  demoRing.style.strokeDashoffset = RING * (1 - pct / 100);
  demoRing.style.stroke = pct < 40 ? '#F8F6F0' : pct < 70 ? '#4FA000' : '#C7D900';
  countTo(demoPct, pct);
  let r;
  if (v.dolor >= 4) r = ['Marcá la zona en el mapa corporal', 'Si el dolor persiste, consultá a un profesional'];
  else if (v.sueno <= 2) r = ['Priorizá el descanso hoy', 'Audio de relajación · 10 min antes de dormir'];
  else if (v.animo <= 2) r = ['Respiración guiada', '5 min · Vuelta a la calma'];
  else if (v.energia <= 2) r = ['Recuperación activa suave', '15 min · Movilidad y elongación'];
  else r = ['Estiramiento de piernas', '15 min · Recuperación activa'];
  $('#demoRecoTitle').textContent = r[0];
  $('#demoRecoText').textContent = r[1];
}
ids.forEach(id => $('#' + id).addEventListener('input', demo));
new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { demo(); o.disconnect(); } }, { threshold: .3 }).observe($('#checkin'));

/* ---------- Respiración ---------- */
const ball = $('#breathBall'), word = $('#breathWord'), bpm = $('#bpm'), bBtn = $('#breathBtn'), cyc = $('#breathCycles');
let breathing = false, timers = [];
function stopBreath(done) {
  timers.forEach(clearTimeout); timers = [];
  breathing = false; ball.classList.remove('grow');
  bBtn.textContent = done ? 'Repetir' : 'Empezar';
  word.textContent = done ? '¡Bien hecho!' : 'Preparate';
  if (!done) { bpm.textContent = 104; cyc.textContent = 'Ciclo 0 de 4'; }
}
bBtn.addEventListener('click', () => {
  if (breathing) return stopBreath(false);
  breathing = true; bBtn.textContent = 'Detener';
  let rate = 104;
  for (let c = 0; c < 4; c++) {
    const t = c * 8000;
    timers.push(setTimeout(() => { ball.classList.add('grow'); word.textContent = 'Inhalá'; cyc.textContent = `Ciclo ${c + 1} de 4`; }, t));
    timers.push(setTimeout(() => { ball.classList.remove('grow'); word.textContent = 'Exhalá'; rate -= 8; bpm.textContent = rate; }, t + 4000));
  }
  timers.push(setTimeout(() => stopBreath(true), 32000));
});

/* ---------- Artículos ---------- */
const ARTICLES = [
  { cat: 'descanso', tag: 'Descanso', icon: 'i-zzz', bg: 'var(--celeste)', t: 'Dormir también es entrenar',
    s: 'Por qué el sueño es la herramienta de recuperación más potente.',
    b: ['Mientras dormís, el cuerpo repara tejidos, consolida lo aprendido y regula las hormonas que intervienen en la recuperación. En la adolescencia se recomienda dormir entre 8 y 10 horas.',
        'Algunas claves:', ['Mantené horarios regulares, incluso el fin de semana.', 'Dejá las pantallas un rato antes de acostarte.', 'Evitá comidas pesadas justo antes de dormir.', 'Si entrenás de noche, sumá una rutina de vuelta a la calma.']] },
  { cat: 'fisica', tag: 'Recuperación física', icon: 'i-snow', bg: 'var(--lima)', t: 'Frío, calor o masaje: ¿qué uso?',
    s: 'Cada herramienta tiene su momento.',
    b: ['El frío suele usarse ante golpes recientes o zonas inflamadas; el calor ayuda a relajar músculos tensos o rígidos; los masajes y la pelota de masaje sirven para liberar tensión.',
        'Ante un dolor fuerte, que no mejora o que aparece después de una lesión, consultá siempre con un profesional de la salud.'] },
  { cat: 'mental', tag: 'Recuperación mental', icon: 'i-brain', bg: 'var(--verde)', t: 'La cabeza también se cansa',
    s: 'Presión, exámenes y competencia: cómo bajar un cambio.',
    b: ['La recuperación no es solo física. El estrés por rendir, combinado con el estudio y otras obligaciones, también suma carga.',
        'Ideas para cuidarte:', ['Registrá cómo te sentís en tu check-in diario.', 'Probá respiraciones lentas antes de dormir o de competir.', 'Hablá con tu entrenador, tu familia o un profesional si algo te preocupa.']] },
  { cat: 'entrenamiento', tag: 'Entrenamiento', icon: 'i-heart', bg: 'var(--celeste)', t: 'Señales de sobreentrenamiento',
    s: 'Cuando entrenar más deja de sumar.',
    b: ['El cansancio que no se va, el rendimiento que baja, el mal humor, las molestias que se repiten o dormir mal pueden ser señales de que la carga supera tu capacidad de recuperarte.',
        'Escuchar al cuerpo a tiempo y planificar los días de descanso es parte del entrenamiento, no una pérdida de tiempo.'] },
  { cat: 'habitos', tag: 'Hábitos saludables', icon: 'i-drop', bg: 'var(--lima)', t: 'Hidratación antes, durante y después',
    s: 'Un hábito simple que se suele olvidar.',
    b: ['Llegar hidratado al entrenamiento, tomar líquido durante el esfuerzo y reponer después ayuda a rendir mejor y recuperarte más rápido.',
        'El agua es la base; en esfuerzos largos o con mucho calor, las bebidas isotónicas pueden ayudar a reponer sales.'] },
  { cat: 'fisica', tag: 'Recuperación física', icon: 'i-stretch', bg: 'var(--verde)', t: 'Vuelta a la calma en 10 minutos',
    s: 'Una rutina corta para cerrar cada entrenamiento.',
    b: ['Después del esfuerzo, bajar de a poco ayuda a que el cuerpo pase a un estado de descanso.',
        'Probá esta secuencia:', ['3 minutos de trote o caminata suave.', '5 minutos de elongación de piernas, cadera y espalda.', '2 minutos de respiración lenta: inhalá en 4, exhalá en 4.']] },
];
// Fotos de Unsplash (licencia libre), en el mismo orden que ARTICLES
const ART_IMGS = [
  ['art-sueno.jpg', 'Joven durmiendo en su cama'],
  ['art-frio.jpg', 'Balde con agua y hielo'],
  ['art-mental.jpg', 'Deportista meditando sentada en el pasto'],
  ['art-sobreentreno.jpg', 'Atletas cansados descansando en la pista después de entrenar'],
  ['art-hidratacion.jpg', 'Atleta tomando agua de una botella en la pista'],
  ['art-calma.jpg', 'Deportista elongando la pierna después de entrenar'],
];
ARTICLES.forEach((a, i) => { [a.img, a.alt] = ART_IMGS[i]; });

const grid = $('#articles');
grid.innerHTML = ARTICLES.map((a, i) => `
  <button class="article reveal" data-cat="${a.cat}" data-i="${i}" style="--d:${(i % 3) * .08}s">
    <span class="art-top"><img src="img/${a.img}" alt="${a.alt}" loading="lazy" width="900" height="600"><span class="art-ico" style="background:${a.bg}"><svg><use href="#${a.icon}"/></svg></span></span>
    <span class="art-body"><span class="mono">${a.tag}</span><span class="art-t">${a.t}</span><span class="p3">${a.s}</span></span>
    <span class="art-more">Leer más →</span>
  </button>`).join('');
$$('.article', grid).forEach(el => io.observe(el));

$$('.filter').forEach(f => f.addEventListener('click', () => {
  $$('.filter').forEach(x => { x.classList.toggle('active', x === f); x.setAttribute('aria-pressed', x === f); });
  const k = f.dataset.filter;
  $$('.article').forEach(a => {
    const show = k === 'todos' || a.dataset.cat === k;
    a.classList.toggle('hide', !show);
    a.classList.remove('pop');
    if (show) { void a.offsetWidth; a.classList.add('pop', 'in'); }
  });
}));

const modal = $('#modal');
grid.addEventListener('click', e => {
  const card = e.target.closest('.article'); if (!card) return;
  const a = ARTICLES[card.dataset.i];
  $('#modalImg').src = 'img/' + a.img;
  $('#modalImg').alt = a.alt;
  $('#modalTag').textContent = a.tag;
  $('#modalTitle').textContent = a.t;
  $('#modalBody').innerHTML = a.b.map(x => Array.isArray(x) ? `<ul>${x.map(li => `<li>${li}</li>`).join('')}</ul>` : `<p>${x}</p>`).join('');
  modal.showModal();
});
$('#modalClose').addEventListener('click', () => modal.close());
modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

/* ---------- FAQ: una abierta a la vez ---------- */
$$('#faqList details').forEach(d => d.addEventListener('toggle', () => {
  if (d.open) $$('#faqList details').forEach(o => { if (o !== d) o.open = false; });
}));

/* ---------- Contacto ---------- */
const MAIL = 'pikirecovery@gmail.com';
$('#copyMail').addEventListener('click', async () => {
  const msg = $('#copyMsg');
  try { await navigator.clipboard.writeText(MAIL); msg.textContent = '¡Copiado! ✓'; }
  catch { location.href = 'mailto:' + MAIL; }
  setTimeout(() => (msg.textContent = 'Copiar'), 2000);
});
$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const subject = `${f.get('motivo')} · ${f.get('nombre')}`;
  location.href = `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(f.get('mensaje'))}`;
});
