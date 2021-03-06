import analytics from '../index'
import fs from '@skpm/fs'
import { setSettingForKey } from 'sketch/settings'
import sinon from 'sinon'

beforeEach(() => {
  context.debug = true
  sinon.stub(fs, 'readFileSync')
})
afterEach(() => {
  sinon.restore()
  context.debug = undefined
})

test('Should warn if tracking ID is not defined.', () => {
  sinon.stub(console, 'warn')
  analytics()
  expect(
    console.warn.calledWith('Tracking ID is invalid or not set. Aborting hit.')
  ).toBe(true)
})

test('Should warn if tracking ID is invalid.', () => {
  sinon.stub(console, 'warn')
  analytics('', '', 'Invalid')
  expect(
    console.warn.calledWith('Tracking ID is invalid or not set. Aborting hit.')
  ).toBe(true)
})

test('Should send a request if analytics is allowed.', () => {
  setSettingForKey('analyticsEnabled', true)
  expect(analytics('', '', 'UA-123456-1').data).toMatch(
    '"valid": true'
  )
  expect(analytics('', '', 'UA-1234-5').data).toMatch(
    '"messageCode": "VALUE_INVALID"'
  )
  expect(analytics('', '', 'UA-1234-5').data).toMatch(
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
  expect(analytics('', '', '').data).toMatch('"valid": true')
  sinon.restore()
})

test('Should run JSON functions.', () => {
  let json = {
    trackingID: 'UA-123456-1',
    eventCategory: 'context.command.name()',
    eventAction: 'BCSketchInfo.shared().metadata().appVersion'
  }
  fs.readFileSync.returns(JSON.stringify(json))
  let response = analytics('', '', '')
  expect(response.data).toMatch(`ec=${context.command.name()}`)
  expect(response.data).toMatch(
    `ea=${BCSketchInfo.shared().metadata().appVersion}`
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
    eventAction: 'Options-Action'
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
    eventValue: 0
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
  let response = analytics('', '', 'UA-123456-1')
  UUID = response.url
    .absoluteString()
    .split('cid=')[1]
    .split('&')[0]
  expect(UUID).toHaveLength(36)
})

test('Should use existing UUID.', () => {
  let response = analytics('', '', 'UA-123456-1')
  let newUUID = response.url
    .absoluteString()
    .split('cid=')[1]
    .split('&')[0]
  expect(newUUID).toBe(UUID)
})

test('Should show a dialog if analytics is not allowed.', () => {
  setSettingForKey('analyticsEnabled', undefined)
  expect(analytics('', '', 'UA-123456-1')).toBeInstanceOf(
    NSAlert
  )
})

test('Should send a request if user clicked allow.', () => {
  context.debug = 1000
  let response = analytics('Param-Label', 1, 'UA-123456-1')
  expect(response.data).toMatch('"valid": true')
})

test('Should not send request if user clicked disallow.', () => {
  context.debug = 1001
  setSettingForKey('analyticsEnabled', undefined)
  let response = analytics('Param-Label', 1, 'UA-123456-1')
  expect(response).toBe(undefined)
})
