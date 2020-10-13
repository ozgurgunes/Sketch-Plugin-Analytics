import { settingForKey, setSettingForKey } from 'sketch/settings'

export default function(eventLabel, eventValue, trackingId) {
  let analyticsAllowed = settingForKey('analyticsAllowed') || false

  if (analyticsAllowed != true) {
    let dialog = NSAlert.alloc().init()
    if (context.plugin.alertIcon()) {
      dialog.icon = context.plugin.alertIcon()
    }
    dialog.setMessageText('Allow Google Analytics')
    dialog.setInformativeText(
      'Please allow ' +
        context.plugin.name() +
        ' ' +
        'plugin to use Google Analytics for tracking statistics.'
    )
    dialog.addButtonWithTitle('Allow')
    dialog.addButtonWithTitle('Disallow')
    let response = dialog.runModal()
    if (response == 1000) {
      analyticsAllowed = true
      setSettingForKey('analyticsAllowed', analyticsAllowed)
    }
  }

  if (analyticsAllowed) {
    return analytics(eventLabel, eventValue, trackingId)
  }
}

function analytics(eventLabel, eventValue, trackingId) {
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
    tid: trackingId || 'UA-5738625-2',
    ds: 'Sketch ' + MSApplicationMetadata.metadata().appVersion,
    t: 'event',
    an: context.plugin.name(),
    aid: context.plugin.identifier(),
    av: context.plugin.version(),
    ec: context.plugin.name(),
    ea: context.command.name(),
    el: eventLabel || 'No Label',
    ev: eventValue || 0
  }

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
