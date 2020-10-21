import { settingForKey, setSettingForKey } from 'sketch/settings'
import fs from '@skpm/fs'

/**
 * Options to pass to the function.
 *
 * @typedef {Object} options
 * @property {string} [eventLabel] Specifies the event label.
 * @property {number} [eventValue] Specifies the event value. Must be
 *     non-negative.
 * @property {string} [trackingID] The measurement ID / web property ID.
 * @property {string} [eventAction] Specifies the event action. Default is
 *     `context.command.name()`
 * @property {string} [eventCategory] Specifies the event category. Default is
 *     `context.plugin.name()`
 * @property {string} [dataSource] Indicates the data source of the hit. Default
 *     is `'Sketch ' + MSApplicationMetadata.metadata().appVersion`
 * @property {string} [applicationName] Specifies the application name. Default
 *     is `context.plugin.name()`
 * @property {string} [applicationVersion] Specifies the application version.
 *     Default is `context.plugin.version()`
 * @property {string} [applicationID] Application identifier. Default is
 *     `context.plugin.identifier()`
 * @property {string} [dialogTitle] GDPR dialog title. Default is `'Allow Google
 *     Analytics'`
 * @property {string} [dialogMessage] GDPR dialog message. Default is `'Please
 *     allow ' + context.plugin.name() + ' plugin send statistics and data to help
 *     improve its functionality. Data is collected anonymously and cannot be
 *     used to identify you.'`
 */

/**
 * Sends data to Google Analytics if allowed. Asks user to allow for tracking
 * statistics, if not allowed before.
 *
 * @param {string} [eventLabel] Specifies the event label.
 * @param {number} [eventValue] Specifies the event value. Must be non-negative.
 * @param {string} [trackingID] The measurement ID / web property ID.
 * @param {Object} [options] Options to pass. Default is `{}`
 * @module sketch-plugin-analytics
 */
export default function(eventLabel, eventValue, trackingID, options = {}) {
  let config = getConfig(eventLabel, eventValue, trackingID, options)

  if (!/(UA|YT|MO)-\d+-\d+/i.test(config.trackingID)) {
    return console.warn('Tracking ID is invalid or not set. Aborting hit.')
  }

  let analyticsEnabled = settingForKey('analyticsEnabled') || false

  if (analyticsEnabled != true) {
    let dialog = NSAlert.alloc().init()
    if (context.plugin.alertIcon()) {
      dialog.icon = context.plugin.alertIcon()
    }
    dialog.setMessageText(config.dialogTitle)
    dialog.setInformativeText(config.dialogMessage)
    dialog.addButtonWithTitle('Allow')
    dialog.addButtonWithTitle('Disallow')
    if (context.debug == true) {
      return dialog
    }
    let response = context.debug ? context.debug : dialog.runModal()
    if (response == 1000) {
      analyticsEnabled = true
      setSettingForKey('analyticsEnabled', analyticsEnabled)
    }
  }

  if (analyticsEnabled) {
    let UUIDKey = 'google.analytics.uuid'
    let UUID = NSUserDefaults.standardUserDefaults().objectForKey(UUIDKey)
    if (!UUID) {
      UUID = NSUUID.UUID().UUIDString()
      NSUserDefaults.standardUserDefaults().setObject_forKey(UUID, UUIDKey)
      NSUserDefaults.standardUserDefaults().synchronize()
    }

    let payload = {
      v: 1,
      cid: UUID,
      t: 'event',
      tid: config.trackingID,
      ds: config.dataSource,
      an: config.applicationName,
      aid: config.applicationID,
      av: config.applicationVersion,
      ec: config.eventCategory,
      ea: config.eventAction
    }
    if (config.eventLabel) {
      payload.el = config.eventLabel
    }
    if (config.eventValue) {
      payload.ev = config.eventValue
    }
    return sendData(payload)
  }
}

function getConfig(eventLabel, eventValue, trackingID, options) {
  let data
  let file = context.debug
    ? { path: () => null }
    : context.plugin.urlForResourceNamed('analytics.json')
  if (file) {
    try {
      data = fs.readFileSync(file.path())
    } catch (error) {
      console.error(error)
    }
  }

  let json = data ? JSON.parse(data) : {}
  for (var key in json) {
    if (json[key].endsWith('()') || json[key].includes('().')) {
      json[key] = eval(json[key])
    }
  }

  return {
    trackingID: trackingID || options.trackingID || json.trackingID,
    dataSource:
      options.dataSource ||
      json.dataSource ||
      'Sketch ' + MSApplicationMetadata.metadata().appVersion,
    applicationName:
      options.applicationName || json.applicationName || context.plugin.name(),
    applicationID:
      options.applicationID ||
      json.applicationID ||
      context.plugin.identifier(),
    applicationVersion:
      options.applicationVersion ||
      json.applicationVersion ||
      context.plugin.version(),
    eventCategory:
      options.eventCategory || json.eventCategory || context.plugin.name(),
    eventAction:
      options.eventAction || json.eventAction || context.command.name(),
    eventLabel: eventLabel || options.eventLabel || json.eventLabel,
    eventValue: eventValue || options.eventValue || json.eventValue,
    dialogTitle:
      options.dialogTitle || json.dialogTitle || 'Allow Google Analytics',
    dialogMessage:
      options.dialogMessage ||
      json.dialogMessage ||
      'Please allow ' +
        context.plugin.name() +
        ' plugin send statistics and data to help improve its functionality.' +
        ' Data is collected anonymously and can not be used to identify you.'
  }
}

function sendData(payload) {
  try {
    let url = NSURL.URLWithString(
      NSString.stringWithFormat(
        'https://www.google-analytics.com/' +
          (context.debug ? 'debug/' : '') +
          'collect%@',
        jsonToQueryString(payload)
      )
    )
    if (context.debug) {
      var request = NSURLRequest.requestWithURL(url)
      var response = MOPointer.alloc().init()
      var error = MOPointer.alloc().init()
      var data = NSURLConnection.sendSynchronousRequest_returningResponse_error(
        request,
        response,
        error
      )
      return data
        ? {
            data: String(
              NSString.alloc().initWithData_encoding(data, NSUTF8StringEncoding)
            ),
            url: url
          }
        : error.value()
    }
    NSURLSession.sharedSession()
      .dataTaskWithURL(url)
      .resume()
  } catch (error) {
    console.log(error)
  }
}

function jsonToQueryString(json) {
  return (
    '?' +
    Object.keys(json)
      .map(key => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
      })
      .join('&')
  )
}
