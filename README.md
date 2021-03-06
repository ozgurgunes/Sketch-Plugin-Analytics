# Sketch Plugin Analytics

Google Analytics module for Sketch plugins. Asks user to allow for tracking statistics, if not allowed before. Sends event hit type with event label and value. 

Tracking ID and options can be set in a `JSON` file in plugin's `Resources` folder and overridden by passing params to function.

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
analytics(null, null, 'UA-123456-1', { eventCategory: 'Category Override' })

// or;
analytics(null, null, null, {
  eventLabel: 'Event Label Override',
  trackingID: 'UA-123456-1'
})

// even;
analytics('This will be used', null, null, {
  eventLabel: 'This will not be used!'
})
```

## Configuration

It looks for an `analytics.json` file in the `Resources` folder of the plugin. All settings can be overridden by passing parameters.

Settings which ends with `()` or includes `().` will be evaluated.

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
  "dialogTitle": "Allow Google Analytics",
  "dialogMessage": "Please allow My Sketch Plugin to use Google Analytics for tracking statistics."
}
```

## Modules

* [sketch-plugin-analytics](#module_sketch-plugin-analytics)

## Typedefs

* [options](#options) : <code>Object</code>

<a name="module_sketch-plugin-analytics"></a>

## sketch-plugin-analytics
Sends data to Google Analytics if allowed. Asks user to allow for tracking
statistics, if not allowed before.


| Param | Type | Description |
| --- | --- | --- |
| [eventLabel] | <code>string</code> | Specifies the event label. |
| [eventValue] | <code>number</code> | Specifies the event value. Must be non-negative. |
| [trackingID] | <code>string</code> | The measurement ID / web property ID. Default: |
| [options] | <code>Object</code> | Options to pass. Default is `{}` |

<a name="options"></a>

## options : <code>Object</code>
Options to pass to the function.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [eventLabel] | <code>string</code> | Specifies the event label. |
| [eventValue] | <code>number</code> | Specifies the event value. Must be non-negative. |
| [trackingID] | <code>string</code> | The measurement ID / web property ID. |
| [eventAction] | <code>string</code> | Specifies the event action. Default is `context.command.name()` |
| [eventCategory] | <code>string</code> | Specifies the event category. Default is `context.plugin.name()` |
| [dataSource] | <code>string</code> | Indicates the data source of the hit. Default is `'Sketch ' + MSApplicationMetadata.metadata().appVersion` |
| [applicationName] | <code>string</code> | Specifies the application name. Default is `context.plugin.name()` |
| [applicationVersion] | <code>string</code> | Specifies the application version. Default is `context.plugin.version()` |
| [applicationID] | <code>string</code> | Application identifier. Default is `context.plugin.identifier()` |
| [dialogTitle] | <code>string</code> | GDPR dialog title. Default is `'Allow Google Analytics'` |
| [dialogMessage] | <code>string</code> | GDPR dialog message. Default is `'Please allow ' + context.plugin.name() + ' plugin send statistics and data to help improve its functionality. Data is collected anonymously and cannot be used to identify you.'` |
