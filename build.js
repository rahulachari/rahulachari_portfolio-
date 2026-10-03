const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['components/ui/hero-carousel-mount.tsx'],
  bundle: true,
  outfile: 'hero-carousel-prod.js',
  minify: true,
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts'
  }
}).then(() => {
  console.log('Build successful: hero-carousel-prod.js generated!');
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
