/* index.js
 * Loads the jcscript library
 * Dependencies: JCObject, JCFluxStore classes
 * Author: Joshua Carter
 * Created: November 6, 2016
 */
"use strict";
//include modules

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientService = exports.JCFluxStore = exports.JCObject = undefined;

var _JCObject = require('./JCObject.js');

var _JCFluxStore = require('./JCFluxStore.js');

var _ClientService = require('./ClientService.js');

//export modules
exports.JCObject = _JCObject.JCObject;
exports.JCFluxStore = _JCFluxStore.JCFluxStore;
exports.ClientService = _ClientService.ClientService;