import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const tmpUploadsDir = path.resolve(__dirname, '../tmp');
if (!fs.existsSync(tmpUploadsDir)) {
  fs.mkdirSync(tmpUploadsDir, { recursive: true });
}