import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// This app calls the backend as a remote API via an absolute VITE_API_BASE_URL (see src/api/client.ts)
// and the backend allows this origin via CORS — no dev proxy needed now that they're separate services.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
