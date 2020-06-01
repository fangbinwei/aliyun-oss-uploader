import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import copy from 'rollup-plugin-copy'
import builtins from 'builtin-modules'

export default {
  input: 'out/extension.js',
  output: {
    file: 'dist/extension.js',
    format: 'cjs',
    exports: 'named'
  },
  external: ['vscode', ...builtins, 'xmlbuilder', 'readable-stream'],
  plugins: [
    resolve(),
    commonjs(),
    json(),
    replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
    // https://github.com/rollup/rollup/issues/1767
    // https://github.com/rollup/rollup/issues/1507
    // sadly, rollup can't hold the circular dependencies. TODO: use webpack
    copy({
      targets: [
        { src: 'node_modules/xmlbuilder', dest: 'dist/node_modules/' },

        {
          src: [
            'isarray',
            'core-util-is',
            'process-nextick-args',
            'inherits',
            'readable-stream',
            'safe-buffer',
            'string_decoder',
            'util-deprecate'
          ].map((m) => {
            return `node_modules/${m}`
          }),
          dest: 'dist/node_modules/'
        }
      ]
    })
  ]
}
