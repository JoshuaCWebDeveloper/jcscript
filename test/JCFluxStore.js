/* JCFluxStore.js
 * Tests JCFluxStore
 * Dependencies: assert, flux modules, JCFluxStore, FluxStore classes, mocha context
 * Author: Joshua Carter
 * Created: November 6, 2016
 */
"use strict";
//include dependencies
var assert = require('assert'),
    Flux = require('flux'),
    JCFluxStore = require('../build/index').JCFluxStore,
    FluxStore = require('../build/index').JCFlux.FluxStore;

//begin mocha tests
describe('JCFluxStore', function () {
    //define data to use for testing
    var defaults = {
            firstName: '',
            lastName: '',
            projects: {}
        },
        data = {
            firstName: 'Joshua'
        },
        testObj;
        
    describe('#Construction', function () {
        var defaultProp = 'lastName',
            newProp = 'firstName';
        //create new JC object
        testObj = new JCFluxStore (data, defaults);
        it ('Should instantiate with object data and defaults', function () {
            assert.strictEqual(testObj.get(newProp), data.firstName);
            assert.strictEqual(testObj.get(defaultProp), defaults.lastName);
        });
        it ('Should instantiate with default flux actions', function () {
            assert(testObj.Actions() && testObj.Actions().update);
        });
        it ('Should instantiate with custom flux actions', function () {
            //create flux actions
            var testAC = {UPDATE_CUSTOM: 12},
                testDispatch = new Flux.Dispatcher(),
                testActions = {
                    updateCustom: function (id, data, val) {
                        testDispatch.dispatch({
                            type: 12,
                            id: id,
                            params: [data, val]
                        });
                    }
                },
                customClass = class extends JCFluxStore {
                    constructor (data, defaults) {
                        super (data, defaults, testDispatch, testActions, testAC);
                        this.fluxActions[testAC.UPDATE_CUSTOM] = '';
                        this.RegisterCustomDispatch();
                    }
                    
                    RegisterCustomDispatch () {
                        assert(testAC.UPDATE_CUSTOM in this.fluxActions);
                        assert(this.getDispatcher() == testDispatch);
                    }
                },
                //create instance with custom register method
                testCustomObj = new customClass(data, defaults);
            assert(testCustomObj.Actions().updateCustom);
        });
    });
    
    //if we don't have a test object
    if (!testObj) {
        //reject with error
        throw new Error("Missing testObj");
    }
    
    describe ('#addChangeListener()', function () {
        var newProp = 'firstName',
            newValue = 'Stiorra',
            changed = false;
        //add listener
        testObj.addChangeListener(function () {
            assert.equal(testObj.get(newProp), newValue);
            changed = true;
        });
        it ('Should call change handler on update', function () {
            testObj.Actions().update(testObj.get('id'), newProp, newValue);
            assert(changed);
        });
        it ('Should call the correct binding when two bindings of the same function are added', function () {
            var changed = {
                    1: false,
                    2: false
                },
                //create listeners
                listenerBase = function () {
                    changed[this.instance] = true;
                },
                listener1 = listenerBase.bind({instance: 1}),
                listener2 = listenerBase.bind({instance: 2}),
                //create new JC object
                newTestObj = new JCFluxStore (data, defaults);
            //add both listeners
            newTestObj.addChangeListener(listener1);
            newTestObj.addChangeListener(listener2);
            //make a change
            newTestObj.Actions().update(newTestObj.get('id'), {});
            //the both listeners should have been called
            assert(changed[1]);
            assert(changed[2]);
        });
    });
    
    describe ('#removeChangeListener()', function () {
        var notChanged = true,
            listener = function () {
                notChanged = false;
            };
        it ('Should not call removed change handler', function () {
            //add listener
            testObj.addChangeListener(listener);
            //remove listener
            testObj.removeChangeListener(listener);
            //update with data
            testObj.Actions().update(testObj.get('id'), {});
            assert(notChanged);
        });
        it ('Should remove the correct binding when two bindings of the same function are added', function () {
            var changed = {
                    1: false,
                    2: false
                },
                //create listeners
                listenerBase = function () {
                    assert(this.instance == 2);
                    changed[this.instance] = true;
                },
                listener1 = listenerBase.bind({instance: 1}),
                listener2 = listenerBase.bind({instance: 2}),
                //create new JC object
                newTestObj = new JCFluxStore (data, defaults);
            //add both listeners
            newTestObj.addChangeListener(listener1);
            newTestObj.addChangeListener(listener2);
            //remove the first listener
            newTestObj.removeChangeListener(listener1);
            //make a change
            newTestObj.Actions().update(newTestObj.get('id'), {});
            //the second listener should have been called, not the first
            assert(!changed[1]);
            assert(changed[2]);
        });
    });
    
    describe ('#destroy()', function () {
        it ('Should unregister listener from dispatcher', function () {
            //create new disaptcher
            var Dispatch = new Flux.Dispatcher(),
                //create new object
                newTestObj = new JCFluxStore(data, defaults, Dispatch),
                //get dispatch token
                dispatchToken = newTestObj._dispatchToken;
            //call destroy method
            newTestObj.destroy();
            //token should have been unregistered
            assert(!(dispatchToken in Dispatch._callbacks));
        });
        
        it ('Should remove all actions from store', function () {
            //create new object
            var newTestObj = new JCFluxStore(data, defaults);
            //call destroy method
            newTestObj.destroy();
            //actions should be gone
            assert(!newTestObj.Actions());
            assert(!newTestObj._AC);
            assert(!newTestObj.fluxActions);
        });
        
        it ('Should removed change handlers', function () {
            var notChanged = true,
                listener = function () {
                    assert(false);
                    notChanged = false;
                },
                //create new test object
                newTestObj = new JCFluxStore(data, defaults);
            //add listener
            newTestObj.addChangeListener(listener);
            //call destroy method
            newTestObj.destroy();
            //manually trigger change
            newTestObj.emitChange();
            //handler should not have been called
            assert(notChanged);
        });
        
    });
});

describe('FluxStore', function () {
    it ('Can be included', function () {
        var newStore = new FluxStore();
        assert(newStore && typeof newStore.emitChange == "function");
    });
});
