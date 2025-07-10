import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, '../bolt/supabase/functions');

function deleteRecursiveSync(directory) {
  if (fs.existsSync(directory)) {
    for (const entry of fs.readdirSync(directory)) {
      const entryPath = path.join(directory, entry);
      if (fs.lstatSync(entryPath).isDirectory()) {
        deleteRecursiveSync(entryPath);
        fs.rmdirSync(entryPath);
      } else {
        fs.unlinkSync(entryPath);
      }
    }
  }
}

console.log('🧹 Cleaning bolt/supabase/functions...');
deleteRecursiveSync(dir);
console.log('✅ Clean complete!');
