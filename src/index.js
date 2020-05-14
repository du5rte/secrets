const { readEnvs, cacheEnvs } = require('./core')

const envs = readEnvs()

cacheEnvs(envs)

// binds exports to `process.env`
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/get
Object.defineProperty(module, 'exports', {
  get: () => process.env,
})
