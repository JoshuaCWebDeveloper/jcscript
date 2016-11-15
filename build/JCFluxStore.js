/* JCFluxStore.js
 * Represents a basic flux store modeled by a JCObject
 * Dependencies: jcscript, events, extend, flux modules
 * Author: Joshua Carter
 * Created: November 6, 2016
 */
"use strict";
//include dependencies

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.JCFluxStore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _JCObject2 = require('./JCObject.js');

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _flux = require('flux');

var _flux2 = _interopRequireDefault(_flux);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//create our actions class
var JCActionsService = function () {
    function JCActionsService(Dispatcher, ACTIONS) {
        _classCallCheck(this, JCActionsService);

        //create shortcut for our constants
        this._ACTIONS = ACTIONS;
        this._Dispatcher = Dispatcher;
    }

    // updates object with new data
    // - id (int) The id of the object to update
    // - data (obj, string) A collection of properties and new values to update OR the name of a single property to update
    // - val (string -- optional) If data is string (single prop), the value to update it to


    _createClass(JCActionsService, [{
        key: 'update',
        value: function update(id, data, val) {
            this._Dispatcher.dispatch({
                type: this._ACTIONS.UPDATE,
                id: id,
                params: [data, val]
            });
        }
    }]);

    return JCActionsService;
}(),

//create set of constants
ACTIONS = {
    UPDATE: "JCSTORE1"
},

//create new dispatcher
JCDispatch = new _flux2.default.Dispatcher(),

//create new actions service
JCActions = new JCActionsService(JCDispatch, ACTIONS);
//inherit from both JCObject and Events
(0, _extend2.default)(true, _JCObject2.JCObject.prototype, _events2.default.EventEmitter.prototype);
//child will have method the same name as the parent
_JCObject2.JCObject.prototype._updateData = _JCObject2.JCObject.prototype.update;
//create PlayStore class from JCObject

var JCFluxStore = function (_JCObject) {
    _inherits(JCFluxStore, _JCObject);

    function JCFluxStore(data, defaults, Dispatch, Actions, AC) {
        _classCallCheck(this, JCFluxStore);

        //if we weren't given defaults, use data
        var defaults = defaults || data;
        //pass data to parent

        //store services
        var _this = _possibleConstructorReturn(this, (JCFluxStore.__proto__ || Object.getPrototypeOf(JCFluxStore)).call(this, defaults));

        _this._Dispatch = Dispatch || JCDispatch;
        _this._Actions = Actions || JCActions;
        //store contants
        _this._AC = AC || ACTIONS;
        //register dispath
        _this._RegisterDispatch();
        //save event to server as our change event
        _this._CHANGE_EVENT = 'change';
        //update our store with the given data
        _this._updateData(data);
        return _this;
    }

    //GETTERS
    //gets actions service


    _createClass(JCFluxStore, [{
        key: 'Actions',
        value: function Actions() {
            return this._Actions;
        }

        //SETTERS
        // accessor for JCObject.update(), triggers change on store

    }, {
        key: 'update',
        value: function update(data, val) {
            //update this
            this._updateData(data, val);
            //our store has likely changed
            this.emitChange();
        }
    }, {
        key: '_RegisterDispatch',
        value: function _RegisterDispatch() {
            var _this2 = this;

            //map action types to store methods
            var actions = {};
            actions[this._AC.UPDATE] = "update";
            //register our callback
            this._Dispatch.register(function (action) {
                //if we can handle this type of action, and it is for this play
                if (action.params && action.type in actions && action.id == _this2._id) {
                    //call the handler for this action
                    _this2[actions[action.type]].apply(_this2, _toConsumableArray(action.params));
                }
            });
        }

        //triggers change event on our app

    }, {
        key: 'emitChange',
        value: function emitChange() {
            this.emit(this._CHANGE_EVENT);
        }

        //used to add listeners for our change event

    }, {
        key: 'addChangeListener',
        value: function addChangeListener(callback) {
            this.on(this._CHANGE_EVENT, callback);
        }

        //used to cleanup listeners on our change event

    }, {
        key: 'removeChangeListener',
        value: function removeChangeListener(callback) {
            this.removeListener(this._CHANGE_EVENT, callback);
        }
    }]);

    return JCFluxStore;
}(_JCObject2.JCObject);
//export


exports.JCFluxStore = JCFluxStore;