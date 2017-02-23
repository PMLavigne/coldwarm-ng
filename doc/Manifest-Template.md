# CSXS Manifest Template

## Overview
The CSXS manifest template file `src/CSXS/manifest.xml.hbs` allows the
`manifest.xml` file to be generated using configuration and info from the 
`package.json` file. It pulls in a few basic things from the normal
`package.json` stuff (like version) and then looks for the custom field
`csxsManifest` for the rest. 

## Example `package.json`

Here's a `package.json` that shows all available options:
```json
{
  "name": "coldwarm-ng",
  "version": "0.0.1",
  "description": "HTML5 implementation of coldwarm photoshop plugin",
  "author": "Patrick Lavigne <me@patrick.codes> (https://github.com/PMLavigne)",
  "license": "UNLICENSED",
  "private": true,
  "csxsManifest": {
    "displayName": "Coldwarm NG",
    "bundleId": "codes.patrick.coldwarm-ng",
    "runtime": {
      "name": "CSXS",
      "version": "6.0"
    },
    "hosts": {
      "PHSP": "14",
      "PHXS": "14"
    },
    "extensions": {
      "picker": {
        "resources": {
          "script": "./js/app.js",
          "main": "./index.html"
        },
        "ui": {
          "type": "Panel",
          "menu": "ColdWarm NG",
          "geometry": {
            "size": {
              "width": 400,
              "height": 400
            },
            "max": {
              "width": 500,
              "height": 500
            },
            "min": {
              "width": 300,
              "height": 300
            },
            "screenPercentage": {
              "width": 25,
              "height": 25
            }
          },
          "icons": {
            "Normal": "./img/icon.png",
            "Disabled": "./img/icon.png",
            "RollOver": "./img/icon.png",
            "DarkNormal": "./img/icon.png",
            "DarkRollOver": "./img/icon.png"
          }
        }

      }
    }
  }
}

```
