# 🚨 REMEDIACIÓN DE SEGURIDAD - Private Key Expuesta

## Incidente
**Fecha:** 2025-12-06 12:00 UTC  
**Severidad:** CRÍTICA  
**Tipo:** Firebase Service Account Private Key expuesta en GitHub

## Acciones Tomadas

### 1. ✅ Service Account Key Revocada
- Key comprometida eliminada de Firebase Console
- Email: `firebase-adminsdk-fbsvc@istqbproject.iam.gserviceaccount.com`
- La key anterior ya NO funciona

### 2. ✅ Archivo Removido del Repositorio
```bash
git rm certifyme/NETLIFY_ENV_SETUP.md
git commit -m "security: remove exposed credentials"
git push upstream main
```

### 3. ✅ .gitignore Creado
Prevenir futuros accidentes:
```
NETLIFY_ENV_SETUP.md
.env
.env.local
```

### 4. ⚠️ PENDIENTE: Limpiar Historial de Git

**La key AÚN existe en el historial de commits anteriores.**

**Opciones:**

**A) Forzar limpieza del historial (Recomendado si repo es privado)**
```bash
# Eliminar archivo del historial completo
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch certifyme/NETLIFY_ENV_SETUP.md" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push upstream main --force
```

**B) Rotar completamente el repositorio (Más seguro)**
- Crear nuevo repo
- Copiar solo código actual (sin historial)
- Actualizar remote en Netlify

**C) Aceptar el riesgo y solo monitorear**
- Key ya está revocada (no funciona)
- GitGuardian alertará si alguien la usa
- Generar nueva key y continuar

---

## Próximos Pasos URGENTES

### 1. Generar Nueva Service Account Key

**Ve a Firebase Console:**
1. https://console.firebase.google.com/project/istqbproject/settings/serviceaccounts
2. Click "Generate new private key"
3. Descargar JSON
4. **NO subirlo a Git**

### 2. Actualizar Variables en Netlify

**Netlify Dashboard → Site settings → Environment variables:**

Actualizar estas 3 variables con valores del **NUEVO JSON**:
- `FIREBASE_CLIENT_EMAIL` → nuevo email
- `FIREBASE_PRIVATE_KEY` → nueva private key
- `FIREBASE_PROJECT_ID` → (mismo: istqbproject)

### 3. Redeploy en Netlify

Después de actualizar variables:
- Netlify → Deploys → Trigger deploy
- Las Functions tomarán la nueva key

---

## Checklist de Seguridad

- [x] Key comprometida revocada ✅
- [x] Archivo eliminado del repo ✅
- [x] .gitignore creado ✅
- [x] Commit y push realizados ✅
- [ ] Historial de Git limpiado ⚠️
- [ ] Nueva Service Account Key generada ⚠️
- [ ] Variables actualizadas en Netlify ⚠️
- [ ] Redeploy verificado ⚠️
- [ ] GitGuardian notificado de resolución ⚠️

---

## Lecciones Aprendidas

### ❌ Qué salió mal:
1. Archivo con credenciales subido a GitHub
2. Sin .gitignore desde el inicio
3. Documentación de setup con valores reales

### ✅ Mejoras implementadas:
1. .gitignore robusto
2. Documentación sin credenciales
3. Variables SOLO en Netlify Dashboard

### 🔒 Prevención futura:
1. **NUNCA** poner credenciales en archivos versionados
2. Usar `.env.example` con placeholders
3. Revisar commits antes de push
4. Habilitar pre-commit hooks
5. Activar GitHub secret scanning

---

## Referencias

- [GitGuardian Guide](https://docs.gitguardian.com/secrets-detection/detectors/specifics/generic_private_key)
- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/api-keys)
- [Git Filter-Branch](https://git-scm.com/docs/git-filter-branch)

---

**Estado:** 🟡 PARCIALMENTE RESUELTO  
**Próxima acción:** Generar nueva Service Account Key
