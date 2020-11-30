const core = require('./core')

Object.defineProperty(exports, '__esModule', {
  value: true,
})

const secrets = core.search()

Object.keys(secrets).forEach((key) => {
  // set secret in process.env
  process.env[key] = secrets[key]
})

// binds core methods to `import { verify } from 'secrets'`
Object.assign(exports, core)

// binds secrets to `import secrets from secrets` by binding `exports.default` to `process.env`
exports.default = core
