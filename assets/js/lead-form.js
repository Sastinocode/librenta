(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LibrentaLeadForm = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const FORM_NAME = 'librenta-leads';
  const MAX_TEXT_LENGTH = 120;
  const MAX_EMAIL_LENGTH = 254;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function trimValue(value) {
    return String(value || '').trim();
  }

  function normalizeEmail(value) {
    return trimValue(value).toLowerCase();
  }

  function isValidEmail(value) {
    const email = normalizeEmail(value);
    return email.length > 0 && email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);
  }

  function sanitizeText(value, maxLength) {
    return trimValue(value).replace(/\s+/g, ' ').slice(0, maxLength || MAX_TEXT_LENGTH);
  }

  function validateLeadData(input) {
    const data = input || {};
    const errors = {};
    const role = sanitizeText(data.rol);
    const name = sanitizeText(data.nombre);
    const email = normalizeEmail(data.email);
    const sport = sanitizeText(data.deporte_equipo);
    const frequency = sanitizeText(data.frecuencia_meses);
    const budget = sanitizeText(data.presupuesto_ingresos);
    const zone = sanitizeText(data.zona_alicante);
    const blocker = sanitizeText(data.freno_principal);

    if (!role) {
      errors.rol = 'Selecciona si quieres alquilar o prestar material.';
    }

    if (!name) {
      errors.nombre = 'Escribe tu nombre.';
    } else if (name.length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres.';
    }

    if (!email) {
      errors.email = 'Escribe tu email.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Escribe un email valido.';
    }

    if (!sport) {
      errors.deporte_equipo = role.includes('Propietario')
        ? 'Selecciona que material tienes.'
        : 'Selecciona que deporte practicas.';
    }

    if (!frequency) {
      errors.frecuencia_meses = role.includes('Propietario')
        ? 'Selecciona cuantos meses esta sin usar.'
        : 'Selecciona con que frecuencia necesitas material.';
    }

    if (!budget) {
      errors.presupuesto_ingresos = role.includes('Propietario')
        ? 'Selecciona cuanto esperarias ganar.'
        : 'Selecciona cuanto pagarias por dia.';
    }

    if (role.includes('Deportista') && !zone) {
      errors.zona_alicante = 'Selecciona tu zona en Alicante.';
    }

    if (role.includes('Propietario') && !blocker) {
      errors.freno_principal = 'Selecciona que te frenaria para alquilarlo.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      values: {
        rol: role,
        deporte_equipo: sport,
        frecuencia_meses: frequency,
        presupuesto_ingresos: budget,
        zona_alicante: zone,
        freno_principal: blocker,
        nombre: name,
        email,
      },
    };
  }

  function buildNetlifyBody(values) {
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

  return {
    FORM_NAME,
    buildNetlifyBody,
    isValidEmail,
    normalizeEmail,
    sanitizeText,
    validateLeadData,
  };
});
