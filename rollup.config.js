// rollup.config.js
import typescript from 'rollup-plugin-typescript';
import rollupWatch from 'rollup-watch';

export default {
  entry: './src/main.ts',
  dest: 'src/gulpfile.js', 
  format: 'cjs',
  plugins: [
    typescript(),
    rollupWatch()
  ]
}