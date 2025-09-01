# Frontend: Task Management System

## 📝 Descripción
Este repositorio contiene el frontend del sistema de gestión de tareas. Está desarrollado con Angular 15 y utiliza Angular Material para el diseño de la interfaz de usuario. Este sistema permite a los administradores crear y gestionar tareas, y a los empleados ver las tareas asignadas a ellos.

---

## 🚀 Tecnologías Utilizadas
- **Framework**: Angular 15
- **Lenguaje**: TypeScript
- **UI Framework**: Angular Material
- **Diseño**: Responsive Design

---

## 🌐 Funcionalidades Principales
- **Login/Logout**: Autenticación mediante JWT.
- **Roles**:
  - **Admin**: Ver, crear, editar, eliminar (soft delete) y asignar tareas.
  - **Employee**: Ver tareas asignadas, filtrar por busqueda de título/descripción, ver detalles de una tarea.
- **Gestión de Tareas**:
  - Crear, listar, editar, eliminar, asignar tareas (Admin).
  - Filtros por título y descripción (Employee).

---


## 🌟 Instrucciones de Configuración
### Variables de Entorno
Crea un archivo `environment.ts` con las siguientes variables:
```typescript
export const environment = {
  production: true,
  API_URL: 'https://your-backend-api-url', // URL del backend
};
```

### Instalación
1. Clona el repositorio.
2. Instala las dependencias:
   ```
   npm install
   ```
3. Levanta el servidor de desarrollo:
   ```
   ng serve
   ```

---

## 🛠 Deploy
El frontend está desplegado en **Vercel**. 

---

## 🔐 Notas de Seguridad
- Todos los endpoints requieren un token JWT en el encabezado.
