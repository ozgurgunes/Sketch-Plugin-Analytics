# Sketch Plugin Analytics

Google Analytics module for Sketch plugins. Respects user privacy. Asks user to allow for tracking statistics, if not allowed before.

## Installation

```bash
npm i @ozgurgunes/sketch-plugin-analytics
```

## Usage

```javascript
import analytics from '@ozgurgunes/sketch-plugin-analytics'

var eventLabel = 'My Command Event'
var eventValue = 1
var trackingID = 'UA-123456-1'
var options = {
  eventCategory: 'My Sketch Plugin',
  eventAction: 'My Plugin Command',
  applicationName: 'My Sketch Plugin',
  applicationVersion: '1.0.0',
  applicationID: 'com.example.my-sketch-plugin',
  dataSource: 'Sketch'
}

analytics(eventLabel, eventValue, trackingID, options)

// All parameters are optional and could be set in JSON file.
// So, could be used simply like;
analytics()

// or any options in the JSON could be overridden like;
anlytics(null, null, 'UA-123456-1', { eventCategory: 'Category Override' })

// or;
anlytics(null, null, null, {
  eventLabel: 'Event Label Override',
  trackingID: 'UA-123456-1'
})

// even;
anlytics('This will be used', null, null, {
  eventLabel: 'This will not be used!'
})
```

## Configuration File

It looks for an `analytics.json` file in the `Resources` folder of the plugin. All options can be overridden by passing parameters to the module.

> ⚠️ Do not forget to pass the `trackingID` to the module or set in the JSON file. Otherwise, my ID used as default :)

### Example JSON
```json
{
  "trackingID": "UA-123456-1",
  "eventLabel": "My Command Event",
  "eventValue": 1,
  "eventCategory": "My Sketch Plugin",
  "eventAction": "My Plugin Command",
  "applicationName": "My Sketch Plugin",
  "applicationVersion": "1.0.0",
  "applicationID": "com.example.my-sketch-plugin",
  "dataSource": "Sketch",
  "allowDialogTitle": "Allow Google Analytics",
  "allowDialogMessage": "Please allow My Sketch Plugin to use Google Analytics for tracking statistics."
}
```

<a name="module_Module"></a>

## Module
Sends data to Google Analytics if allowed. Asks user to allow for tracking statistics, if not allowed before.


| Param | Type | Description |
| --- | --- | --- |
| [eventLabel] | <code>string</code> | Specifies the event label. |
| [eventValue] | <code>number</code> | Specifies the event value. Must be non-negative. |
| [trackingID] | <code>string</code> | The measurement ID / web property ID |
| [options] | <code>Object</code> | Options to be passed to the module. |
| [options.eventAction] | <code>string</code> | Specifies the event action. Default is                                       the running command name of the                                       plugin. |
| [options.eventCategory] | <code>string</code> | Specifies the event category. Default                                         is the name of the plugin. |
| [options.dataSource] | <code>string</code> | Indicates the data source of the hit.                                      Default is Sketch version. |
| [options.applicationName] | <code>string</code> | Specifies the application name.                                           Default is the name of the plugin. |
| [options.applicationVersion] | <code>string</code> | Specifies the application                                              version. Default is the version                                              of the plugin. |
| [options.applicationID] | <code>string</code> | Application identifier. Default is                                         the identifier of the plugin. |

