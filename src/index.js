const core = require('./core')

Object.defineProperty(exports, '__esModule', {
  value: true,
})

const secrets = core.search()

Object.keys(secrets).forEach((key) => {
  // set secret in process.env
  process.env[key] = secrets[key]

  // set secret in exports
  exports[key] = secrets[key]
})

// binds core methods to `import { verify } from 'secrets'`
exports.parse = core.parse
exports.search = core.parse
exports.verify = core.parse
exports.create = core.create

// binds secrets to `import secrets from secrets` by binding `exports.default` to `process.env`
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/get
Object.defineProperty(exports, 'default', {
  get: () => process.env,
})
