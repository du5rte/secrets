const fs = require('fs')
const path = require('path')

const cleanupRegex = /(^['"]|['"]$)/g

function parseQuotes(str, line) {
  try {
    return str.replace(cleanupRegex, '').trim()
  } catch (error) {
    throw new Error(`line ${line}: could not remove quotes`)
  }
}

const keyValuePairRegex = /^(\w+)\s*=\s*(.+)$/i

function parseKeyValuePair(str) {
  try {
    const match = str.match(keyValuePairRegex)

    const key = match[1]
    const rawValue = match[2]

    if (!key) {
      throw new Error(`missing or empty key`)
    }

    if (!rawValue) {
      throw new Error(`missing or empty value`)
    }

    const value = parseQuotes(rawValue)

    return [key, value]
  } catch (error) {
    throw new Error(`malformatted, ${error ? error.message : ''}`)
  }
}

const regexLineBreak = /\n/g

function parseIntoLines(str) {
  try {
    return str.split(regexLineBreak)
  } catch (error) {
    throw new Error(`"unable to split lines`)
  }
}

function parse(raw) {
  try {
    const lines = parseIntoLines(raw)

    if (lines.length === 0) {
      return {}
    }

    return lines.reduce((final, line, index) => {
      try {
        // empty line
        if (line.trim().length === 0) {
          return final
        }

        // comment
        if (line.trim().startsWith('#')) {
          return final
        }

        const [key, value] = parseKeyValuePair(line)

        return { ...final, [key]: value }
      } catch (error) {
        throw new Error(`line ${index + 1}, ${error ? error.message : ''}`)
      }
    }, {})
  } catch (error) {
    throw new Error(`unable to parse content, ${error ? error.message : ''}`)
  }
}

function readSecretsFile(fileLocation) {
  try {
    const file = fs.readFileSync(fileLocation, 'utf8')
    const data = parse(file)

    return data
  } catch (error) {
    throw new Error(
      `unable to parse secrets file: "${fileLocation}", ${
        error ? error.message : ''
      }`
    )
  }
}

function readDotEnvFile(fileLocation) {
  try {
    const file = fs.readFileSync(fileLocation, 'utf8')
    const data = parse(file)

    return data
  } catch (error) {
    throw new Error(
      `Unable to parse dotenv file: ${fileLocation}, ${
        error ? error.message : ''
      }`
    )
  }
}

function readJsonFile(fileLocation) {
  try {
    const file = fs.readFileSync(fileLocation, 'utf8')
    const data = JSON.parse(file)

    return data
  } catch (error) {
    throw new Error(
      `Unable to parse json file: ${fileLocation}, ${
        error ? error.message : ''
      }`
    )
  }
}

function readJavaScriptFile(fileLocation) {
  try {
    const data = require(fileLocation)

    return data
  } catch (error) {
    throw new Error(
      `Unable to parse js file: ${fileLocation}, ${error ? error.message : ''}`
    )
  }
}

const SECRET = '.secrets'
const ENV = '.env'
const ENVJSON = '.env.json'
const ENVJS = '.env.js'

function read(type, fileLocation) {
  switch (type) {
    case ENV:
      return readDotEnvFile(fileLocation)
    case ENVJSON:
      return readJsonFile(fileLocation)
    case ENVJS:
      return readJavaScriptFile(fileLocation)
    case SECRET:
      return readSecretsFile(fileLocation)
    default:
      throw new Error(`invalid type ${type}`)
  }
}

const types = [ENV, ENVJSON, ENVJS, SECRET]

const nodeModulesRegex = /node_modules/

function search() {
  try {
    const directories = module.paths
      .map((dir) => path.dirname(dir))
      .filter((dir) => !nodeModulesRegex.test(dir))
      .reverse()

    return directories.reduce((final, directory) => {
      const objs = types.reduce((acc, type) => {
        const totalpath = path.join(directory, type)

        const exists = fs.existsSync(totalpath)

        if (exists) {
          console.log(`Found "${type}" in "${directory}"`)

          const obj = read(type, totalpath)

          console.log(sanatize(obj))

          return {
            ...acc,
            ...obj,
          }
        }

        return acc
      }, {})

      return { ...final, ...objs }
    }, {})
  } catch (error) {
    throw error
  }
}

function indent(str) {
  return str
    .split('\n')
    .map((str) => `  ${str}`)
    .join('\n')
}

const VALID = '***'
const INVALID = 'INVALID'

function sanatize(secrets) {
  return Object.keys(secrets).reduce((final, key) => {
    const valid = typeof secrets[key] === 'string' && secrets[key].length > 0

    return {
      ...final,
      [key]: valid ? VALID : INVALID,
    }
  }, {})
}

function verify(...keys) {
  const filtered = keys.reduce((obj, key) => {
    return {
      ...obj,
      [key]: process.env[key],
    }
  }, {})

  const sanatized = sanatize(filtered)

  const invalid = Object.values(sanatized).includes(INVALID)

  if (invalid) {
    throw new Error(
      `Found invalid secret(s):\n${indent(JSON.stringify(sanatized, null, 2))}`
    )
  }
}

function formatDotEnv(secrets) {
  return Object.keys(secrets)
    .map((key) => {
      return `${key}=${secrets[key]}`
    })
    .join('\n')
}

function formatJson(secrets) {
  return JSON.stringify(secrets, null, 2)
}

function format(secrets, type) {
  type = type || 'dotenv'

  switch (type) {
    case 'dotenv':
      return formatDotEnv(secrets)
    case 'json':
      return formatJson(secrets)
  }
}

module.exports = {
  parseQuotes,
  parseKeyValuePair,
  parseIntoLines,
  parse,
  search,
  readSecretsFile,
  readDotEnvFile,
  readJsonFile,
  readJavaScriptFile,
  verify,
  sanatize,
  formatDotEnv,
  formatJson,
  format,
}
