# CLAUDE.md — portal-nova-domus

Lo lee toda sesión de Claude Code que se abra en este repo, sea de Agustín o de alguien del equipo.
Las reglas de negocio no están acá: viven en el plugin `nova-domus` (skills, repo privado) y en
`DECISIONES.md`.

⚠️ **Este repo es público.** Todo lo que entra acá —archivos, commits, pull requests, sus
descripciones y comentarios— lo puede leer cualquiera. Costos, márgenes, remarque, comisiones,
tarifario, proveedores y preguntas de precio van **solo** al repo privado `Novadomus-cba/nova-domus-py`.

## 1. Con quién estás trabajando — decidilo antes de tocar nada

Corré `git config user.email` y `gh api user --jq .login`.

- **Agustín Davila** (`admin@nova-domus.com.ar` / cuenta `Novadomus-cba`): flujo de siempre. Puede
  publicar directo en `main` y escribir en Supabase según las reglas de la maestra.
- **Cualquier otra persona** (hoy: Lucas Cañete, `l.canete@nova-domus.com.ar`): flujo por pull
  request de la sección 2, sin excepciones. Si no podés determinar quién es, asumí este flujo.

## 2. Flujo de un PY para el equipo comercial

El PY llega a Agustín terminado y auditado, y él lo aprueba desde el celular. Se trabaja con dos
repos clonados uno al lado del otro: este (`portal-nova-domus`, público, el HTML) y `nova-domus-py`
(privado, todo lo interno).

1. **Flujo de pasos.** El flujo completo de un PY (Pasos 1 a 5) está en la skill
   `nova-domus-maestra`, `references/flujo-py.md`. Leerlo antes de arrancar. Verificar también la
   versión del plugin (maestra §0, regla 7).
2. **La misma rama en los dos repos, nunca `main`.** `git switch -c py/2026-NNN-nombre-corto` desde
   `main` actualizado, en los dos. Nunca `git push` a `main`, nunca `--force` sobre una rama ajena,
   nunca el token de deploy de Agustín (si aparece en algún documento, no se usa).
3. **Número de PY.** Próximo libre según `proyectos` en Supabase **y** las ramas `py/*` abiertas
   (`gh pr list --state open` en los dos repos). Agustín lo confirma al aprobar.
4. **Supabase: solo lectura.** Toda escritura que el PY necesite va como SQL en
   `nova-domus-py/py-2026-NNN/escrituras.sql`. La ejecuta Agustín después de aprobar.
5. **Lo interno**, en `nova-domus-py/py-2026-NNN/`: `resumen-interno.md` (Paso 3) y
   `auditoria.md`. **Lo público**, acá: `propuestas/py-2026-NNN-nombre.html`, su og y sus planos.
6. **Auditar** con la skill `nova-domus-auditoria-py`, como subagente separado (prompt en su §8).
   Se corrige y se vuelve a auditar hasta "LISTO PARA AGUSTÍN".
7. **Dos pull requests**, cada uno con la plantilla de su repo. El interno lleva las preguntas para
   Agustín (sí/no o A/B) y el link al público. El público lleva solo el link al interno y la vista
   previa: ni un número interno, ni una pregunta de precio.
8. **Vista previa.** Cloudflare Pages publica cada rama en
   `https://<rama-con-guiones>.portalnovadomus.pages.dev/propuestas/<archivo>.html`. Ese link va en
   los dos PR y por WhatsApp a Agustín. No se le manda nada al cliente hasta el merge.
9. **Después del merge** el link definitivo es el de GitHub Pages; verificar build `built`
   (propuestas §1) antes de mandárselo al cliente. Al cliente no se le manda el link pelado: se
   genera uno **por destinatario** desde el panel ("🔗 Links por destinatario" en Seguimiento de
   Propuestas), que agrega `?r=<token>`.
10. **Tracking.** Toda propuesta lleva `<meta name="py-codigo" content="PY-2026-NNN">` y, antes de
    `</body>`, `<script src="../assets/propuesta-track.js" defer></script>`. Nunca un snippet inline
    contra `propuesta_vistas`. Detalle en `DECISIONES.md` del repo `nova-domus-skills`, §4, "Tracking de propuestas v2".
11. **Si Agustín corrige algo**, además de corregirlo, agregar la entrada en
    `references/registro-correcciones.md` de la skill de auditoría (repo `nova-domus-skills`, por PR).

## 3. Qué no hace nunca una sesión del equipo comercial

- Escribir en Supabase (ni `INSERT`, ni `UPDATE`, ni migraciones), ni tocar `voowjwzlkhdknpapkhxc`.
- Modificar módulos del portal fuera de `propuestas/`.
- Poner material interno en este repo o en sus pull requests (ver el aviso de arriba).
- Editar skills desde acá: las skills viven en `nova-domus-skills` y se cambian por PR allá.
- Decidir precios custom, márgenes bajo piso, marcas fuera del stack o excepciones de criterio:
  eso es de Agustín (maestra §3.12) y va como pregunta en el PR interno.
