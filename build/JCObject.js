/* JCObject.js
 * Represents a basic object class with a getter and setter
 * Dependencies: extend module
 * Author: Joshua Carter
 * Created: July 1, 2016
 */
"use strict";
//include modules

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.JCObject = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extend = require("extend");

var _extend2 = _interopRequireDefault(_extend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//create class to represent a basic object
var JCObject = function () {
    // - model (obj) An object of property names and default values 
    //               to use to create the object
    function JCObject(model) {
        _classCallCheck(this, JCObject);

        //save copy of model (include undefined values in copy)
        this.__model = {};
        for (var _prop in model) {
            this.__model[_prop] = model[_prop];
        }
        //if id isn't in model
        if (!("id" in this.__model)) {
            //add it (default value 0)
            this.__model.id = 0;
        }
        //create props 
        //(given default id will overwrite above default)
        for (var _prop2 in this.__model) {
            var val = this.__model[_prop2];
            //if this prop doesn't have a private name
            if (_prop2.indexOf("_") != 0) {
                //make it so
                _prop2 = this.__convertProp(_prop2);
            }
            //init property
            this[_prop2] = val;
        }
        //internal id of the object
        this._id = Math.floor(Math.random() * 1000000);
    }

    //converts a property's name to a property in this object


    _createClass(JCObject, [{
        key: "__convertProp",
        value: function __convertProp(prop) {
            return "_" + prop;
        }

        //parses property spec agument

    }, {
        key: "__parsePropSpec",
        value: function __parsePropSpec(propArgs) {
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
                    } else {
                        //else, we have a problem
                        throw new Error("JCObject prop spec expects a string, array, or nothing, " + (typeof prop === "undefined" ? "undefined" : _typeof(prop)) + " given.");
                    }
            //return parsed props
            return props;
        }

        //GETTERS
        // gets a property value
        // - propSpec (str, array -- optional) The name(s) of the property(ies) to get (defaults to all properties)
        // - returns (all) The property value, or an object of all properties requested

    }, {
        key: "get",
        value: function get() {
            var props = this.__parsePropSpec(arguments),
                collection = {};
            //loop props
            for (var i = 0; i < props.length; i++) {
                var val = void 0;
                //if this property is NOT in the model
                if (!(props[i] in this.__model)) {
                    //then there is nothing to get
                    continue;
                } //else, this is a valid prop
                //get prop value
                val = this[this.__convertProp(props[i])];
                //if value is object
                if ((typeof val === "undefined" ? "undefined" : _typeof(val)) == "object") {
                    //then we need to copy it, if it is an array
                    if (Array.isArray(val)) {
                        //slice it
                        val = val.slice();
                    } else {
                        //else it is an object (or null), extend it
                        val = (0, _extend2.default)({}, val);
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

    }, {
        key: "update",
        value: function update(data, val) {
            //if we received a single prop and value
            if (typeof data == "string") {
                //if this property is NOT in the model
                if (!(data in this.__model)) {
                    //then don't attempt to create it
                    return this;
                } //else, this is a valid prop
                //update the single prop
                this[this.__convertProp(data)] = val;
            }
            //if we received data
            else if ((typeof data === "undefined" ? "undefined" : _typeof(data)) == "object" && data !== null) {
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

    }, {
        key: "reset",
        value: function reset() {
            var toReset = this.__parsePropSpec(arguments);
            //loop props that we are to reset
            for (var i = 0; i < toReset.length; i++) {
                //if this prop was in our model
                if (toReset[i] in this.__model) {
                    //reset it
                    this.update(toReset[i], this.__model[toReset[i]]);
                }
            }
            //return this
            return this;
        }
    }]);

    return JCObject;
}();
//export JCObject class
exports.JCObject = JCObject;