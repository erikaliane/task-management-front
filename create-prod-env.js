const fs = require('fs');
const path = require('path');

// Cargar variables del archivo .env
require('dotenv').config();

// Leer el archivo .env manualmente como respaldo
const envPath = path.join(__dirname, '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
}

// Crear el directorio environments si no existe
const envDir = path.join(__dirname, 'src', 'environments');
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// Obtener API_URL del .env o usar valor por defecto
const apiUrl = process.env.API_URL || envVars.API_URL || 'http://localhost:5137/api';

// Contenido del archivo environment.prod.ts
const prodEnvContent = `export const environment = {
  production: true,
  API_URL: '${apiUrl}',
  tokenKey: 'task_management_token',
  appName: 'TaskFlow'
};`;

// Escribir el archivo
const prodEnvPath = path.join(envDir, 'environment.prod.ts');
fs.writeFileSync(prodEnvPath, prodEnvContent);

console.log('✅ Archivo environment.prod.ts creado exitosamente');
console.log(`📍 Ubicación: ${prodEnvPath}`);
console.log(`🔗 API_URL configurada: ${apiUrl}`);
console.log(`📄 Variables leídas del .env:`, envVars);
