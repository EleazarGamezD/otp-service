# 📚 Swagger Documentation

Este proyecto tiene la documentación de la API separada en dos interfaces diferentes para mejorar la seguridad y organización:

## 🔐 API Pública (`/api-docs`)

**URL:** `http://localhost:3000/api-docs`

**Autenticación:** API Key requerida

**Descripción:** Esta es la documentación pública para clientes que consumen el servicio OTP.

**Endpoints incluidos:**
- ✅ Generación y verificación de OTP
- ✅ Endpoints de salud del servidor
- ✅ Operaciones relacionadas con OTP

**Autenticación requerida:**
```
Header: x-api-key
Value: [tu-api-key-del-cliente]
```

## 🛠️ Panel de Administración (`/admin-docs`)

**URL:** `http://localhost:3000/admin-docs`

**Autenticación:** Basic Authentication requerida

**Descripción:** Panel administrativo para gestión de clientes y configuración del sistema.

**Endpoints incluidos:**
- ✅ Gestión de clientes (crear, actualizar, eliminar)
- ✅ Asignación y monitoreo de tokens
- ✅ Configuración de plantillas de email
- ✅ Herramientas de testing de email
- ✅ Monitoreo de salud del sistema

**Autenticación requerida:**
```
Basic Auth:
Username: [ADMIN_USERNAME]
Password: [ADMIN_PASSWORD]
```

## ⚙️ Configuración

### Variables de Entorno Requeridas

```bash
# Credenciales del panel de administración
ADMIN_USERNAME=tu_usuario_admin
ADMIN_PASSWORD=tu_password_seguro
```

### Características Técnicas

- **Filtrado por Tags:** Cada documentación solo muestra los endpoints relevantes
- **Estilos Personalizados:** Cada interface tiene su propio tema visual
- **Autenticación Separada:** API Key para público, Basic Auth para admin
- **Arquitectura Modular:** Archivos separados para mejor mantenimiento

## 🚨 Seguridad

⚠️ **IMPORTANTE:** El panel de administración (`/admin-docs`) permite modificar configuraciones críticas del sistema. Solo debe ser accesible por personal autorizado.

### Recomendaciones:

1. **Credenciales Fuertes:** Usa contraseñas complejas para el admin
2. **Acceso Restringido:** Configura firewall para limitar acceso al panel admin
3. **HTTPS en Producción:** Nunca uses Basic Auth sobre HTTP en producción
4. **Monitoreo:** Implementa logging de accesos al panel admin

## 📁 Estructura de Archivos

```
src/core/swagger/
├── swagger.ts              # Configuración principal
├── public-swagger.ts       # Configuración API pública
└── admin-swagger.ts        # Configuración panel admin
```

## 🔧 Desarrollo

Para agregar nuevos endpoints:

1. **API Pública:** Usa el tag `@ApiTags('OTP')` o `@ApiTags('Server Health')`
2. **Panel Admin:** Usa el tag `@ApiTags('Client Management')` o `@ApiTags('Mail Testing')`

Ejemplo:
```typescript
@ApiTags('Client Management')  // Aparecerá en admin-docs
@Controller('clients')
export class ClientController {
  // ...
}

@ApiTags('OTP')  // Aparecerá en api-docs
@Controller('otp')
export class OtpController {
  // ...
}
```
