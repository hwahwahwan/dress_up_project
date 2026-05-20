import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function fitSaverPlugin() {
  return {
    name: 'fit-saver',
    configureServer(server) {
      server.middlewares.use('/api/save-fit', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try {
            const { id, fit } = JSON.parse(body);
            const itemsPath = path.resolve(__dirname, 'src/data/items.js');
            let src = fs.readFileSync(itemsPath, 'utf-8');
            const fitFields = [`top: ${fit.top}`, `width: ${fit.width}`];
            if (fit.dx != null && fit.dx !== 0) fitFields.push(`dx: ${fit.dx}`);
            const fitStr = `{ ${fitFields.join(', ')} }`;
            src = src.replace(
              new RegExp(`(id:\\s*${id}\\b.*?fit:\\s*)\\{[^}]*\\}`, 's'),
              `$1${fitStr}`
            );
            fs.writeFileSync(itemsPath, src, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), fitSaverPlugin()],
  server: { port: 5173 },
});
