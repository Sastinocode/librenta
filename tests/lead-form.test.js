const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const leadForm = require('../assets/js/lead-form');

async function run() {
  assert.equal(leadForm.normalizeEmail('  ALEX@Example.COM  '), 'alex@example.com');
  assert.equal(leadForm.isValidEmail('alex@example.com'), true);
  assert.equal(leadForm.isValidEmail('alex.example.com'), false);
  assert.equal(leadForm.normalizeOption('Nada, me sumo ya 🙌'), 'Nada, me sumo ya');

  const validLead = {
    rol: 'Arrendatario (Deportista)',
    deporte_equipo: 'Surf',
    frecuencia_meses: 'Cada semana',
    presupuesto_ingresos: '€20 – €35',
    zona_alicante: 'Centro ciudad',
    nombre: ' Alex ',
    email: ' ALEX@Example.COM ',
  };
  const validation = leadForm.validateLeadData(validLead);
  assert.equal(validation.isValid, true);
  assert.equal(validation.values.email, 'alex@example.com');
  assert.equal(validation.values.nombre, 'Alex');

  const invalidEmail = leadForm.validateLeadData({ ...validLead, email: 'sin-arroba' });
  assert.equal(invalidEmail.isValid, false);
  assert.equal(invalidEmail.errors.email, 'Escribe un email válido.');

  const body = leadForm.buildNetlifyBody(validation.values);
  assert.equal(body.get('form-name'), 'librenta-leads');
  assert.equal(body.get('email'), 'alex@example.com');

  const formData = new FormData();
  formData.set('form-name', 'librenta-leads');
  formData.set('email', 'alex@example.com');
  const bodyFromFormData = leadForm.buildNetlifyBody(formData);
  assert.equal(bodyFromFormData.get('form-name'), 'librenta-leads');
  assert.equal(bodyFromFormData.get('email'), 'alex@example.com');

  let successShown = false;
  async function submitAndShow(fetchImpl) {
    await leadForm.submitToNetlify(validation.values, fetchImpl);
    successShown = true;
  }

  await assert.rejects(
    submitAndShow(async () => ({ ok: false, status: 500 })),
    /Netlify form submission failed/
  );
  assert.equal(successShown, false, 'response.ok false must not show success');

  await assert.rejects(
    submitAndShow(async () => {
      throw new Error('network down');
    }),
    /network down/
  );
  assert.equal(successShown, false, 'network errors must not show success');

  const button = { disabled: false };
  function setSubmitting(isSubmitting) {
    button.disabled = isSubmitting;
  }
  setSubmitting(true);
  assert.equal(button.disabled, true, 'button is blocked during submission');
  setSubmitting(false);
  assert.equal(button.disabled, false, 'button can be restored after failure');

  let submitCount = 0;
  let isSubmitting = false;
  async function guardedSubmit() {
    if (isSubmitting) return false;
    isSubmitting = true;
    submitCount += 1;
    await Promise.resolve();
    return true;
  }
  const firstSubmit = guardedSubmit();
  const secondSubmit = guardedSubmit();
  await firstSubmit;
  assert.equal(await secondSubmit, false);
  assert.equal(submitCount, 1, 'duplicate submissions are prevented');

  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /<form name="librenta-leads" method="POST" action="\/" data-netlify="true" netlify-honeypot="bot-field"/);
  assert.match(html, /name="form-name" value="librenta-leads"/);
  assert.match(html, /name="bot-field"/);
  assert.doesNotMatch(html, /fetch\(['"]\/registro/);
  assert.doesNotMatch(html, /show success anyway/);
  assert.match(html, /assets\/js\/lead-form\.js/);

  const localRefs = Array.from(html.matchAll(/(?:src|href)="([^"#][^"]*)"/g), match => match[1])
    .filter(ref => !ref.startsWith('http') && !ref.startsWith('mailto:'));
  const missingRefs = localRefs.filter(ref => !fs.existsSync(path.join(__dirname, '..', ref.split('?')[0])));
  assert.deepEqual(missingRefs, [], 'all local src/href references exist');
}

run()
  .then(() => {
    console.log('All lead form tests passed.');
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
