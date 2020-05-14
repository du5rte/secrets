/* eslint-disable prettier/prettier */

import { transformAsync } from '@babel/core'

import plugin from './'

const options = {
  plugins: [plugin],
  configFile: false,
  babelrc: false,
}

test('name=babel-plugin-secrets', () => {
  expect(plugin({ types: {} }).name).toStrictEqual('babel-plugin-secrets')
})

test('.env', async () => {
  expect(await transformAsync('process.env.BASIC', options)).toHaveProperty(
    'code',
    'process.env.BASIC || "basic";'
  )
})

test('.env.json', async () => {
  expect(
    await transformAsync('process.env.JSON_BASIC', options)
  ).toHaveProperty('code', 'process.env.JSON_BASIC || "json_basic";')
})

test('.env.js', async () => {
  expect(await transformAsync('process.env.JS_BASIC', options)).toHaveProperty(
    'code',
    'process.env.JS_BASIC || "js_basic";'
  )
})
