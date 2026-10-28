/* PikiRecovery · compra de entradas */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const PRICE = 15000, FEE = 1500, MAX_QTY = 10;
const money = n => '$' + n.toLocaleString('es-AR');

// Cantidad que viene desde el botón de la página principal (compra.html?cant=3)
let qty = Math.min(MAX_QTY, Math.max(1, parseInt(new URLSearchParams(location.search).get('cant')) || 1));

function render() {
  $('#qty').textContent = qty;
  $('#qtyMinus').disabled = qty <= 1;
  $('#qtyPlus').disabled = qty >= MAX_QTY;
  $('#lineQty').textContent = `${qty} × Entrada general`;
  $('#lineSub').textContent = money(qty * PRICE);
  $('#lineFee').textContent = money(qty * FEE);
  $('#lineTotal').textContent = money(qty * (PRICE + FEE));
}
$('#qtyMinus').addEventListener('click', () => { if (qty > 1) { qty--; render(); } });
$('#qtyPlus').addEventListener('click', () => { if (qty < MAX_QTY) { qty++; render(); } });
render();

/* ---------- Validación ---------- */
const form = $('#buyForm');
function check(input) {
  const ok = input.checkValidity();
  input.closest('label').classList.toggle('invalid', !ok);
  return ok;
}
$$('input[required]', form).forEach(i => {
  i.addEventListener('blur', () => check(i));
  i.addEventListener('input', () => { if (i.closest('label').classList.contains('invalid')) check(i); });
});
$('#dni').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, ''); });

/* ---------- Confirmación y descarga ---------- */
form.addEventListener('submit', e => {
  e.preventDefault();
  const fields = $$('input[required]', form);
  const bad = fields.filter(i => !check(i));
  if (bad.length) { bad[0].focus(); return; }

  const nombre = $('#nombre').value.trim(), apellido = $('#apellido').value.trim();
  const order = 'PR-' + String(Math.floor(100000 + Math.random() * 900000));
  const slug = apellido.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');

  $('#doneOrder').textContent = `N.º de orden #${order}`;
  $('#doneMsg').textContent = `Gracias, ${nombre}. Tu entrada se está descargando: presentala en la acreditación desde el celular o impresa.`;
  $('#doneLines').innerHTML = [
    ['Titular', `${nombre} ${apellido}`],
    ['DNI', $('#dni').value],
    ['Email', $('#email').value.trim()],
    [`${qty} × Entrada general`, money(qty * PRICE)],
    ['Cargo por servicio', money(qty * FEE)],
  ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v.replace(/</g, '&lt;')}</dd></div>`).join('')
    + `<div class="total"><dt>Total</dt><dd>${money(qty * (PRICE + FEE))}</dd></div>`;

  const link = $('#pdfLink');
  link.download = `entrada-pikirecovery-${slug || 'titular'}.pdf`;

  $('#stepForm').hidden = true;
  $('#stepDone').hidden = false;
  scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => link.click(), 700);
});
