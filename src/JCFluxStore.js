/* JCFluxStore.js
 * Represents a basic flux store modeled by a JCObject
 * Dependencies: jcscript, events, extend, flux modules
 * Author: Joshua Carter
 * Created: November 6, 2016
 */
"use strict";
//include dependencies
import { JCObject } from './JCObject.js';
import Events from 'events';
import extend from 'extend';
import Flux from 'flux';

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
//inherit from both JCObject and Events
extend(true, JCObject.prototype, Events.EventEmitter.prototype);
//child will have method the same name as the parent
JCObject.prototype._updateData = JCObject.prototype.update;
//create PlayStore class from JCObject
class JCFluxStore extends JCObject {
    
    constructor (data, defaults, Dispatch, Actions, AC) {
        //if we weren't given defaults, use data
        var defaults = defaults || data;
        //pass data to parent
        super(defaults);
        
        //store services
        this._Dispatch = Dispatch || JCDispatch;
        this._Actions = Actions || JCActions;
        //store contants
        this._AC = AC || ACTIONS;
        //register dispath
        this._RegisterDispatch();
        //save event to server as our change event
        this._CHANGE_EVENT = 'change';
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
    
    
    _RegisterDispatch () {
        //map action types to store methods
        var actions = {};
        actions[this._AC.UPDATE] = "update";
        //register our callback
        this._Dispatch.register(action => {
            //if we can handle this type of action, and it is for this play
            if (action.params && action.type in actions && action.id == this._id) {
                //call the handler for this action
                this[actions[action.type]](...action.params);
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
    
}
//export
export { JCFluxStore };

