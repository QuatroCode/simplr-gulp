// rollup.config.js
import typescriptPlugin from 'rollup-plugin-typescript';
import rollupWatch from 'rollup-watch';

export default {
  entry: './src/main.ts',
  dest: 'dist/gulpfile.js', 
  format: 'cjs',
  plugins: [
    typescriptPlugin({
      typescript: require("typescript")
    }),
    rollupWatch()
  ]
}