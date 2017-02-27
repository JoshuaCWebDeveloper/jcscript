/* FluxStore.js
 * Basic Flux store
 * Dependencies: events module
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

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//create class for our store
var FluxStore = function (_Events$EventEmitter) {
    _inherits(FluxStore, _Events$EventEmitter);

    function FluxStore(Dispatch) {
        _classCallCheck(this, FluxStore);

        //save event to server as our change event
        var _this = _possibleConstructorReturn(this, (FluxStore.__proto__ || Object.getPrototypeOf(FluxStore)).call(this));
        //call EventEmitter constructor


        _this._CHANGE_EVENT = 'change';
        //store services
        _this._Dispatch = Dispatch;
        //register dispatch
        _this._RegisterDispatch();
        //init flux actions
        _this.fluxActions = {};
        return _this;
    }

    _createClass(FluxStore, [{
        key: '_RegisterDispatch',
        value: function _RegisterDispatch() {
            var _this2 = this;

            //if we don't have a dispatch
            if (!this._Dispatch) {
                //then don't do anything
                return;
            }
            //register our callback
            this._Dispatch.register(function (action) {
                //if we can handle this type of action AND
                //this flux store is supposed to be receiving it
                if (action.params && action.type in _this2.fluxActions && (!("_id" in _this2) || !("id" in action) || action.id == _this2._id)) {
                    //call the handler for this action
                    _this2[_this2.fluxActions[action.type]].apply(_this2, _toConsumableArray(action.params));
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

    return FluxStore;
}(_events2.default.EventEmitter);
//export FluxStore
exports.FluxStore = FluxStore;