/* ClientService.js
 * Service class for handling network requests from clients
 * Dependencies: events, extend, jQuery, Q modules, JCObject class
 * Author: Joshua Carter
 * Created: November 05, 2016
 */
"use strict";
//import dependencies
import Events from 'events';
import extend from 'extend';
import $ from 'jquery';
import Q from 'q';
import { DOMParser } from 'xmldom';
import { JCObject } from './JCObject.js';
//create Call class to represent single call
var Call = class extends JCObject {
     
        constructor (data) {
            super({
                //properties that store state of call
                waitTime: 0,
                aborted: false,
                //properties that store data
                requestId: '',   //a unique text identifier for a method/URL/data combination
                reject: [],
                rejectAll: false,
                method: '',
                url: '',
                dataType: 'json',    //the type of data in the response (accepts header)
                contentType: 'application/json', //the type of data in the request
                data: {},    //request data
                headers: [],    //request headers to set
                ajaxProps: {},  //extra properties to pass to jQuery.ajax()
                $jqXHR: undefined,
                Promise: undefined
            });
            //set props with given data
            this.update(data);
            //init call
            this._init();
        }
        
        _init () {
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
        make () {
            //init xhrFields
            var xhrFields = {};
            //if we have an authorization header
            if ('Authorization' in this._headers) {
                //set withCredentials (send Auth to third-party domains, and accept cookies)
                xhrFields.withCredentials = true;
            }
            //make request, store jqXHR object
            this._$jqXHR = $.ajax(extend({
                method: this._method,
                url: this._url,
                dataType: this._dataType,
                data: (this._contentType == 'application/json') ? JSON.stringify(this._data) : this._data,
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
                this._Promise = Q(this._$jqXHR.then((data, textStatus, jqXHR) => {
                    return [data, textStatus, jqXHR];
                }, (jqXHR, textStatus, errorThrown) => {
                    throw [jqXHR, textStatus, errorThrown];
                }));
            }
            catch (e) {
                this._Promise = Q.reject(e);
            }
            //chain handlers
            this._Promise = this._Promise.then(args => {
                //return data
                return args[0];
            }, args => {
                //FAILURE
                //expand array
                var [jqXHR, textStatus] = args,
                    data;
                //if we are NOT supposed to reject the promise for this status code AND
                //the request was not aborted
                if (!this._rejectAll && this._reject.indexOf(jqXHR.status) < 0 && textStatus != "abort") {
                    //return a promise that will make this call again
                    return this.repeat();
                }   //else, we are supposed to reject this promise
                //if response hasn't been parsed as XML or JSON
                if (!jqXHR.responseXML && !jqXHR.responseJSON) {
                    //try to parse response as JSON
                    try {
                        jqXHR.responseJSON = JSON.parse(jqXHR.responseText);
                    }
                    catch (e) {
                        jqXHR.responseJSON = undefined;
                    }
                    //try to parse response as XML
                    try {
                        jqXHR.responseXML = (new DomParser()).parseFromString(jqXHR.responseText, "text/xml");
                        //if there was a parse error
                        if (jqXHR.responseXML.documentElement.nodeName == "parsererror") {
                            //throw the error
                            throw jqXHR.responseXML;
                        }
                    }
                    catch (e) {
                        jqXHR.responseXML = undefined;
                    }
                }
                //data is either parsed data or response text
                data = jqXHR.responseJSON || jqXHR.responseXML || jqXHR.resoponseText;
                //reject this promise with jqXHR and data
                throw [jqXHR, data];
            });
        }
        
        // send this request again
        repeat () {
            //wait one second longer than previous repeat 
            //(first repeat will be after one second)
            this._waitTime += 1000;
            return Q.delay(this._waitTime).then(() => {
                //if this request was aborted (has been cancelled)
                if (this._aborted) {
                    //reject this promise
                    throw "CANCELLED";
                }
                //else, repeat request
                this.make();
                //return our promise
                return this._Promise;
            });
        }
        
        // cancel the request
        abort () {
            //abort request
            this._$jqXHR.abort();
            //indicate this request has been aborted
            this._aborted = true;
        }
        
    },
    //create ClientService class
    ClientService = class extends Events.EventEmitter {
        
        // - auth (string) The value of an Authorization header to send with the request
        // - reject (string, int, array) An integer or array of integer http status codes to reject a promise for
        //                               If a 4** or 5** code is received, default behavior is to retry the request
        //                               Any http status codes passed will instead result in a rejection of the promise
        //                               The string 'any' will reject the promise for all failed request
        constructor (auth, reject) {
            //call parent
            super();
            //set invalid auth event
            this._invalidAuthEvent = "INVALID_AUTH";
            //store auth
            this.setAuth(auth);
            //store reject
            this.setReject(reject);
            //create object to store requests (requestId: Call)
            this._calls = {};
            //track last call id
            this._lastCallRequestId = '';
        }
        
        
        //GETTERS
        //gets the request id of the most recent request
        // - returns (string) The call id of the most recent request
        getLastCallId () {
            return this._lastCallRequestId;
        }
        
        //SETTERS
        // sets the auth string that is sent with requests (see doc for constructor())
        // - auth (string) The auth string to set
        setAuth (auth) {
            this._auth = auth || false;
        }
        
        // revokes a set auth string
        revokeAuth () {
            this.setAuth(false);
        }
        
        // sets the default reject value for requests (see doc for constructor())
        // - reject (string, int, array) The reject value to set
        setReject (reject) {
            this._reject = reject || [];
        }
        
        // adds a handler to execute when the server invalidates the given auth string
        addInvalidAuthListener (callback) {
            this.addListener(this._invalidAuthEvent, callback);
        }
        
        // removes a handler for an invalid auth
        removeInvalidAuthListener (callback) {
            this.removeListener(this._invalidAuthEvent, callback);
        }
        
        
        // emit invalid auth event
        _emitInvalidAuth (response) {
            this.emit(this._invalidAuthEvent, response);
        }
        
        //cancels a request with the given Call requestId
        // - callId (string) The call id of the request to cancel
        cancel (callId) {
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
        ajax (method, url, data, serviceOptions, ajaxOptions) {
            //normalize arguments
            var data = data || {},
                serviceProps = serviceOptions || {},
                ajaxProps = ajaxOptions || {},
                //set authorization 
                auth = serviceProps.auth || this._auth,
                //set reject
                reject = serviceProps.reject || this._reject,
                //init headers
                headers = [],
                call, requestId;
            //if we didn't get a method and url
            if (!method || !url) {
                throw new Error(`ClientSerivce.ajax() expects at least two arguments (method, url). 
Received: ${method}, ${url}`);
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
                headers: headers,
                ajaxProps: ajaxProps
            });
            //store requestId
            requestId = call.get('requestId');
            //if this call already exists
            if (this._calls[requestId]) {
                //then return the promise from this call
                return this._calls[requestId].get('Promise');
            }   //else, this is a new request
            //send the request
            call.make();
            //add call to calls collection
            this._calls[requestId] = call;
            //set last call id
            this._lastCallRequestId = requestId;
            //if we were given authorization
            if (auth) {
                //chain 401 handler to this call
                call.get('Promise').catch(args => {
                    //FAILURE
                    var response;
                    //if this is NOT a 401 error
                    if (args[0].status != 401) {
                        //then ignore it
                        throw args;
                    }
                    //then emit auth event with data
                    this._emitInvalidAuth(args[1]);
                });
            }
            //return the promise from this call
            return call.get('Promise');
        }
        
        // send GET request to url 
        // - url (string)  The url to send the request to.
        // - params (obj) A JavaScript object to be sent to the API as urlencoded string
        // - reject (string, int, array) The reject value to set
        // - returns (jqXHR, $.Deferred) A jQuery promise    
        get (url, params, serviceOptions, ajaxOptions) {
            //create ajaxOptions
            var ajaxProps = extend({
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
            }, ajaxOptions || {});
            //use ajax method to send request
            return this.ajax("GET", url, params, serviceOptions, ajaxProps);
        }
        
    };
//export ClientService
export { ClientService };
