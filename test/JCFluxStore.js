/* JCFluxStore.js
 * Tests JCFluxStore
 * Dependencies: assert, Q modules, mocha context
 * Author: Joshua Carter
 * Created: November 6, 2016
 */
"use strict";
//include dependencies
var assert = require('assert'),
    JCFluxStore = require('../build/index').JCFluxStore,
    Q = require('q');

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
    });
    
    //if we don't have a test object
    if (!testObj) {
        //reject with error
        throw new Error("Missing testObj");
    }
    
    describe ('#addChangeListener()', function () {
        var newProp = 'firstName',
            newValue = 'Stiorra';
        //add listener
        testObj.addChangeListener(function () {
            assert.equal(testObj.get(newProp), newValue);
        });
        it ('Should call change handler on update', function () {
            testObj.Actions().update(newProp, newValue);
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
