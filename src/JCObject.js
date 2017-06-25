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
            var val;
            //save model
            this.__model = model;
            //default value for id
            this._id = 0;
            //create additional props 
            //(given default id will overwrite above default)
            for (let prop in model) {
                val = model[prop];
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
        
        //GETTERS
        // gets a property value
        // - prop (string, array) The name(s) of the property(ies) to get
        // - returns (all) The property value, or an object of all properties requested
        get (prop) {
            var collection;
            //if we received a prop name
            if (typeof prop == "string") {
                //return value using converted single prop
                return this[this.__convertProp(prop)];
            }   //else, we must have received multiple props
            //loop props
            collection = {};
            for (var i=0; i<prop.length; i++) {
                //add prop to collection
                collection[prop[i]] = this[this.__convertProp(prop[i])];
            }
            //return collection     
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
            var newData = {};
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
        // - prop (str, array -- optional) The name(s) of the property(ies) to reset (defaults to all properties)
        // - returns (obj) This
        reset (prop) {
            var toReset = [];
            //if we received no arguments
            if (!arguments.length) {
                //then we are resetting everything
                toReset = Object.keys(this.__model);
            }
            //else, if we received a prop name
            else if (typeof prop == "string") {
                //we will reset this single prop
                toReset.push(prop);
            }
            //else, if we received an array
            else if (Array.isArray(prop)) {
                //we must have received multiple props
                toReset = prop;
             }
            else {
                //else, we have a problem
                throw new Error(`JCObject.reset() expects a string or array, ${typeof prop} given.`);
            }
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
