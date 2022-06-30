module.exports = {
  extends: ['next'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off',
    '@next/next/no-img-element': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
