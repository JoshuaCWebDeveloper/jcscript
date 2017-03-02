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
            var testDispatch = new Flux.Dispatcher(),
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
                        super (data, defaults, testDispatch, testActions, {UPDATE_CUSTOM: 12});
                        this.RegisterCustomDispatch();
                    }
                    
                    RegisterCustomDispatch () {
                        assert(this._AC.UPDATE_CUSTOM == 12);
                        assert(this._Dispatch == testDispatch);
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
            testObj.Actions().update({});
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
