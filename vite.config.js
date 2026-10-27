import { defineConfig,loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({mode})=>{
  // Optional local preview API; not embedded into the production browser bundle.
  const env=loadEnv(mode,process.cwd(),'SOLO_DEV_')
  const proxy={'/api':{target:env.SOLO_DEV_API_URL||'http://127.0.0.1:8080',changeOrigin:true}}
  return {plugins:[react()],server:{proxy},preview:{proxy}}
})
