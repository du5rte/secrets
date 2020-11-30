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

function searchSecretsFile(directory) {
  const fileLocation = path.join(directory, '.secrets')

  const exists = fs.existsSync(fileLocation)

  if (exists) {
    try {
      const file = fs.readFileSync(fileLocation, 'utf8')
      const data = parse(file)

      return data
    } catch (error) {
      throw new Error(
        `unable to parse file: "${fileLocation}", ${error ? error.message : ''}`
      )
    }
  } else {
    return {}
  }
}

function searchDotEnvFile(directory) {
  const fileLocation = path.join(directory, '.env')

  const exists = fs.existsSync(fileLocation)

  if (exists) {
    try {
      const file = fs.readFileSync(fileLocation, 'utf8')
      const data = parse(file)

      return data
    } catch (error) {
      throw new Error(
        `Unable to parse file: ${fileLocation}, ${error ? error.message : ''}`
      )
    }
  } else {
    return {}
  }
}

function searchJsonFile(directory) {
  const fileLocation = path.join(directory, '.env.json')

  const exists = fs.existsSync(fileLocation)

  if (exists) {
    try {
      const file = fs.readFileSync(fileLocation, 'utf8')
      const data = JSON.parse(file)

      return data
    } catch (error) {
      throw new Error(
        `Unable to parse file: ${fileLocation}, ${error ? error.message : ''}`
      )
    }
  } else {
    return {}
  }
}

function searchJavaScriptFile(directory) {
  const fileLocation = path.join(directory, '.env.js')

  const exists = fs.existsSync(fileLocation)

  if (exists) {
    try {
      const data = require(fileLocation)

      return data
    } catch (error) {
      throw new Error(
        `Unable to parse file: ${fileLocation}, ${error ? error.message : ''}`
      )
    }
  } else {
    return {}
  }
}

function search() {
  try {
    return module.paths.reverse().reduce((final, directory) => {
      const currentDirectory = path.dirname(directory)

      // Ignore `.env` files inside node_modules folders
      if (/node_modules/.test(currentDirectory)) {
        return final
      }

      return Object.assign(
        {},
        final,
        searchSecretsFile(currentDirectory),
        searchDotEnvFile(currentDirectory),
        searchJsonFile(currentDirectory),
        searchJavaScriptFile(currentDirectory)
      )
    }, {})
  } catch (error) {
    throw error
  }
}

// function verify(secrets) {
//   secrets.reduce()
//   keys.forEach((key) => {
//     if (!process.env[key]) {
//       throw new Error(`Missing secret: "${key}"`)
//     }
//   })
// }

function indent(str) {
  return str
    .split('\n')
    .map((str) => `  ${str}`)
    .join('\n')
}

const INVALID = 'INVALID'

function sanatize(secrets) {
  return Object.keys(secrets).reduce((final, key) => {
    const valid = typeof secrets[key] === 'string' && secrets[key].length > 0

    return {
      ...final,
      [key]: !valid ? INVALID : '***',
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

  const formated = formatDotEnv(sanatized)

  if (invalid) {
    throw new Error(`Invalid secret(s):\n${indent(formated)}`)
  }

  console.log(`Verified secret(s):\n${indent(formated)}`)
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
  searchSecretsFile,
  searchDotEnvFile,
  searchJsonFile,
  searchJavaScriptFile,
  verify,
  sanatize,
  formatDotEnv,
  formatJson,
  format,
}
