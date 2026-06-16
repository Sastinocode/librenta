# LIBRENTA

Landing estatica de validacion para LIBRENTA Alicante.

## Arquitectura actual

El flujo activo es:

Landing estatica -> Netlify Forms -> webhook de Netlify -> Make -> Notion CRM y correo de bienvenida.

Esta fase evita servidor propio y base de datos propia para mantener el piloto simple, trazable y barato de operar.

## Despliegue en Netlify

1. Conecta el repositorio `Sastinocode/librenta` en Netlify.
2. Usa la raiz del repositorio como directorio base.
3. No configures comando de build.
4. Publica la carpeta `.`.
5. Activa Forms en Netlify y configura el webhook hacia Make desde las notificaciones del formulario.

`netlify.toml` ya publica la raiz y no ejecuta Express ni otro servidor.

## Comprobar un registro

1. Abre la landing desplegada en Netlify.
2. Completa el formulario multistep.
3. Envia el formulario y espera el mensaje de exito.
4. En Netlify, ve a Site configuration -> Forms o Forms -> `librenta-leads`.
5. Comprueba que el lead aparece y que el webhook de Make se ha ejecutado.
6. Verifica en Notion CRM y en el correo de bienvenida que Make ha procesado el registro.

## Servicios externos

- Netlify Forms para captacion y almacenamiento inicial.
- Webhook de Netlify hacia Make.
- Make para automatizacion.
- Notion como CRM.
- Gmail o proveedor de correo configurado en Make para el email de bienvenida.

No hay variables de entorno necesarias en este repositorio. Los secretos deben vivir en Netlify, Make o el servicio externo correspondiente.

## Prueba manual

1. Selecciona un rol.
2. Responde todas las preguntas visibles de Customer Discovery.
3. Escribe nombre y email con espacios y mayusculas para confirmar normalizacion.
4. Desconecta la red o fuerza un fallo temporal para comprobar que no aparece exito falso y que los datos siguen en pantalla.
5. Reintenta el envio.

## Pruebas locales

Ejecuta:

```bash
npm test
```

Tambien puedes ejecutar directamente:

```bash
node tests/lead-form.test.js
```

Las pruebas son Node puro para evitar un framework pesado en esta fase.

## Arquitectura descartada temporalmente

Express/Resend no forma parte del flujo activo. Mantener dos caminos de captacion produciria duplicidad de datos, estados de exito inconsistentes y mas superficie de mantenimiento. Si se recupera en una fase posterior, debe integrarse como una decision arquitectonica nueva y no convivir en paralelo con Netlify Forms sin una razon clara.

En el arbol actual no existe `serve.js`, `package.json` con Express/Resend ni backend versionado activo.

## Problemas conocidos

- La landing usa Tailwind desde CDN para acelerar la validacion. Por eso no se define todavia una Content-Security-Policy estricta; se recomienda implementarla cuando Tailwind deje de cargarse por CDN.
- Las paginas legales del footer apuntan a marcadores pendientes.
- Netlify Forms solo procesa envios reales en el entorno desplegado de Netlify.

## Siguiente fase tecnica recomendada

Cuando el piloto valide demanda, extraer Tailwind a un build local, definir una CSP completa, anadir analitica de conversion y decidir si hace falta backend propio o Supabase para marketplace, autenticacion y pagos.
