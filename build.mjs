import * as esbuild from 'esbuild';

// Bundle the Vercel serverless function entry point
// This resolves all imports into a single file, avoiding ESM extension issues
await esbuild.build({
  entryPoints: ['api/[[route]].ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'api/[[route]].js',
  tsconfig: 'tsconfig.json',
  packages: 'external',
});

console.log('✓ Built api/[[route]].js');
