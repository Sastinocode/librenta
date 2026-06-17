(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LibrentaLeadForm = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const FORM_NAME = 'librenta-leads';
  const MAX_TEXT_LENGTH = 120;
  const MAX_NAME_LENGTH = 80;
  const MAX_EMAIL_LENGTH = 254;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const ALLOWED = {
    roles: ['Arrendatario (Deportista)', 'Arrendador (Propietario)'],
    renterSport: ['Surf', 'Kayak/Piragua', 'SUP / Paddle', 'Bici MTB', 'Otro deporte'],
    renterFrequency: ['Cada semana', 'Fines de semana', 'En vacaciones', 'Alguna vez al año'],
    renterBudget: ['Menos de €20', '€20 – €35', '€35 – €50', 'Más de €50'],
    renterZone: ['Centro ciudad', 'El Campello', 'San Juan / Playa', 'Punta Prima', 'Otra zona'],
    ownerEquipment: ['Tabla de Surf', 'Kayak/Piragua', 'SUP / Paddle', 'Bici MTB', 'Otro equipo'],
    ownerIdle: ['Menos de 3 meses', '3 – 6 meses', '6 – 9 meses', 'Todo el año'],
    ownerBlocker: ['Miedo a daños', 'Coordinar la entrega', 'No saber el precio justo', 'Nada, me sumo ya'],
    ownerIncome: ['€50 – €100', '€100 – €200', '€200 – €400', 'Más de €400'],
  };

  function trimValue(value) {
    return String(value || '').trim();
  }

  function normalizeEmail(value) {
    return trimValue(value).toLowerCase();
  }

  function normalizeOption(value) {
    return trimValue(value)
      .replace(/^[^\p{L}\p{N}€]+/u, '')
      .replace(/[^\p{L}\p{N}€]+$/u, '')
      .replace(/\s+/g, ' ');
  }

  function sanitizeText(value, maxLength) {
    return trimValue(value).replace(/\s+/g, ' ').slice(0, maxLength || MAX_TEXT_LENGTH);
  }

  function isValidEmail(value) {
    const email = normalizeEmail(value);
    return email.length > 0 && email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);
  }

  function isAllowed(value, allowedValues) {
    const normalizedValue = normalizeOption(value);
    return allowedValues.some(allowedValue => normalizeOption(allowedValue) === normalizedValue);
  }

  function validateLeadData(input) {
    const data = input || {};
    const errors = {};
    const values = {
      rol: sanitizeText(data.rol),
      deporte_equipo: normalizeOption(data.deporte_equipo),
      frecuencia_meses: normalizeOption(data.frecuencia_meses),
      presupuesto_ingresos: normalizeOption(data.presupuesto_ingresos),
      zona_alicante: normalizeOption(data.zona_alicante),
      freno_principal: normalizeOption(data.freno_principal),
      nombre: sanitizeText(data.nombre, MAX_NAME_LENGTH),
      email: normalizeEmail(data.email),
    };

    if (!values.rol) {
      errors.rol = 'Selecciona si quieres alquilar o prestar material.';
    } else if (!isAllowed(values.rol, ALLOWED.roles)) {
      errors.rol = 'Selecciona una opción válida.';
    }

    if (!values.nombre) {
      errors.nombre = 'Escribe tu nombre.';
    } else if (values.nombre.length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres.';
    }

    if (!values.email) {
      errors.email = 'Escribe tu email.';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Escribe un email válido.';
    }

    const isOwner = values.rol === 'Arrendador (Propietario)';
    const isRenter = values.rol === 'Arrendatario (Deportista)';

    if (!values.deporte_equipo) {
      errors.deporte_equipo = isOwner ? 'Selecciona qué material tienes.' : 'Selecciona qué deporte practicas.';
    } else if (isOwner && !isAllowed(values.deporte_equipo, ALLOWED.ownerEquipment)) {
      errors.deporte_equipo = 'Selecciona un material válido.';
    } else if (isRenter && !isAllowed(values.deporte_equipo, ALLOWED.renterSport)) {
      errors.deporte_equipo = 'Selecciona un deporte válido.';
    }

    if (!values.frecuencia_meses) {
      errors.frecuencia_meses = isOwner
        ? 'Selecciona cuántos meses está sin usar.'
        : 'Selecciona con qué frecuencia necesitas material.';
    } else if (isOwner && !isAllowed(values.frecuencia_meses, ALLOWED.ownerIdle)) {
      errors.frecuencia_meses = 'Selecciona una frecuencia válida.';
    } else if (isRenter && !isAllowed(values.frecuencia_meses, ALLOWED.renterFrequency)) {
      errors.frecuencia_meses = 'Selecciona una frecuencia válida.';
    }

    if (!values.presupuesto_ingresos) {
      errors.presupuesto_ingresos = isOwner
        ? 'Selecciona cuánto esperarías ganar.'
        : 'Selecciona cuánto pagarías por día.';
    } else if (isOwner && !isAllowed(values.presupuesto_ingresos, ALLOWED.ownerIncome)) {
      errors.presupuesto_ingresos = 'Selecciona un ingreso válido.';
    } else if (isRenter && !isAllowed(values.presupuesto_ingresos, ALLOWED.renterBudget)) {
      errors.presupuesto_ingresos = 'Selecciona un presupuesto válido.';
    }

    if (isRenter && !values.zona_alicante) {
      errors.zona_alicante = 'Selecciona tu zona en Alicante.';
    } else if (isRenter && !isAllowed(values.zona_alicante, ALLOWED.renterZone)) {
      errors.zona_alicante = 'Selecciona una zona válida.';
    }

    if (isOwner && !values.freno_principal) {
      errors.freno_principal = 'Selecciona qué te frenaría para alquilarlo.';
    } else if (isOwner && !isAllowed(values.freno_principal, ALLOWED.ownerBlocker)) {
      errors.freno_principal = 'Selecciona un freno válido.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      values,
    };
  }

  function buildNetlifyBody(values) {
    if (typeof FormData !== 'undefined' && values instanceof FormData) {
      return new URLSearchParams(values);
    }

    const params = new URLSearchParams();
    params.set('form-name', FORM_NAME);
    params.set('bot-field', '');
    params.set('rol', values.rol || '');
    params.set('deporte_equipo', values.deporte_equipo || '');
    params.set('frecuencia_meses', values.frecuencia_meses || '');
    params.set('presupuesto_ingresos', values.presupuesto_ingresos || '');
    params.set('zona_alicante', values.zona_alicante || '');
    params.set('freno_principal', values.freno_principal || '');
    params.set('nombre', values.nombre || '');
    params.set('email', values.email || '');
    return params;
  }

  async function submitToNetlify(values, fetchImpl) {
    const doFetch = fetchImpl || fetch;
    const response = await doFetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildNetlifyBody(values).toString(),
    });

    if (!response.ok) {
      throw new Error('Netlify form submission failed with HTTP ' + response.status);
    }

    return response;
  }

  function initBrowserForm(doc) {
    const documentRef = doc || document;
    const state = { role: null, data: {}, isSubmitting: false };

    function byId(id) {
      return documentRef.getElementById(id);
    }

    function calcEarnings() {
      const days = parseInt(byId('daysSlider').value, 10);
      const price = parseInt(byId('priceSlider').value, 10);
      const earn = Math.round(days * price * 0.75);
      byId('daysLabel').textContent = days + ' días';
      byId('priceLabel').textContent = price + '€';
      byId('earningsResult').innerHTML = earn + '€<span class="text-xl text-surface/60">/mes</span>';
    }

    function selectRole(role) {
      state.role = role;
      state.data.rol = role === 'renter' ? 'Arrendatario (Deportista)' : 'Arrendador (Propietario)';

      const renterLabel = byId('labelRenter');
      const ownerLabel = byId('labelOwner');
      if (role === 'renter') {
        renterLabel.classList.add('bg-primary-container/20', 'ring-2', 'ring-primary/30');
        ownerLabel.classList.remove('bg-primary-container/20', 'ring-2', 'ring-primary/30');
      } else {
        ownerLabel.classList.add('bg-primary-container/20', 'ring-2', 'ring-primary/30');
        renterLabel.classList.remove('bg-primary-container/20', 'ring-2', 'ring-primary/30');
      }

      const button = byId('btnStep1');
      button.disabled = false;
      button.classList.remove('opacity-50', 'cursor-not-allowed');
      button.classList.add('hover:brightness-110', 'active:scale-[0.99]');
    }

    function pick(element, group) {
      element.closest('.flex').querySelectorAll('.survey-option').forEach(option => {
        option.classList.remove('selected');
        option.setAttribute('aria-pressed', 'false');
      });
      element.classList.add('selected');
      element.setAttribute('aria-pressed', 'true');
      state.data[group] = normalizeOption(element.textContent);
    }

    function goStep(stepNumber) {
      documentRef.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
      byId('step' + stepNumber).classList.add('active');

      const progress = { 1: '33%', 2: '66%', 3: '100%' };
      byId('progressFill').style.width = progress[stepNumber] || '33%';

      if (stepNumber === 2) {
        byId('renterQ').style.display = state.role === 'renter' ? 'block' : 'none';
        byId('ownerQ').style.display = state.role === 'owner' ? 'block' : 'none';
      }
      byId('registro').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function getLeadValues() {
      return {
        rol: state.data.rol || '',
        deporte_equipo: state.data.sport || state.data.equipment || '',
        frecuencia_meses: state.data.freq || state.data.idle || '',
        presupuesto_ingresos: state.data.budget || state.data.income || '',
        zona_alicante: state.data.zone || '',
        freno_principal: state.data.blocker || '',
        nombre: byId('inputName').value,
        email: byId('inputEmail').value,
      };
    }

    function clearErrors() {
      ['inputName', 'inputEmail'].forEach(id => {
        const field = byId(id);
        field.classList.remove('input-error');
        field.removeAttribute('aria-invalid');
      });
      byId('inputNameError').textContent = '';
      byId('inputEmailError').textContent = '';
      byId('formStatus').textContent = '';
    }

    function showValidationErrors(errors) {
      clearErrors();
      const status = byId('formStatus');
      const inputName = byId('inputName');
      const inputEmail = byId('inputEmail');

      if (errors.nombre) {
        byId('inputNameError').textContent = errors.nombre;
        inputName.classList.add('input-error');
        inputName.setAttribute('aria-invalid', 'true');
        inputName.focus();
        return;
      }

      if (errors.email) {
        byId('inputEmailError').textContent = errors.email;
        inputEmail.classList.add('input-error');
        inputEmail.setAttribute('aria-invalid', 'true');
        inputEmail.focus();
        return;
      }

      const surveyError = errors.rol || errors.deporte_equipo || errors.frecuencia_meses ||
        errors.presupuesto_ingresos || errors.zona_alicante || errors.freno_principal;
      if (surveyError) {
        status.textContent = surveyError;
        status.focus();
      }
    }

    function setSubmitting(isBusy) {
      const button = byId('btnSubmit');
      byId('registro').setAttribute('aria-busy', String(isBusy));
      byId('btnText').textContent = isBusy ? 'Enviando...' : 'Apuntarme a la lista de espera';
      byId('btnIcon').style.display = isBusy ? 'none' : '';
      byId('btnSpinner').classList.toggle('hidden', !isBusy);
      button.disabled = isBusy;
      button.classList.toggle('opacity-70', isBusy);
      button.classList.toggle('cursor-not-allowed', isBusy);
    }

    function fillHiddenForm(values) {
      byId('hRol').value = values.rol;
      byId('hSport').value = values.deporte_equipo;
      byId('hFreq').value = values.frecuencia_meses;
      byId('hBudget').value = values.presupuesto_ingresos;
      byId('hZone').value = values.zona_alicante;
      byId('hBlocker').value = values.freno_principal;
      byId('hName').value = values.nombre;
      byId('hEmail').value = values.email;
    }

    async function submitForm() {
      if (state.isSubmitting) return false;

      const validation = validateLeadData(getLeadValues());
      if (!validation.isValid) {
        showValidationErrors(validation.errors);
        return false;
      }

      clearErrors();
      state.isSubmitting = true;
      setSubmitting(true);
      fillHiddenForm(validation.values);

      try {
        const formData = new FormData(byId('netlifyForm'));
        await submitToNetlify(formData);
        showSuccess();
        return true;
      } catch (error) {
        console.error('Error enviando el formulario de LIBRENTA:', error);
        const status = byId('formStatus');
        status.textContent = 'No hemos podido registrar tus datos. Revisa tu conexión e inténtalo de nuevo.';
        status.focus();
        return false;
      } finally {
        state.isSubmitting = false;
        if (byId('successState').classList.contains('hidden')) {
          setSubmitting(false);
        }
      }
    }

    function showSuccess() {
      byId('step3').style.display = 'none';
      const success = byId('successState');
      success.classList.remove('hidden');
      byId('progressFill').style.width = '100%';
      byId('progressFill').style.background = '#006e17';
      byId('registro').setAttribute('aria-busy', 'false');
      success.focus();
    }

    function initSurveyOptions() {
      documentRef.querySelectorAll('.survey-option').forEach(option => {
        option.setAttribute('role', 'button');
        option.setAttribute('tabindex', '0');
        option.setAttribute('aria-pressed', 'false');
        option.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            option.click();
          }
        });
      });
    }

    function initSmoothScroll() {
      documentRef.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (event) {
          const target = documentRef.querySelector(this.getAttribute('href'));
          if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }

    root.calcEarnings = calcEarnings;
    root.selectRole = selectRole;
    root.pick = pick;
    root.goStep = goStep;
    root.submitForm = submitForm;

    calcEarnings();
    initSurveyOptions();
    initSmoothScroll();
    documentRef.querySelectorAll('#inputName, #inputEmail').forEach(field => {
      field.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          event.preventDefault();
          submitForm();
        }
      });
    });

    return {
      state,
      getLeadValues,
      submitForm,
      setSubmitting,
    };
  }

  return {
    FORM_NAME,
    ALLOWED,
    buildNetlifyBody,
    initBrowserForm,
    isValidEmail,
    normalizeEmail,
    normalizeOption,
    sanitizeText,
    submitToNetlify,
    validateLeadData,
  };
});

if (typeof document !== 'undefined') {
  if (document.getElementById('netlifyForm')) {
    window.LibrentaLeadForm.initBrowserForm(document);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      window.LibrentaLeadForm.initBrowserForm(document);
    });
  }
}
