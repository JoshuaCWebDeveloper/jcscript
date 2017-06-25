/* JCObject.js
 * Represents a basic object class with a getter and setter
 * Dependencies: extend module
 * Author: Joshua Carter
 * Created: July 1, 2016
 */
"use strict";
//include modules
import extend from 'extend';
//create class to represent a basic object
var JCObject = class {
        // - model (obj) An object of property names and default values 
        //               to use to create the object
        constructor (model) {
            //save copy of model (include undefined values in copy)
            this.__model = {};
            for (let prop in model) {
                this.__model[prop] = model[prop];
            }
            //if id isn't in model
            if (!("id" in this.__model)) {
                //add it (default value 0)
                this.__model.id = 0;
            }
            //create props 
            //(given default id will overwrite above default)
            for (let prop in this.__model) {
                let val = this.__model[prop];
                //if this prop doesn't have a private name
                if (prop.indexOf("_") != 0) {
                    //make it so
                    prop = this.__convertProp(prop);
                }
                //init property
                this[prop] = val;
            }
            //internal id of the object
            this._id = Math.floor(Math.random() * 1000000);
        }
        
        //converts a property's name to a property in this object
        __convertProp (prop) {
            return "_" + prop;
        }
        
        //parses property spec agument
        __parsePropSpec (propArgs) {
            //init list of props
            var props = [];
            //if we received no arguments
            if (!propArgs.length) {
                //then use all props
                props = Object.keys(this.__model);
            }
            //else, if we received a prop name
            else if (typeof propArgs[0] == "string") {
                //we will reset this single prop
                props.push(propArgs[0]);
            }
            //else, if we received an array
            else if (Array.isArray(propArgs[0])) {
                //we must have received multiple props
                props = propArgs[0];
             }
            else {
                //else, we have a problem
                throw new Error(`JCObject prop spec expects a string, array, or nothing, ${typeof prop} given.`);
            }
            //return parsed props
            return props;
        }
        
        
        //GETTERS
        // gets a property value
        // - propSpec (str, array -- optional) The name(s) of the property(ies) to get (defaults to all properties)
        // - returns (all) The property value, or an object of all properties requested
        get () {
            var props = this.__parsePropSpec(arguments),
                collection = {};
            //loop props
            for (let i=0; i<props.length; i++) {
                let val;
                //if this property is NOT in the model
                if (!(props[i] in this.__model)) {
                    //then there is nothing to get
                    continue;
                }   //else, this is a valid prop
                //get prop value
                val = this[this.__convertProp(props[i])];
                //if value is object
                if (typeof val == "object") {
                    //then we need to copy it, if it is an array
                    if (Array.isArray(val)) {
                        //slice it
                        val = val.slice();
                    }
                    else {
                        //else it is an object (or null), extend it
                        val = extend({}, val);
                    }
                }
                //add prop to collection
                collection[props[i]] = val;
            }
            //if there are no values
            if (!Object.keys(collection).length) {
                //there was nothing to get
                return;
            }
            //if there was only one prop
            if (props.length == 1) {
                //return the single value
                return collection[props[0]];
            }  
            //else, return collection     
            return collection;
        }
        
        //SETTERS
        // updates with new data
        // - data (obj, string) A collection of properties and new values to 
        //                      update OR the name of a single property to update  
        // - val (string -- optional) If data is string (single prop), the 
        //                            value to update it to
        // returns (obj) This
        update (data, val) {
            //if we received a single prop and value
            if (typeof data == "string") {
                //if this property is NOT in the model
                if (!(data in this.__model)) {
                    //then don't attempt to create it
                    return this;
                }   //else, this is a valid prop
                //update the single prop
                this[this.__convertProp(data)] = val;
            }
            //if we received data
            else if (typeof data == "object" && data !== null) {
                //loop the data
                for (var prop in data) {
                    //if this prop is in our model
                    if (prop in this.__model) {
                        //update this prop
                        this[this.__convertProp(prop)] = data[prop];
                    }
                }
            }
            return this;
        }
        
        // resets all properties to default values (or only specific properties if specified)
        // - propSpec (str, array -- optional) The name(s) of the property(ies) to reset (defaults to all properties)
        // - returns (obj) This
        reset () {
            var toReset = this.__parsePropSpec(arguments);
            //loop props that we are to reset
            for (let i=0; i<toReset.length; i++) {
                //if this prop was in our model
                if (toReset[i] in this.__model) {
                    //reset it
                    this.update(toReset[i], this.__model[toReset[i]]);
                }
            }
            //return this
            return this;
        }
    };
//export JCObject class
export { JCObject };
