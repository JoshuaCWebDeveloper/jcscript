/* FluxStore.js
 * Basic Flux store
 * Dependencies: flux module
 * Author: Joshua Carter
 * Created: February 25, 2017
 */
"use strict";
//include modules
import Flux from 'flux';
import { Store } from 'flux/utils';
//create default dispatcher
var defaultDispatch = new Flux.Dispatcher();
//create class for our store
var FluxStore = class extends Store {
    constructor (Dispatch) {
        //determine disaptch to use
        var dispatcher = Dispatch || defaultDispatch;
        //call FluxStore constructor (pass dispatcher)
        super(dispatcher);
        //save dispatcher
        this.__Dispatch = dispatcher;
        //init flux actions
        this.fluxActions = {};
        //track tokens used for removing listener
        this.listenerTokens = [];
    }
    
    //override FluxStore.__onDispatch, this method will be registered with the dispatcher
    __onDispatch (action) {
        //if we can handle this type of action AND
        //this flux store is supposed to be receiving it
        if (
            action.params && action.type in this.fluxActions && 
            (!("_id" in this) || !("id" in action) || action.id == this._id)
        ) {
            //call the handler for this action
            this[this.fluxActions[action.type]](...action.params);
        }
    }
    
    //to be used instead of FluxStore.__emitChange()
    emitChange () {
        this.__emitter.emit(this.__changeEvent);
    }
    
    //used to add listeners for our change event
    addChangeListener (callback) {
        //save token
        this.listenerTokens.push(this.addListener(callback));
    }
    
    //used to cleanup listeners on our change event
    removeChangeListener (callback) {
        //loop tokens
        for (let i=0; i<this.listenerTokens.length; i++) {
            //if this token is for our given callback
            if (this.listenerTokens[i].listener === callback) {
                //remove it
                this.listenerTokens[i].remove();
                //stop searching
                break;
            }
        }
    }
    
    //disables store, and removes registered listeners and actions
    destroy () {
        //first, remove the dispatch listener
        this.__Dispatch.unregister(this._dispatchToken);
        //next, remove all of our flux actions
        this.fluxActions = null;
        //now, loop through and remove each change listener
        for (let i=0; i<this.listenerTokens.length; i++) {
            this.listenerTokens[i].remove();
        }
        //finally, remove our listener tokens
        this.listenerTokens = null;
    }
    
};
//export FluxStore
export { FluxStore };
