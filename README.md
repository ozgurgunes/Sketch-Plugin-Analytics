# Sketch Plugin Analytics

Google Analytics module for Sketch plugins. Respects user privacy, asks for allow to tracking statistics.

## Installation

```bash
npm i @ozgurgunes/sketch-plugin-analytics
```

## Usage

```javascript
import analytics from '@ozgurgunes/sketch-plugin-analytics'

var eventLabel = 'My Event'
var eventValue = 1
var trackingId = 'UA-1234-1'

analytics(eventLabel, eventValue, trackingId)
```

### Collects:

- Hit Type: `event`
- Data Source: `Sketch Version`
- Application Name: `Plugin Name`
- Application Version: `Plugin Version`
- Application ID: `Plugin Identifier`
- Event Category: `Plugin Name`
- Event Action: `Command Name`
