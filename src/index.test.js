import secrets from '.'

describe('import', () => {
  test('process.env', () => {
    expect(process.env).toHaveProperty('NODE_ENV')
  })
})

describe('get/set', () => {
  test('get process.env', () => {
    // jest overwrites this value with `test`
    expect(process.env.NODE_ENV).toEqual('development')
  })

  test('set process.env', () => {
    process.env['NEW_SECRET'] = 'SECRET'

    expect(process.env.NEW_SECRET).toEqual('SECRET')
  })
})

describe('.env', () => {
  // regex caoture tests
  test('key value', () => {
    expect(process.env).toHaveProperty('BASIC', 'basic')
  })

  test('after skipped line', () => {
    expect(process.env).toHaveProperty('AFTER_LINE', 'after_line')
  })

  test('no empty key', () => {
    expect(process.env).not.toHaveProperty('EMPTY')
  })

  test('no comments', () => {
    expect(process.env).not.toHaveProperty('COMMENTS')
  })

  test('single quotes', () => {
    expect(process.env).toHaveProperty('SINGLE_QUOTES', 'single_quotes')
  })

  test('double quotes', () => {
    expect(process.env).toHaveProperty('DOUBLE_QUOTES', 'double_quotes')
  })

  test('spaced out', () => {
    expect(process.env).toHaveProperty('SPACED_OUT', 'spaced_out')
  })

  test('super spaced out', () => {
    expect(process.env).toHaveProperty('SUPER_SPACED_OUT', 'super_spaced_out')
  })

  test('tabbed out', () => {
    expect(process.env).toHaveProperty('TABBED_OUT', 'tabbed_out')
  })

  test('dashes', () => {
    expect(process.env).toHaveProperty('DASHES', 'http://google.com/')
  })

  test('equal sign', () => {
    // Retain Inner Quotes
    expect(process.env).toHaveProperty('EQUAL_SIGNS', 'equals==')
  })

  test('include spaces', () => {
    // Retain Inner Quotes
    expect(process.env).toHaveProperty(
      'INCLUDE_SPACES',
      'some spaced out string'
    )
  })

  test('include spaces quoted', () => {
    // Retain Inner Quotes
    expect(process.env).toHaveProperty(
      'INCLUDE_SPACES_QUOTED',
      'some spaced out string'
    )
  })

  test('username', () => {
    // Retain Inner Quotes
    expect(process.env).toHaveProperty(
      'USERNAME',
      'therealnerdybeast@example.tld'
    )
  })

  test('json', () => {
    // Retain Inner Quotes
    expect(process.env).toHaveProperty('JSON', '{"foo": "bar"}')
  })

  test('quoted json', () => {
    // Retain Inner Quotes
    expect(process.env).toHaveProperty('JSON_QUOTED', '{"foo": "bar"}')
  })
})

describe('.secrets', () => {
  test('value key', () => {
    expect(process.env).toHaveProperty('SECRETS_BASIC', 'secrets_basic')
  })
})

describe('.env.json', () => {
  test('value key', () => {
    expect(process.env).toHaveProperty('JSON_BASIC', 'json_basic')
  })
})

describe('.env.js', () => {
  test('value key', () => {
    expect(process.env).toHaveProperty('JS_BASIC', 'js_basic')
  })
})

describe('verify', () => {
  test('sucess', () => {
    expect(secrets.verify('NODE_ENV', 'BASIC')).toBeUndefined()
  })
  test('fail', () => {
    expect(() => secrets.verify('NO_EXISTING_SECRET')).toThrowError(
      /NO_EXISTING_SECRET/
    )
  })
})

const example = { A: 'A', B: 'B', C: 'C' }

describe('format', () => {
  test('dotenv', () => {
    expect(secrets.format(example)).toEqual('A=A\nB=B\nC=C')
  })
  test('json', () => {
    expect(secrets.format(example, 'json')).toEqual(
      JSON.stringify(example, null, 2)
    )
  })
})
