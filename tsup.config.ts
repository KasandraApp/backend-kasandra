import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { '[[route]]': 'src/vercel-handler.ts' },
  outDir: 'api',
  format: ['esm'],
  target: 'node20',      // samakan dengan Node version di Vercel project settings
  platform: 'node',
  bundle: true,           // ini yang menyelesaikan masalah ekstensi — semua relative import dilebur jadi satu file
  splitting: false,
  clean: true,            // aman sekarang, karena api/ cuma berisi hasil build
  dts: false,
  minify: false,
  outExtension() {
    return { js: '.js' }; // pastikan output .js, bukan .mjs (harusnya sudah default karena "type":"module")
  },
  external: [
    // taruh di sini kalau nanti ada dependency native yang bermasalah,
    // seperti kasus bcrypt → bcryptjs kemarin di project lain
  ],
});