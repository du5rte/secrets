<p align="center"><a href="https://github.com/du5rte/secrets" target="_blank" rel="noopener noreferrer"><img width="100" src="key.svg" alt="Key"></a></p>

<p align="center"><a href="https://github.com/du5rte/secrets"><img alt="GitHub Actions Test Status" src="https://github.com/du5rte/secrets/workflows/Test/badge.svg"/></p>

# Secrets

Secret handler for Node.js 🗝️

Secret is a zero-dependency package to handle secrets in Node.js from a `.env` file into [`process.env`](https://nodejs.org/docs/latest/api/process.html#process_process_env). Inspired by [dotenv](https://github.com/motdotla/dotenv).

## Install

```bash
yarn add secrets
```

## Usage

Create a `.env` file in the root directory of your project.
It supports 3 types of `.env` files `.env.json` and `.env.js`

`.env` supports entries in the form of `NAME=VALUE`.

```sh
NODE_ENV=development
PORT=3000
SECRET=my_super_secret
```

`.env.json` supports JSON

```json
{
  "NODE_ENV": "development",
  "PORT": 3000,
  "SECRET": "my_super_secret"
}
```

`.env.js` supports JavaScript

```js
module.exports = {
  NODE_ENV: 'development',
  PORT: 3000,
  SECRET: 'my_super_secret',
}
```

That's it. As early as possible in your application, require `secrets`. `process.env` should have the keys and values you defined in your `.env` file.

```javascript
// setups entries in process.env
import 'secrets' // or require('secrets')
...

// which can be access anywhere in your code
app.listen(process.env.PORT, function () {
  console.log('Server running on localhost:' + process.env.PORT)
})
```

Verify environment variables are loaded in `process.env`

```javascript
secret.verify('PORT', 'SECRET') // throw error if it's missing
```

## Babel Plugin

```
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['secrets/babel-plugin-secrets'],
}
```

## Github Action
To create secret `.env` environment files on demands on your github actions checkout [du5rte/create-secret-file](https://github.com/du5rte/create-secret-file)

## Location

Secrets should be place in the root of the project but it searches for `.env` files the same way node searches for `node_modules` folders, the closer to the root the higher the priority.

```
/Users/user/myProjects/myAwesomeProject/.env
/Users/user/myProjects/.env
/Users/user/.env
/Users/.env
```

### Rules

The parsing engine currently supports the following rules:

- `BASIC=basic` becomes `{BASIC: 'basic'}`
- empty lines are skipped
- lines beginning with `#` are treated as comments
- empty values become empty strings (`EMPTY=` becomes `{EMPTY: ''}`)
- single and double quoted values are escaped (`SINGLE_QUOTE='quoted'` becomes `{SINGLE_QUOTE: "quoted"}`)
- new lines are expanded if in double quotes (`MULTILINE="new\nline"` becomes

```
{MULTILINE: 'new
line'}
```

- inner quotes are maintained (think JSON) (`JSON={"foo": "bar"}` becomes `{JSON:"{\"foo\": \"bar\"}"`)

## FAQ

### Should I commit my secrets files?

**No! 🙅‍♂️, do not commit your `.env` files!** Adding a `.gitignore` file to your repository should be your first line of defense against accidentally leaking any secrets. [read more](https://dev.to/somedood/please-dont-commit-env-3o9h)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

See [LICENSE](LICENSE)
