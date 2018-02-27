/* ClientService.js
 * Service class for handling network requests from clients
 * Dependencies: events, extend, jQuery, Q modules, JCObject class
 * Author: Joshua Carter
 * Created: November 05, 2016
 */
"use strict";
//import dependencies

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ClientService = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _JCObject2 = require('./JCObject.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//create jqXHR extension object
var csXHR = {
    //remove jQuery promise methods
    then: null,
    done: null,
    fail: null,
    always: null,
    pipe: null,
    progress: null,
    state: null,
    promise: null,
    //add custom ClientService properties
    responseData: null
},

//create Call class to represent single call
Call = function (_JCObject) {
    _inherits(Call, _JCObject);

    function Call(data) {
        _classCallCheck(this, Call);

        //set props with given data
        var _this = _possibleConstructorReturn(this, (Call.__proto__ || Object.getPrototypeOf(Call)).call(this, {
            //properties that store state of call
            waitTime: 0,
            aborted: false,
            //properties that store data
            requestId: '', //a unique text identifier for a method/URL/data combination
            reject: [],
            rejectAll: false,
            returnXHR: false,
            method: '',
            url: '',
            dataType: 'json', //the type of data in the response (accepts header)
            contentType: 'application/json', //the type of data in the request
            data: {}, //request data
            headers: {}, //request headers to set
            ajaxProps: {}, //extra properties to pass to jQuery.ajax()
            $jqXHR: undefined,
            Promise: undefined
        }));

        _this.update(data);
        //init call
        _this._init();
        return _this;
    }

    _createClass(Call, [{
        key: '_init',
        value: function _init() {
            //set request id
            this._requestId = this._method + this._url + JSON.stringify(this._data);
            //set reject all
            this._rejectAll = this._reject == "all";
            //normalize reject
            if (!Array.isArray(this._reject)) {
                this._reject = [this._reject];
            }
        }

        //send the request 

    }, {
        key: 'make',
        value: function make() {
            var _this2 = this;

            //init xhrFields
            var xhrFields = {};
            //if we have an authorization header
            if ('Authorization' in this._headers) {
                //set withCredentials (send Auth to third-party domains, and accept cookies)
                xhrFields.withCredentials = true;
            }
            //make request, store jqXHR object
            this._$jqXHR = _jquery2.default.ajax((0, _extend2.default)({
                method: this._method,
                url: this._url,
                dataType: this._dataType,
                data: this._contentType == 'application/json' ? JSON.stringify(this._data) : this._data,
                async: true,
                contentType: this._contentType,
                headers: this._headers,
                xhrFields: xhrFields,
                cache: false
            }, this._ajaxProps));
            //convert jQuery promise to Q, store Q promise
            //Q promise only supports one argument, export/import jQuery handler arguments as array
            //jQuery may either throw an error or return rejected promise depending on jQuery version
            try {
                this._Promise = (0, _q2.default)(this._$jqXHR.then(function (data, textStatus, jqXHR) {
                    return [data, textStatus, jqXHR];
                }, function (jqXHR, textStatus, errorThrown) {
                    throw [jqXHR, textStatus, errorThrown];
                }));
            } catch (e) {
                this._Promise = _q2.default.reject(e);
            }
            //chain handlers
            this._Promise = this._Promise.then(function (args) {
                //expand array
                var _args = _slicedToArray(args, 3),
                    data = _args[0],
                    jqXHR = _args[2];
                //extend jqXHR


                jqXHR = (0, _extend2.default)(jqXHR, csXHR);
                //set data
                jqXHR.responseData = data;
                //return jqXHR
                return _this2._returnXHR ? jqXHR : data;
            }, function (args) {
                //FAILURE
                //expand array
                var _args2 = _slicedToArray(args, 2),
                    jqXHR = _args2[0],
                    textStatus = _args2[1];
                //if we are NOT supposed to reject the promise for this status code AND
                //the request was not aborted


                if (!_this2._rejectAll && _this2._reject.indexOf(jqXHR.status) < 0 && textStatus != "abort") {
                    //return a promise that will make this call again
                    return _this2.repeat();
                } //else, we are supposed to reject this promise
                //if response hasn't been parsed as XML or JSON
                if (!jqXHR.responseXML && !jqXHR.responseJSON) {
                    //try to parse response as JSON
                    try {
                        jqXHR.responseJSON = JSON.parse(jqXHR.responseText);
                    } catch (e) {
                        jqXHR.responseJSON = undefined;
                    }
                    //try to parse response as XML
                    try {
                        jqXHR.responseXML = new window.DOMParser().parseFromString(jqXHR.responseText, "text/xml");
                        //if there was a parse error
                        if (jqXHR.responseXML.documentElement.nodeName == "parsererror") {
                            //throw the error
                            throw jqXHR.responseXML;
                        }
                    } catch (e) {
                        jqXHR.responseXML = undefined;
                    }
                }
                //extend jqXHR
                (0, _extend2.default)(jqXHR, csXHR);
                //data is either parsed data or response text
                jqXHR.responseData = jqXHR.responseJSON || jqXHR.responseXML || jqXHR.responseText;
                //reject this promise with jqXHR
                throw _this2._returnXHR ? jqXHR : [jqXHR, jqXHR.responseData];
            });
        }

        // send this request again

    }, {
        key: 'repeat',
        value: function repeat() {
            var _this3 = this;

            //wait one second longer than previous repeat 
            //(first repeat will be after one second)
            this._waitTime += 1000;
            return _q2.default.delay(this._waitTime).then(function () {
                //if this request was aborted (has been cancelled)
                if (_this3._aborted) {
                    //reject this promise
                    throw "CANCELLED";
                }
                //else, repeat request
                _this3.make();
                //return our promise
                return _this3._Promise;
            });
        }

        // cancel the request

    }, {
        key: 'abort',
        value: function abort() {
            //abort request
            this._$jqXHR.abort();
            //indicate this request has been aborted
            this._aborted = true;
        }
    }]);

    return Call;
}(_JCObject2.JCObject),

//create ClientService class
ClientService = function (_Events$EventEmitter) {
    _inherits(ClientService, _Events$EventEmitter);

    // - auth (string) The value of an Authorization header to send with the request
    // - reject (string, int, array) An integer or array of integer http status codes to reject a promise for
    //                               If a 4** or 5** code is received, default behavior is to retry the request
    //                               Any http status codes passed will instead result in a rejection of the promise
    //                               The string 'any' will reject the promise for all failed request
    function ClientService(auth, reject) {
        _classCallCheck(this, ClientService);

        //set invalid auth event
        var _this4 = _possibleConstructorReturn(this, (ClientService.__proto__ || Object.getPrototypeOf(ClientService)).call(this));
        //call parent


        _this4._invalidAuthEvent = "INVALID_AUTH";
        //store auth
        _this4.setAuth(auth);
        //store reject
        _this4.setReject(reject);
        //create object to store requests (requestId: Call)
        _this4._calls = {};
        //track last call id
        _this4._lastCallRequestId = '';
        return _this4;
    }

    //GETTERS
    //gets the request id of the most recent request
    // - returns (string) The call id of the most recent request


    _createClass(ClientService, [{
        key: 'getLastCallId',
        value: function getLastCallId() {
            return this._lastCallRequestId;
        }

        //SETTERS
        // sets the auth string that is sent with requests (see doc for constructor())
        // - auth (string) The auth string to set

    }, {
        key: 'setAuth',
        value: function setAuth(auth) {
            this._auth = auth || false;
        }

        // revokes a set auth string

    }, {
        key: 'revokeAuth',
        value: function revokeAuth() {
            this.setAuth(false);
        }

        // sets the default reject value for requests (see doc for constructor())
        // - reject (string, int, array) The reject value to set

    }, {
        key: 'setReject',
        value: function setReject(reject) {
            this._reject = reject || [];
        }

        // adds a handler to execute when the server invalidates the given auth string

    }, {
        key: 'addInvalidAuthListener',
        value: function addInvalidAuthListener(callback) {
            this.addListener(this._invalidAuthEvent, callback);
        }

        // removes a handler for an invalid auth

    }, {
        key: 'removeInvalidAuthListener',
        value: function removeInvalidAuthListener(callback) {
            this.removeListener(this._invalidAuthEvent, callback);
        }

        // emit invalid auth event

    }, {
        key: '_emitInvalidAuth',
        value: function _emitInvalidAuth(response) {
            this.emit(this._invalidAuthEvent, response);
        }

        //cancels a request with the given Call requestId
        // - callId (string) The call id of the request to cancel

    }, {
        key: 'cancel',
        value: function cancel(callId) {
            //if this call doesn't exist
            if (!this._calls[callId]) {
                //then there is nothing do
                return;
            }
            //call abort method
            this._calls[callId].abort();
            //delete call
            delete this._calls[callId];
        }

        // send AJAX request to url
        // - method (string) The HTTP method to use (e.g. 'POST', 'DELETE', etc...)
        // - url (string)  The url to send the request to.
        // - data (obj -- optional) A JavaScript object to be sent to the API 
        //              (encoded as JSON if 'application/json' contentType)
        // - serviceOptions (obj -- optional) Service property values to use for just this request 
        //                                    ({auth, reject}, see doc for constructor()) 
        // - ajaxOptions (obj -- optional) Options to pass to jQuery.ajax() for this request
        //                                 (see doc for jQuery.ajax())
        // - returns (Q) A Q Promise

    }, {
        key: 'ajax',
        value: function ajax(method, url, data, serviceOptions, ajaxOptions) {
            var _this5 = this;

            //normalize arguments
            var data = data || {},
                serviceProps = serviceOptions || {},
                ajaxProps = ajaxOptions || {},

            //set authorization 
            auth = serviceProps.auth || this._auth,

            //set reject
            reject = serviceProps.reject || this._reject,

            //set returnXHR
            returnXHR = serviceProps.returnXHR || false,

            //init headers
            headers = {},
                call,
                requestId;
            //if we didn't get a method and url
            if (!method || !url) {
                throw new Error('ClientSerivce.ajax() expects at least two arguments (method, url). \nReceived: ' + method + ', ' + url);
            }
            //if we were given authorization
            if (auth) {
                //add auth to headers
                headers.Authorization = auth;
            }
            //create new call
            call = new Call({
                method: method,
                url: url,
                data: data,
                reject: reject,
                returnXHR: returnXHR,
                headers: headers,
                ajaxProps: ajaxProps
            });
            //store requestId
            requestId = call.get('requestId');
            //if this call already exists
            if (this._calls[requestId]) {
                //then return the promise from this call
                return this._calls[requestId].get('Promise');
            } //else, this is a new request
            //send the request
            call.make();
            //add call to calls collection
            this._calls[requestId] = call;
            //set last call id
            this._lastCallRequestId = requestId;
            //chain a handler to this call
            call.get('Promise').then(function () {
                //SUCCESS
                //request is complete, remove call
                delete _this5._calls[requestId];
            }, function () {
                //FAILURE
                //request is complete, remove call
                delete _this5._calls[requestId];
            });
            //if we were given authorization
            if (auth) {
                //chain 401 handler to this call
                call.get('Promise').catch(function (args) {
                    //FAILURE
                    //if this is NOT a 401 error
                    if (args[0].status != 401) {
                        //then ignore it
                        throw args;
                    }
                    //then emit auth event with data
                    _this5._emitInvalidAuth(args[1]);
                });
            }
            //return the promise from this call
            return call.get('Promise');
        }

        // send GET request to url 
        // - url (string)  The url to send the request to.
        // - params (obj) A JavaScript object to be sent to the API as urlencoded string
        // - serviceOptions (obj -- optional) Service property values to use for just this request 
        //                                    ({auth, reject}, see doc for constructor()) 
        // - ajaxOptions (obj -- optional) Options to pass to jQuery.ajax() for this request
        //                                 (see doc for jQuery.ajax())
        // - returns (Q) A Q Promise

    }, {
        key: 'get',
        value: function get(url, params, serviceOptions, ajaxOptions) {
            //create ajaxOptions
            var ajaxProps = (0, _extend2.default)({
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
            }, ajaxOptions || {});
            //use ajax method to send request
            return this.ajax("GET", url, params, serviceOptions, ajaxProps);
        }
    }]);

    return ClientService;
}(_events2.default.EventEmitter);
//export ClientService
exports.ClientService = ClientService;