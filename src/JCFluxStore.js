/* JCFluxStore.js
 * Represents a basic flux store modeled by a JCObject
 * Dependencies: extend, flux, es6-mixin modules, JCObject, FluxStore classes
 * Author: Joshua Carter
 * Created: November 6, 2016
 */
"use strict";
//include modules
import extend from 'extend';
import Flux from 'flux';
import mixin from 'es6-mixins';
//include classes
import { JCObject } from './JCObject.js';
import { FluxStore } from './FluxStore.js';

//create our actions class
var JCActionsService = class {
        constructor (Dispatcher, ACTIONS) {
            //create shortcut for our constants
            this._ACTIONS = ACTIONS;
            this._Dispatcher = Dispatcher;
        }
        
        // updates object with new data
        // - id (int) The id of the object to update
        // - data (obj, string) A collection of properties and new values to update OR the name of a single property to update
        // - val (string -- optional) If data is string (single prop), the value to update it to
        update (id, data, val) {
            this._Dispatcher.dispatch({
                type: this._ACTIONS.UPDATE,
                id: id,
                params: [data, val]
            });
        }
    },
    //create set of constants
    ACTIONS = {
        UPDATE: "JCSTORE1"
    },
    //create new dispatcher
    JCDispatch = new Flux.Dispatcher(),
    //create new actions service
    JCActions = new JCActionsService(JCDispatch, ACTIONS);
//inherit from both JCObject and FluxStore
mixin(FluxStore, JCObject.prototype);       
//child will have method the same name as the parent
JCObject.prototype._updateData = JCObject.prototype.update;
//create JCFluxStore class from JCObject
class JCFluxStore extends JCObject {
    
    constructor (data, defaults, Dispatch, Actions, AC) {
        //if we weren't given defaults, use data
        var defaults = defaults || data;
        //pass data to JCObject
        super(defaults);
        //call FluxStore constructor
        extend(this, new FluxStore(Dispatch), this);
        
        //store services
        this._Actions = Actions || JCActions;
        //store contants
        this._AC = AC || ACTIONS;
        //create flux actions
        this.fluxActions[this._AC.UPDATE] = "update";
        
        //update our store with the given data
        this._updateData(data);
    }
    
    
    //GETTERS
    //gets actions service
    Actions () {
        return this._Actions;
    }
    
    //SETTERS
    // accessor for JCObject.update(), triggers change on store
    update (data, val) {
        //update this
        this._updateData(data, val);
        //our store has likely changed
        this.emitChange();
    }
    
}
//export
export { JCFluxStore };
