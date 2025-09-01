const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv').config({ path: 'src/.env' });

const apiUrl = process.env.API_URL || 'http://localhost:5137/api';

const envFile = `export const environment = {
    apiUrl: '${apiUrl}',
};
`;


const targetPath = path.join(__dirname, './src/environments/environment.development.ts');
fs.writeFile(targetPath, envFile, (err) => {
    if (err) {
        console.error(err);
        throw err;
    } else {
        console.log('✅ Successfully generated environment.development.ts');
    }
});