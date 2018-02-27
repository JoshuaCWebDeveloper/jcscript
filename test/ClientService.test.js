/* ClientService.test.js
 * Tests ClientService
 * Dependencies: assert, Q, jsdom, sinon modules, mocha context
 * Author: Joshua Carter
 * Created: January 29, 2017
 */
"use strict";
//include dependencies
var assert = require('assert'),
    Q = require('q'),
    jsdom = require('jsdom'),
    moment = require('moment');
// Create a fake DOM for testing with $.ajax
global.document = jsdom.jsdom();
global.window = document.defaultView;
//global.XMLHttpRequest = global.window.XMLHttpRequest;
var sinon = require('sinon'),
    ClientService = require('../build/index').ClientService;
    
//begin mocha tests
describe('ClientService', function () {
    //create default values
    var uri = "http://www.example.com",
        jsonResponse = [
            200,
            { "Content-Type": "application/json" },
            JSON.stringify({
                author: "Joshua Carter",
                title: "Why I Am Awesome",
                body: "This is a rhetorical piece.",
                comments: "Nobody likes you Joshua."
            })
        ],
        currentXhr, Server,
        createJsonResponse = function (status) {
            //respond with the given status, or 200
            Server.respondWith([
                status || jsonResponse[0],
                jsonResponse[1],
                jsonResponse[2]
            ]);
        },
        testJsonResponse = function (data) {
            assert(data && data.author);
        };
    
    beforeEach(function () {
        //save xhr
        currentXhr = global.window.XMLHttpRequest;
        //delete current xhr
        delete global.window.XMLHttpRequest;
        //create new server
        Server = sinon.fakeServer.create();
        //copy over fake xhr
        window.XMLHttpRequest = Server.xhr;
        // get a reference to the original onCreate method 
        var onCreate = window.XMLHttpRequest.onCreate; 
        //specify new onCreate method
        window.XMLHttpRequest.onCreate = function(xhr) { 
             // set the missing methods on the xhr object 
             xhr.setRequestHeader = function (k, v) {
                 this.requestHeaders[k] = v;
             };
             xhr.getAllResponseHeaders = sinon.stub(); 
             // call the original method here 
             onCreate(xhr);
        };
    });
    
    afterEach(function () {
        //restore server
        Server.restore();
        //restore xhr
        delete global.window.XMLHttpRequest;
        window.XMLHttpRequest = currentXhr;
    });
        
        
    it ('Should be able to make the call without error (test setup)', function () {
    
        var Test = new ClientService();
        
        createJsonResponse();
        
        return Test.get('http://www.example.com/posts/1').then(function (result) {
            //console.log(result);
            assert(result && typeof result == "object");
        });
    });
    
    
    
    describe('#Construction', function () {
        it ('Should instantiate with default auth and reject', function () {
            //create new ClientService
            var Test = new ClientService();
            //check defaults
            assert(Test._auth === false);
            assert(Array.isArray(Test._reject) && Test._reject.length == 0);
        });
        
        it ('Should instantiate with specified auth and reject', function () {
            //create service
            var auth = 'Basic p4ssw0rd',
                reject = 404,
                TestCustom = new ClientService(auth, reject);
            //check given values
            assert(TestCustom._auth === auth);
            assert(TestCustom._reject === reject);
        });
    });
    
    describe('#Getters', function () {
        it ('Should be able to get last call id', function () {
            //create unique url
            var url = uri + '/unique-getters-url',
                //create new service
                Test = new ClientService(),
                callId;
            //send request
            createJsonResponse();
            Test.get(url);
            //get last call id
            callId = Test.getLastCallId();
            //check if this is the right call
            assert(Test._calls[callId].get('url') == url); 
        });
    });
    
    describe('#Setters', function () {
        //create service
        var Test = new ClientService();
        it ('Should allow auth to be set', function () {
            //set auth
            var auth = 'Basic p4ssw0rd';
            Test.setAuth(auth);
            assert(Test._auth === auth);
        });
        
        it ('Should allow reject to be set', function () {
            //set reject
            var reject = 404;
            Test.setReject(reject);
            assert(Test._reject === reject);
        });
        
        it ('Should revokeAuth()', function () {
            //set auth
            Test.setAuth('something');
            //revoke auth
            Test.revokeAuth();
            assert(Test._auth === false);
        });
    });
    
    describe('#Auth Listeners', function () {
        //create service
        var Test = new ClientService(),
            notChanged = true,
            listener = function () {
                notChanged = false;
            };
        it ('Should not call removed invalid auth handler', function () {
            //add listener
            Test.addInvalidAuthListener(listener);
            //remove listener
            Test.removeInvalidAuthListener(listener);
            //emit invalid auth
            Test._emitInvalidAuth();
            assert(notChanged);
        });
        
        it ('Should call invalid auth handlers', function () {
            var authText = 'Intruder',
                listener = function (response) {
                    assert(response == authText);
                };
            //add listener
            Test.addInvalidAuthListener(listener);
            //emit invalid auth
            Test._emitInvalidAuth(authText);
            //remove listener
            Test.removeInvalidAuthListener(listener);
        });
    });
    
    describe('#Options', function () {
        it ('Can be passed in per request serviceOptions', function () {
            //create options
            var serviceOpts = {
                    reject: [404],
                    auth: 'Basic p4ssw0rd'
                },
                requestOpts = {
                    reject: [500, 503],
                    auth: 'NULL'
                },
                //create service
                TestAuth = new ClientService(serviceOpts.auth, serviceOpts.reject),
                TestReject = new ClientService(serviceOpts.auth, serviceOpts.reject),
                testAuthCall, testRejectCall;
            //make requests
            createJsonResponse();
            TestAuth.ajax("POST", uri, {}, {auth: requestOpts.auth});
            createJsonResponse();
            TestReject.ajax("POST", uri, {}, {reject: requestOpts.reject});
            //get calls
            testAuthCall = TestAuth._calls[TestAuth.getLastCallId()];
            testRejectCall = TestReject._calls[TestReject.getLastCallId()];
            //test service options and request options
            assert.equal(testAuthCall.get("headers")['Authorization'], requestOpts.auth);
            assert.equal(testAuthCall.get("reject")[0], serviceOpts.reject[0]);
            assert.equal(testRejectCall.get("reject")[1], requestOpts.reject[1]);
            assert.equal(testRejectCall.get("headers")['Authorization'], serviceOpts.auth);
        });
        
        it ('Can be passed from get()', function () {
            //create options
            var serviceOpts = {
                    reject: [404],
                    auth: 'Basic p4ssw0rd'
                },
                ajaxProps = {
                    global: false,
                    ifModified: true,
                    isLocal: true,
                    jsonP: false
                },
                //create service
                Test = new ClientService(),
                testCall;
            //make requests
            createJsonResponse();
            Test.get(uri, {}, serviceOpts, ajaxProps);
            //get call
            testCall = Test._calls[Test.getLastCallId()];
            //test service options and ajax props
            assert.equal(testCall.get("headers")['Authorization'], serviceOpts.auth);
            assert.equal(testCall.get("reject")[0], serviceOpts.reject[0]);
            assert.equal(testCall.get("ajaxProps").global, ajaxProps.global);
            assert.equal(testCall.get("ajaxProps").ifModified, ajaxProps.ifModified);
        });
        
        
    });
    
    describe('#Requests', function () {
        it ('Should make basic get request', function () {
            //create service
            var Service = new ClientService();
            //make request
            createJsonResponse();
            return Service.get(uri).then(testJsonResponse);
        });
        
        it ('Should make basic post request', function () {
            //create service
            var Service = new ClientService();
            //make request
            createJsonResponse();
            return Service.ajax("POST", uri).then(testJsonResponse);
        });
        
        it ('Should pass data as JSON in request', function () {
            //create body
            var reqData = {
                    comment: "I find this post to be interesting",
                    user: "JoshuaCWebDeveloper"
                },
                //create service
                Service = new ClientService();
            //make request with data
            Server.respondWith(function (request) {
                //test request body
                assert(request.requestBody == JSON.stringify(reqData));
                //respond success
                request.respond(jsonResponse[0], jsonResponse[1], jsonResponse[2]);
            });
            return Service.ajax("POST", uri, reqData);
        });
        
        it ('Should send auth headers', function () {
            //create auth
            var auth = 'Basic p4ssw0rd',
                //create service
                Service = new ClientService(auth);
            //make request
            Server.respondWith(function (request) {
                //test auth header
                assert(request.requestHeaders.Authorization == auth);
                //respond success
                request.respond(jsonResponse[0], jsonResponse[1], jsonResponse[2]);
            });
            return Service.get(uri);
        });
        
        it ('Can be cancelled', function () {
            //create service
            var Service = new ClientService(),
                promise;
            //make request
            promise = Service.get(uri).catch(function (args) {
                assert(args == "CANCELLED");
            });
            //cancel request
            Service.cancel(Service.getLastCallId());
            return promise;
        });
        
        it ('Should send same request after previous request has been completed', function () {
            //create service
            var Service = new ClientService(),
                i = 0;
            //set response
            Server.respondWith(function (request) {
                //respond with i
                request.respond(jsonResponse[0], jsonResponse[1], String(i));
                //count response
                i++;
            });
            //make request
            return Service.get(uri).then(function (ri) {
                //this is request 0
                assert(ri === 0);
                //send same request again
                return Service.get(uri);
            }).then(function (ri) {
                //this is request 1
                assert(ri === 1);
            }, function () {
                //FAILURE
                assert(false);
            });
        });
    });
    
    describe('#Error Statuses', function () {
        it ('Should resend request', function () {
            //create service
            var Service = new ClientService(),
                //track resends
                numResends = 3,
                i = 0,
                lastRequest = moment();
            //requests will take apprizimately 6 seconds to complete, set timeout to 8
            this.timeout(8000);
            //set response
            Server.respondWith(function (request) {
                //count response
                i++;
                //if we have resent four times
                if (i >= numResends + 1) {
                    //respond with a success status
                    request.respond(jsonResponse[0], jsonResponse[1], jsonResponse[2]);
                    return;
                }
                //measure time since last request
                assert(moment().diff(lastRequest, 'seconds') == i-1);
                //update lest request time
                lastRequest = moment();
                //respond with 500
                request.respond(500, {}, '');
            });
            //make request
            return Service.get(uri).then(function (data) {
                //test response
                testJsonResponse(data);
                //teset number of resends
                assert(i == numResends + 1);
            });
        });
        
        it ('Should fail a promise for a status configured with reject', function () {
            //create service
            var Service = new ClientService(undefined, 500),
                //create spy to listen for failure
                failHandler = sinon.spy();
            //set response
            createJsonResponse(500);
            //make request
            return Service.get(uri).catch(failHandler).then(function () {
                //check and ensure the promise was failed
                assert.equal(failHandler.callCount, 1);
            });
        });
        
        it ('Should fail a promise for multiple statuses configured with reject', function () {
            //create service
            var Service = new ClientService(undefined, [500, 406]), 
                i = 0,
                //create spy to listen for failure
                failHandler = sinon.spy();
            //set response
            Server.respondWith(function (request) {
                //respond with 500 or 406
                request.respond(i ? 500 : 406, jsonResponse[1], jsonResponse[2]);
                //count response
                i++;
            });
            //make requests
            return Q.all([
                Service.get(uri).catch(failHandler),
                Service.get(uri).catch(failHandler)
            ]).then(function () {
                //check and ensure the promise was failed twice
                assert.equal(failHandler.callCount, 2);
            });
        });
        
        it ('Should fail a promise for multiple statuses configured with reject all', function () {
            //create service
            var Service = new ClientService(undefined, "all"),
                i = 0,
                //create spy to listen for failure
                failHandler = sinon.spy();
            //set response
            Server.respondWith(function (request) {
                //respond with 500 or 406
                request.respond(i ? 500 : 406, jsonResponse[1], jsonResponse[2]);
                //count response
                i++;
            });
            //make requests
            return Q.all([
                Service.get(uri).catch(failHandler),
                Service.get(uri).catch(failHandler)
            ]).then(function () {
                //check and ensure the promise was failed twice
                assert.equal(failHandler.callCount, 2);
            });
        });
        
        it ('Should still resend a request when a different status is configured with reject', function () {
            //create service
            var Service = new ClientService(undefined, 500),
                i = 0;
            //set response
            Server.respondWith(function (request) {
                //count response
                i++;
                //if we have already resent
                if (i >= 2) {
                    //test passed
                    assert(true);
                    //respond with a success status
                    request.respond(jsonResponse[0], jsonResponse[1], jsonResponse[2]);
                    return;
                }
                //respond with 406
                request.respond(406, {}, '');
            });
            //make request
            return Service.get(uri);
        });
        
        it ('Should emit invalid auth on a 401 status when given an auth string', function (done) {
            var auth = 'Intruder',
                listener = function (response) {
                    testJsonResponse(response);
                    done();
                },
                //create service
                Service = new ClientService(auth, 401);
            //add listener
            Service.addInvalidAuthListener(listener);
            //set response
            createJsonResponse(401);
            //make request (don't return, test is done when auth listener is called)
            Service.get(uri);
        });
    });
    
});
