import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

// FIX: `__dirname` is not available in ES modules. This defines a compatible equivalent.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    return {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
