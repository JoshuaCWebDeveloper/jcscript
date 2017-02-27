/* index.js
 * Loads the jcscript library
 * Dependencies: JCObject, JCFluxStore classes
 * Author: Joshua Carter
 * Created: November 6, 2016
 */
"use strict";
//include modules
import { JCObject } from './JCObject.js';
import { JCFluxStore } from './JCFluxStore.js';
import { ClientService } from './ClientService.js';
import { FluxStore } from './FluxStore.js';
var JCFlux = {
    FluxStore: FluxStore
};
//export modules
export { JCObject, JCFluxStore, ClientService, JCFlux };
