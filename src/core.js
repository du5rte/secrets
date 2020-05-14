const fs = require('fs')
const path = require('path')

function splitKeyValuePair(str) {
  const keyValuePairRegex = /^(\w+)\s*=\s*(.+)$/i
  return str.match(keyValuePairRegex)
}

function splitIntoLines(str) {
  const regexLineBreak = /\n/g

  return str.split(regexLineBreak)
}

function cleanQuotes(str) {
  const cleanupRegex = /(^['"]|['"]$)/g
  return str.replace(cleanupRegex, '').trim()
}

function parse(raw) {
  const lines = splitIntoLines(raw)

  return lines.reduce((final, line) => {
    try {
      const [, key, rawValue] = splitKeyValuePair(line)

      const value = cleanQuotes(rawValue)

      return { ...final, [key]: value }
    } catch (err) {
      return final
    }
  }, {})
}

function searchDotEnvFile(directory) {
  const fileLocation = path.join(directory, '.env')

  try {
    const file = fs.readFileSync(fileLocation, 'utf8')
    const data = parse(file)

    return data
  } catch (e) {
    return {}
  }
}

function searchJsonFile(directory) {
  const fileLocation = path.join(directory, '.env.json')

  try {
    const file = fs.readFileSync(fileLocation, 'utf8')
    const data = JSON.parse(file)

    return data
  } catch (e) {
    return {}
  }
}

function searchJavaScriptFile(directory) {
  const fileLocation = path.join(directory, '.env.js')

  try {
    const data = require(fileLocation)

    return data
  } catch (e) {
    return {}
  }
}

function readEnvs() {
  return module.paths.reverse().reduce((final, directory) => {
    const currentDirectory = path.dirname(directory)

    // Ignore `.env` files inside node_modules folders
    if (/node_modules/.test(currentDirectory)) {
      return final
    }

    return Object.assign(
      {},
      final,
      searchDotEnvFile(currentDirectory),
      searchJsonFile(currentDirectory),
      searchJavaScriptFile(currentDirectory)
    )
  }, {})
}

function cacheEnvs(obj) {
  for (const key in obj) {
    process.env[key] = obj[key]
  }
}

module.exports = {
  splitKeyValuePair,
  splitIntoLines,
  cleanQuotes,
  parse,
  searchDotEnvFile,
  searchJsonFile,
  searchJavaScriptFile,
  readEnvs,
  cacheEnvs,
}
