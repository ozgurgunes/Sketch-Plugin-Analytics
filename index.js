import { settingForKey, setSettingForKey } from 'sketch/settings'

try {
  var path = context.plugin.urlForResourceNamed('analytics.json').path()
  var json = JSON.parse(
    NSString.stringWithContentsOfFile_encoding_error(
      path,
      NSUTF8StringEncoding,
      nil
    )
  )
} catch (error) {
  console.log(error)
}
if (!json) {
  json = {}
}

var allowDialogTitle = json.allowDialogTitle || 'Allow Google Analytics'
var allowDialogMessage =
  json.allowDialogMessage ||
  'Please allow ' +
    context.plugin.name() +
    ' plugin to use Google Analytics for tracking statistics.'

/**
 * @description Sends data to Google Analytics if allowed. Asks user to allow
 *              for tracking statistics, if not allowed before.
 *
 * @module Module
 * @param {string} [eventLabel] Specifies the event label.
 * @param {number} [eventValue] Specifies the event value. Must be non-negative.
 * @param {string} [trackingID] The measurement ID / web property ID
 * @param {Object} [options] Options to be passed to the module.
 * @param {string} [options.eventAction] Specifies the event action. Default is
 *                                       the running command name of the
 *                                       plugin.
 * @param {string} [options.eventCategory] Specifies the event category. Default
 *                                         is the name of the plugin.
 * @param {string} [options.dataSource] Indicates the data source of the hit.
 *                                      Default is Sketch version.
 * @param {string} [options.applicationName] Specifies the application name.
 *                                           Default is the name of the plugin.
 * @param {string} [options.applicationVersion] Specifies the application
 *                                              version. Default is the version
 *                                              of the plugin.
 * @param {string} [options.applicationID] Application identifier. Default is
 *                                         the identifier of the plugin.
 */
export default function(eventLabel, eventValue, trackingID, options = {}) {
  let analyticsAllowed = settingForKey('analyticsAllowed') || false

  if (analyticsAllowed != true) {
    let dialog = NSAlert.alloc().init()
    if (context.plugin.alertIcon()) {
      dialog.icon = context.plugin.alertIcon()
    }
    dialog.setMessageText(allowDialogTitle)
    dialog.setInformativeText(allowDialogMessage)
    dialog.addButtonWithTitle('Allow')
    dialog.addButtonWithTitle('Disallow')
    let response = dialog.runModal()
    if (response == 1000) {
      analyticsAllowed = true
      setSettingForKey('analyticsAllowed', analyticsAllowed)
    }
  }

  if (analyticsAllowed) {
    return analytics(eventLabel, eventValue, trackingID, options)
  }
}

function analytics(eventLabel, eventValue, trackingID, options = {}) {
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
    tid: trackingID
      ? trackingID
      : options.trackingID
      ? options.trackingID
      : json.trackingID
      ? json.trackingID
      : 'UA-5738625-2',
    ds: options.dataSource
      ? options.dataSource
      : json.dataSource
      ? json.dataSource
      : 'Sketch ' + MSApplicationMetadata.metadata().appVersion,
    an: options.applicationName
      ? options.applicationName
      : json.applicationName
      ? json.applicationName
      : context.plugin.name(),
    aid: options.applicationID
      ? options.applicationID
      : json.applicationID
      ? json.applicationID
      : context.plugin.identifier(),
    av: options.applicationVersion
      ? options.applicationVersion
      : json.applicationVersion
      ? json.applicationVersion
      : context.plugin.version(),
    ec: options.eventCategory
      ? options.eventCategory
      : json.eventCategory
      ? json.eventCategory
      : context.plugin.name(),
    ea: options.eventAction
      ? options.eventAction
      : json.eventAction
      ? json.eventAction
      : context.command.name()
  }
  let el = eventLabel || options.eventLabel || json.eventLabel
  let ev = eventValue || options.eventValue || json.eventValue
  if (el) {
    payload.el = el
  }
  if (ev) {
    payload.ev = ev
  }

  console.log(payload)

  let url = NSURL.URLWithString(
    NSString.stringWithFormat(
      'https://www.google-analytics.com/collect%@',
      jsonToQueryString(payload)
    )
  )

  if (url) {
    NSURLSession.sharedSession()
      .dataTaskWithURL(url)
      .resume()
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
