/* FluxStore.js
 * Basic Flux store
 * Dependencies: events module
 * Author: Joshua Carter
 * Created: February 25, 2017
 */
"use strict";
//include modules
import Events from 'events';
//create class for our store
var FluxStore = class extends Events.EventEmitter {
    constructor (Dispatch) {
        //call EventEmitter constructor
        super();
        //save event to server as our change event
        this._CHANGE_EVENT = 'change';
        //store services
        this._Dispatch = Dispatch;
        //register dispatch
        this._RegisterDispatch();
        //init flux actions
        this.fluxActions = {};
    }
    
    _RegisterDispatch () {
        //if we don't have a dispatch
        if (!this._Dispatch) {
            //then don't do anything
            return;
        }
        //register our callback
        this._Dispatch.register(action => {
            //if we can handle this type of action AND
            //this flux store is supposed to be receiving it
            if (
                action.params && action.type in this.fluxActions && 
                (!("_id" in this) || !("id" in action) || action.id == this._id)
            ) {
                //call the handler for this action
                this[this.fluxActions[action.type]](...action.params);
            }
        });
    }
    
    //triggers change event on our app
    emitChange () {
        this.emit(this._CHANGE_EVENT);
    }
    
    //used to add listeners for our change event
    addChangeListener (callback) {
        this.on(this._CHANGE_EVENT, callback);
    }
    
    //used to cleanup listeners on our change event
    removeChangeListener (callback) {
        this.removeListener(this._CHANGE_EVENT, callback);
    }
};
//export FluxStore
export { FluxStore };
