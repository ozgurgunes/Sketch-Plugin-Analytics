import analytics from '../index'
import fs from '@skpm/fs'
import { setSettingForKey } from 'sketch/settings'
import sinon from 'sinon'

beforeEach(() => {
  sinon.stub(fs, 'readFileSync')
})
afterEach(() => {
  sinon.restore()
})

test('Should warn if tracking ID is not defined.', () => {
  sinon.stub(console, 'warn')
  analytics('', '', '', { debug: true })
  expect(
    console.warn.calledWith('Tracking ID is invalid or not set. Aborting hit.')
  ).toBe(true)
})

test('Should warn if tracking ID is invalid.', () => {
  sinon.stub(console, 'warn')
  analytics('', '', 'Invalid', { debug: true })
  expect(
    console.warn.calledWith('Tracking ID is invalid or not set. Aborting hit.')
  ).toBe(true)
})

test('Should send a request if analytics is allowed.', () => {
  setSettingForKey('analyticsAllowed', true)
  expect(analytics('', '', 'UA-123456-1', { debug: true }).data).toMatch(
    '"valid": true'
  )
  expect(analytics('', '', 'UA-1234-5', { debug: true }).data).toMatch(
    '"messageCode": "VALUE_INVALID"'
  )
  expect(analytics('', '', 'UA-1234-5', { debug: true }).data).toMatch(
    '"parameter": "tid"'
  )
})

test('Should use JSON config.', () => {
  let json = {
    trackingID: 'UA-123456-1',
    eventCategory: 'JSON-Category',
    eventAction: 'JSON-Action'
  }
  fs.readFileSync.returns(JSON.stringify(json))
  expect(analytics('', '', '', { debug: true }).data).toMatch('"valid": true')
  sinon.restore()
})

test('Should run JSON functions.', () => {
  let json = {
    trackingID: 'UA-123456-1',
    eventCategory: 'context.command.name()',
    eventAction: 'MSApplicationMetadata.metadata().appVersion'
  }
  fs.readFileSync.returns(JSON.stringify(json))
  let response = analytics('', '', '', { debug: true })
  expect(response.data).toMatch(`ec=${context.command.name()}`)
  expect(response.data).toMatch(
    `ea=${MSApplicationMetadata.metadata().appVersion}`
  )
  sinon.restore()
})

test('Should use options over JSON.', () => {
  let json = {
    trackingID: 'UA-123456-1',
    eventCategory: 'JSON-Category',
    eventAction: 'JSON-Action'
  }
  fs.readFileSync.returns(JSON.stringify(json))
  let options = {
    eventCategory: 'Options-Category',
    eventAction: 'Options-Action',
    debug: true
  }
  let response = analytics('', '', '', options)
  expect(response.data).toMatch('"valid": true')
  expect(response.data).toMatch('ec=Options-Category')
  expect(response.data).toMatch('ea=Options-Action')
  sinon.restore()
})

test('Should use params over options.', () => {
  let options = {
    trackingID: 'invalid',
    eventLabel: 'Options-Label',
    eventValue: 0,
    debug: true
  }
  let response = analytics('Param-Label', 1, 'UA-123456-1', options)
  expect(response.data).toMatch('"valid": true')
  expect(response.data).toMatch('el=Param-Label')
  expect(response.data).toMatch('ev=1')
})

let UUID

test('Should create a UUID if not exist.', () => {
  NSUserDefaults.standardUserDefaults().removeObjectForKey(
    'google.analytics.uuid'
  )
  let response = analytics('', '', 'UA-123456-1', { debug: true })
  UUID = response.url
    .absoluteString()
    .split('cid=')[1]
    .split('&')[0]
  expect(UUID).toHaveLength(36)
})

test('Should use existing UUID.', () => {
  let response = analytics('', '', 'UA-123456-1', { debug: true })
  let newUUID = response.url
    .absoluteString()
    .split('cid=')[1]
    .split('&')[0]
  expect(newUUID).toBe(UUID)
})

test('Should show a dialog if analytics is not allowed.', () => {
  setSettingForKey('analyticsAllowed', undefined)
  expect(analytics('', '', 'UA-1234-5', { debug: true })).toBeInstanceOf(
    NSAlert
  )
})
