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

        var val;
        //save model
        this.__model = model;
        //default value for id
        this._id = 0;
        //create additional props 
        //(given default id will overwrite above default)
        for (var prop in model) {
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


    _createClass(JCObject, [{
        key: "__convertProp",
        value: function __convertProp(prop) {
            return "_" + prop;
        }

        //GETTERS
        // gets a property value
        // - prop (string, array) The name(s) of the property(ies) to get
        // - returns (all) The property value, or an object of all properties requested

    }, {
        key: "get",
        value: function get(prop) {
            var collection;
            //if we received a prop name
            if (typeof prop == "string") {
                //return value using converted single prop
                return this[this.__convertProp(prop)];
            } //else, we must have received multiple props
            //loop props
            collection = {};
            for (var i = 0; i < prop.length; i++) {
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

    }, {
        key: "update",
        value: function update(data, val) {
            var newData = {};
            //if we received a single prop and value
            if (typeof data == "string") {
                //if this prop is private, update the name
                data = this._convertProp(data);
                //if this property doesn't exist, don't create it
                if (typeof this[data] == "undefined") {
                    return this;
                }
                //update the single prop
                this[data] = val;
            }
            //if we received data
            else if ((typeof data === "undefined" ? "undefined" : _typeof(data)) == "object" && data !== null) {
                    //loop the data
                    for (var prop in data) {
                        //if this prop is private, update the name
                        //if this property exists
                        if (typeof this[this._convertProp(prop)] != "undefined") {
                            //add it to new data
                            newData[this._convertProp(prop)] = data[prop];
                        }
                    }
                    //extend default props with new data
                    (0, _extend2.default)(this, newData);
                }
            return this;
        }

        // resets all properties to default values (or only specific properties if specified)
        // - prop (str, array -- optional) The name(s) of the property(ies) to reset (defaults to all properties)
        // - returns (obj) This

    }, {
        key: "reset",
        value: function reset(prop) {
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
                    } else {
                        //else, we have a problem
                        throw new Error("JCObject.reset() expects a string or array, " + (typeof prop === "undefined" ? "undefined" : _typeof(prop)) + " given.");
                    }
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