import secrets, { NODE_ENV } from '.'

describe('import', () => {
  test('process.env', () => {
    expect(process.env).toHaveProperty('NODE_ENV')
  })

  test('import default', () => {
    expect(secrets).toHaveProperty('NODE_ENV')
  })

  test('import destructuring', () => {
    expect(NODE_ENV).toEqual(expect.any(String))
  })
})

describe('get/set', () => {
  // secrets is only a getter for `process.env`
  // so added, uodates or removed entries to `process.env`
  // should be reflected by secrets
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/get
  test('get process.env', () => {
    // jest overwrites this value with `test`
    expect(process.env.NODE_ENV).toEqual('development')
  })

  test('get secrets', () => {
    expect(NODE_ENV).toEqual('development')
  })

  test('set secrets', () => {
    secrets.NEW_SECRET = 'SECRET'

    expect(secrets.NEW_SECRET).toEqual('SECRET')
  })

  test('set process.env', () => {
    secrets.NEW_SECRET = 'SECRET'

    expect(process.env.NEW_SECRET).toEqual('SECRET')
  })
})

describe('.env', () => {
  // regex caoture tests
  test('key value', () => {
    expect(secrets).toHaveProperty('BASIC', 'basic')
  })

  test('after skipped line', () => {
    expect(secrets).toHaveProperty('AFTER_LINE', 'after_line')
  })

  test('no empty key', () => {
    expect(secrets).not.toHaveProperty('EMPTY')
  })

  test('no comments', () => {
    expect(secrets).not.toHaveProperty('COMMENTS')
  })

  test('single quotes', () => {
    expect(secrets).toHaveProperty('SINGLE_QUOTES', 'single_quotes')
  })

  test('double quotes', () => {
    expect(secrets).toHaveProperty('DOUBLE_QUOTES', 'double_quotes')
  })

  test('spaced out', () => {
    expect(secrets).toHaveProperty('SPACED_OUT', 'spaced_out')
  })

  test('super spaced out', () => {
    expect(secrets).toHaveProperty('SUPER_SPACED_OUT', 'super_spaced_out')
  })

  test('tabbed out', () => {
    expect(secrets).toHaveProperty('TABBED_OUT', 'tabbed_out')
  })

  test('dashes', () => {
    expect(secrets).toHaveProperty('DASHES', 'http://google.com/')
  })

  test('equal sign', () => {
    // Retain Inner Quotes
    expect(secrets).toHaveProperty('EQUAL_SIGNS', 'equals==')
  })

  test('include spaces', () => {
    // Retain Inner Quotes
    expect(secrets).toHaveProperty('INCLUDE_SPACES', 'some spaced out string')
  })

  test('include spaces quoted', () => {
    // Retain Inner Quotes
    expect(secrets).toHaveProperty(
      'INCLUDE_SPACES_QUOTED',
      'some spaced out string'
    )
  })

  test('username', () => {
    // Retain Inner Quotes
    expect(secrets).toHaveProperty('USERNAME', 'therealnerdybeast@example.tld')
  })

  test('json', () => {
    // Retain Inner Quotes
    expect(secrets).toHaveProperty('JSON', '{"foo": "bar"}')
  })

  test('quoted json', () => {
    // Retain Inner Quotes
    expect(secrets).toHaveProperty('JSON_QUOTED', '{"foo": "bar"}')
  })
})

describe('.env.json', () => {
  test('value key', () => {
    expect(secrets).toHaveProperty('JSON_BASIC', 'json_basic')
  })
})

describe('.env.js', () => {
  test('value key', () => {
    expect(secrets).toHaveProperty('JS_BASIC', 'js_basic')
  })
})
