# LIBRENTA

Landing estatica de validacion para LIBRENTA Alicante.

## Proposito actual

Este repositorio contiene la landing estatica de captacion de leads para validar demanda antes de construir marketplace, autenticacion, pagos o base de datos propia.

## Arquitectura activa

El flujo activo es:

Landing -> Netlify Forms -> Make -> Notion/Gmail

Netlify recibe el formulario `librenta-leads`, Make procesa el webhook, Notion actua como CRM y Gmail envia el correo de bienvenida.

## Despliegue en Netlify

1. Conecta el repositorio `Sastinocode/librenta` en Netlify.
2. Usa la raiz del repositorio como directorio base.
3. No configures comando de build.
4. Publica la carpeta `.`.
5. Activa Forms en Netlify.
6. Configura una notificacion webhook del formulario hacia Make.

## Como comprobar un lead

1. Abre la URL desplegada en Netlify.
2. Completa el formulario multistep.
3. Envia y espera el estado de exito.
4. En Netlify, revisa Forms -> `librenta-leads`.
5. Comprueba que Make recibio el webhook.
6. Verifica el registro en Notion y el envio del correo desde Gmail.

## Como probar el formulario

Ejecuta:

```bash
npm test
```

Prueba manual recomendada:

1. Selecciona un rol.
2. Completa las preguntas visibles de Customer Discovery.
3. Escribe nombre y email con espacios y mayusculas.
4. Fuerza un fallo de red o HTTP y confirma que no aparece exito falso.
5. Reintenta sin perder los datos introducidos.

## Servicios externos

- Netlify Forms
- Webhook de Netlify hacia Make
- Make
- Notion
- Gmail o proveedor configurado en Make

No hay secretos necesarios en el repositorio. Las credenciales deben vivir en Netlify, Make, Notion o Gmail.

## Fuera del flujo activo

Express/Resend fue retirado o archivado porque no formaba parte del flujo activo de Netlify.

No forman parte de esta fase:

- Express
- Resend
- Supabase
- Next.js
- React
- Stripe
- Autenticacion
- Marketplace

## Problemas conocidos

- Tailwind se carga por CDN. Compilar Tailwind y aplicar CSP estricta en un sprint posterior.
- Las paginas legales del footer siguen pendientes.
- Netlify Forms solo confirma envios reales en un deploy de Netlify.

## Proximo sprint recomendado

1. Compilar Tailwind localmente.
2. Aplicar una Content-Security-Policy estricta.
3. Anadir analitica de conversion.
4. Preparar la siguiente arquitectura solo si el piloto valida demanda.
