/* FluxStore.js
 * Basic Flux store
 * Dependencies: flux module
 * Author: Joshua Carter
 * Created: February 25, 2017
 */
"use strict";
//include modules

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FluxStore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _flux = require('flux');

var _flux2 = _interopRequireDefault(_flux);

var _utils = require('flux/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//create default dispatcher
var defaultDispatch = new _flux2.default.Dispatcher();
//create class for our store
var FluxStore = function (_Store) {
    _inherits(FluxStore, _Store);

    function FluxStore(Dispatch) {
        _classCallCheck(this, FluxStore);

        //determine disaptch to use
        var dispatcher = Dispatch || defaultDispatch;
        //call FluxStore constructor (pass dispatcher)

        //save dispatcher
        var _this = _possibleConstructorReturn(this, (FluxStore.__proto__ || Object.getPrototypeOf(FluxStore)).call(this, dispatcher));

        _this.__Dispatch = dispatcher;
        //init flux actions
        _this.fluxActions = {};
        //track tokens used for removing listener
        _this.listenerTokens = [];
        return _this;
    }

    //override FluxStore.__onDispatch, this method will be registered with the dispatcher


    _createClass(FluxStore, [{
        key: '__onDispatch',
        value: function __onDispatch(action) {
            //if we can handle this type of action AND
            //this flux store is supposed to be receiving it
            if (action.params && action.type in this.fluxActions && (!("_id" in this) || !("id" in action) || action.id == this._id)) {
                //call the handler for this action
                this[this.fluxActions[action.type]].apply(this, _toConsumableArray(action.params));
            }
        }

        //to be used instead of FluxStore.__emitChange()

    }, {
        key: 'emitChange',
        value: function emitChange() {
            this.__emitter.emit(this.__changeEvent);
        }

        //used to add listeners for our change event

    }, {
        key: 'addChangeListener',
        value: function addChangeListener(callback) {
            //save token
            this.listenerTokens.push(this.addListener(callback));
        }

        //used to cleanup listeners on our change event

    }, {
        key: 'removeChangeListener',
        value: function removeChangeListener(callback) {
            //loop tokens
            for (var i = 0; i < this.listenerTokens.length; i++) {
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

    }, {
        key: 'destroy',
        value: function destroy() {
            //first, remove the dispatch listener
            this.__Dispatch.unregister(this._dispatchToken);
            //next, remove all of our flux actions
            this.fluxActions = null;
            //now, loop through and remove each change listener
            for (var i = 0; i < this.listenerTokens.length; i++) {
                this.listenerTokens[i].remove();
            }
            //finally, remove our listener tokens
            this.listenerTokens = null;
        }
    }]);

    return FluxStore;
}(_utils.Store);
//export FluxStore
exports.FluxStore = FluxStore;