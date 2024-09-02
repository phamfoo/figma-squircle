import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist/'] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
]
