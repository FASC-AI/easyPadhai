import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the built index.html
const indexPath = path.join(__dirname, '../backend/dist/index.html');

// Read the HTML file
let html = fs.readFileSync(indexPath, 'utf8');

// Remove leading slashes from asset paths
html = html.replace(/src="\//g, 'src="');
html = html.replace(/href="\//g, 'href="');

// Write the modified HTML back
fs.writeFileSync(indexPath, html, 'utf8');

console.log('✅ Asset paths fixed! Removed leading slashes from src and href attributes.');
console.log('📁 Updated file:', indexPath);
