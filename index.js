import { settingForKey, setSettingForKey } from 'sketch/settings'

/**
 * Options to pass to the function.
 *
 * @typedef {Object} options
 * @property {string} [eventLabel] Specifies the event label. Default: `null`
 * @property {number} [eventValue] Specifies the event value. Must be
 *     non-negative. Default: `null`
 * @property {string} [trackingID] The measurement ID / web property ID.
 *     Default: `null`
 * @property {string} [eventAction] Specifies the event action. Default:
 *     `context.command.name()`
 * @property {string} [eventCategory] Specifies the event category. Default:
 *     `context.plugin.name()`
 * @property {string} [dataSource] Indicates the data source of the hit.
 *     Default: `'Sketch ' + MSApplicationMetadata.metadata().appVersion`
 * @property {string} [applicationName] Specifies the application name. Default:
 *     `context.plugin.name()`
 * @property {string} [applicationVersion] Specifies the application version.
 *     Default: `context.plugin.version()`
 * @property {string} [applicationID] Application identifier. Default:
 *     `context.plugin.identifier()`
 * @property {string} [dialogTitle] GDPR dialog title. Default: `'Allow Google
 *     Analytics'`
 * @property {string} [dialogMessage] GDPR dialog message. Default: `'Please
 *     allow ' + context.plugin.name() + ' plugin to use Google Analytics for
 *     tracking statistics.'`
 */

/**
 * Sends data to Google Analytics if allowed. Asks user to allow for tracking
 * statistics, if not allowed before.
 *
 * @param {string} [eventLabel] Specifies the event label. Default: `null`
 * @param {number} [eventValue] Specifies the event value. Must be non-negative.
 *     Default: `null`
 * @param {string} [trackingID] The measurement ID / web property ID. Default:
 *     `null`
 * @param {Object} [options] Options to pass. Default: `{}`
 * @module sketch-plugin-analytics
 */
export default function(eventLabel, eventValue, trackingID, options = {}) {
  let config = getConfig(eventLabel, eventValue, trackingID, options)

  if (!/(UA|YT|MO)-\d+-\d+/i.test(config.trackingID)) {
    return console.log('Tracking ID is invalid or not set. Aborting hit.')
  }

  let analyticsAllowed = settingForKey('analyticsAllowed') || false

  if (analyticsAllowed != true) {
    let dialog = NSAlert.alloc().init()
    if (context.plugin.alertIcon()) {
      dialog.icon = context.plugin.alertIcon()
    }
    dialog.setMessageText(config.dialogTitle)
    dialog.setInformativeText(config.dialogMessage)
    dialog.addButtonWithTitle('Allow')
    dialog.addButtonWithTitle('Disallow')
    let response = dialog.runModal()
    if (response == 1000) {
      analyticsAllowed = true
      setSettingForKey('analyticsAllowed', analyticsAllowed)
    }
  }

  if (analyticsAllowed) {
    let uuidKey = 'google.analytics.uuid'
    let uuid = NSUserDefaults.standardUserDefaults().objectForKey(uuidKey)
    if (!uuid) {
      uuid = NSUUID.UUID().UUIDString()
      NSUserDefaults.standardUserDefaults().setObject_forKey(uuid, uuidKey)
      NSUserDefaults.standardUserDefaults().synchronize()
    }

    let payload = {
      v: 1,
      cid: uuid,
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
    sendData(payload)
  }
}

function getConfig(eventLabel, eventValue, trackingID, options) {
  let json = {}
  try {
    json = JSON.parse(
      NSString.stringWithContentsOfFile_encoding_error(
        context.plugin.urlForResourceNamed('analytics.json').path(),
        NSUTF8StringEncoding,
        nil
      )
    )
  } catch (error) {
    console.log(error)
  }

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
        ' plugin to use Google Analytics for tracking statistics.'
  }
}

function sendData(payload) {
  try {
    let url = NSURL.URLWithString(
      NSString.stringWithFormat(
        'https://www.google-analytics.com/collect%@',
        jsonToQueryString(payload)
      )
    )
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
