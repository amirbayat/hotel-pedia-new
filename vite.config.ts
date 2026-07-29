import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      // import { ReactComponent as IconX } from './x.svg?react'
      svgrOptions: {
        // Cleaned SVGs keep their baked-in width/height="24" (see scripts/process-icons.mjs),
        // so 24px is the default. expandProps: 'end' spreads consumer props (width, height,
        // color, className, ...) after that, so passing width/height overrides the default.
        expandProps: 'end',
      },
    }),
  ],
})
