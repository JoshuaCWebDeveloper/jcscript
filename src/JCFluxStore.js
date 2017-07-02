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
    
        // resets all properties to default values (or only specific properties if specified)
        // - id (int) The id of the object to reset
        // - prop (str, array -- optional) The name(s) of the property(ies) to reset (defaults to all properties)
        reset (id, prop) {
            this._Dispatcher.dispatch({
                type: this._ACTIONS.RESET,
                id: id,
                params: Array.from(arguments).slice(1)
            });
        }
    },
    //create set of constants
    ACTIONS = {
        UPDATE: "JCSTORE1",
        RESET: "JCSTORE2"
    },
    //create new dispatcher
    JCDispatch = new Flux.Dispatcher(),
    //create new actions service
    JCActions = new JCActionsService(JCDispatch, ACTIONS),
    //create mixin class to inherit from both JCObject and FluxStore
    FluxStoreJCObject = class {
        constructor (FluxStoreArgs, JCObjectArgs) {
            //call both constructors, extend this with results
            extend(this, new FluxStore(...FluxStoreArgs), new JCObject(...JCObjectArgs));
        }
    };
//populate mixin class with both JCObject and FluxStore
mixin([FluxStore, JCObject], FluxStoreJCObject.prototype, {warn: false, mergeDuplicates: false});       
//create JCFluxStore class from FluxStoreJCObject mixin
class JCFluxStore extends FluxStoreJCObject {
    
    constructor (data, defaults, Dispatch, Actions, AC) {
        //if we weren't given defaults, use data
        var defaults = defaults || data,
            //if we weren't given a Dipsatch, use JCDispatch
            Dispatcher = Dispatch || JCDispatch;
        //pass data to FluxStore
        super([Dispatcher], [defaults]);
        //mixin solution doesn't support binding this in constructor, redo dispatcher registration
        this.__Dispatch.unregister(this._dispatchToken);
        this._dispatchToken = this.__Dispatch.register((payload) => {
          this.__invokeOnDispatch(payload);
        });
        
        //store services
        this._Actions = Actions || JCActions;
        //store contants
        this._AC = AC || ACTIONS;
        //create flux actions
        this.fluxActions[this._AC.UPDATE] = "update";
        this.fluxActions[this._AC.RESET] = "reset";
        
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
    
    // accessor for JCObject.reset(), triggers change on store
    reset (prop) {
        //reset this
        this._resetData(...Array.from(arguments));
        //our store has likely changed
        this.emitChange();
    }
    
    
    //disables store, and removes registered listeners and actions
    destroy () {
        //first, remove our actions
        this._Actions = null;
        this._AC = null;
        //then, call destroy on our parent
        this._destroyStore();
    }
    
}
//child will have methods the same name as the parent
JCFluxStore.prototype._updateData = JCObject.prototype.update;
JCFluxStore.prototype._resetData = JCObject.prototype.reset;
JCFluxStore.prototype._destroyStore = FluxStore.prototype.destroy;
//export
export { JCFluxStore };
