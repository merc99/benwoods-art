import next from 'eslint-config-next'

const config = [
  ...next,
  { ignores: ['.next/**', 'node_modules/**', 'handoff/**', 'assets/**', 'next-env.d.ts'] },
]

export default config
