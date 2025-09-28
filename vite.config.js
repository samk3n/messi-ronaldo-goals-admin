import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(),],
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: process.env.USE_TUNNEL === "1" ? {
            host: 'dev.samkeno.com',
            protocol: 'wss'
        } : true,
        allowedHosts: ['dev.samkeno.com', "localhost"]
    }
})
