/* JCObject.js
 * Tests JCObject
 * Dependencies: assert, Q modules, mocha context
 * Author: Joshua Carter
 * Created: November 6, 2016
 */
"use strict";
//include dependencies
var assert = require('assert'),
    JCObject = require('../build/index').JCObject,
    Q = require('q');

//begin mocha tests
describe('JCObject', function () {
    //define data to use for testing
    var defaults = {
            firstName: '',
            lastName: '',
            projects: {}
        },
        data = {
            firstName: 'Joshua',
            lastName: 'Carter',
            projects: {
                1: 'JCScript',
                2: 'EvilAI'
            }
        },
        testObj;
    
    describe('#Construction', function () {
        //create new JC object
        testObj = new JCObject (defaults);
        it ('Should instantiate with properties and default values', function () {
            //check defaults
            for (var prop in defaults) {
                assert.strictEqual(testObj.get(prop), defaults[prop]);
            }
        });
        it ('Should generate an id', function () {
            assert(testObj.get('id'));
        });
    });
    
    //if we don't have a test object
    if (!testObj) {
        //reject with error
        throw new Error("Missing testObj");
    }
    
    describe ('#get()', function () {
        it ('Should return an object from a given array', function () {
            //get data
            var foundData = testObj.get(Object.keys(data));
            //check data
            for (var prop in data) {
                assert.equal(foundData[prop], defaults[prop]);
            }
        });
    });
        
    describe ('#update()', function () {
        var newProp = 'firstName',
            newValue = 'Stiorra',
            fromUpdate;
        it ('Should accept new data from given object', function () {
            //update with data
            testObj.update(data);
            //check data
            for (var prop in data) {
                assert.equal(testObj.get(prop), data[prop]);
            }
        });
        it ('Should accept a single new value', function () {
            //update single value, store result
            fromUpdate = testObj.update(newProp, newValue);
            assert.equal(testObj.get(newProp), newValue);
        });
        it ('Should return `this`', function () {
            assert.equal(fromUpdate, testObj);
        });
    });
    
    describe ('#reset()', function () {
        it ('Should reset a single value', function () {
            //create new
            var newObj = new JCObject(defaults);
            //udpate
            newObj.update(data);
            //reset
            newObj.reset('firstName');
            //should be reset
            assert(newObj.get('firstName') == defaults.firstName);
        });
        it ('Should reset multiple values', function () {
            //create new
            var newObj = new JCObject(defaults),
                toReset = ['firstName', 'lastName'];
            //udpate
            newObj.update(data);
            //reset
            newObj.reset(toReset);
            //should be reset
            for (var i=0; i<toReset.length; i++) {
                assert(newObj.get(toReset[i]) == defaults[toReset[i]]);
            }
        });
        it ('Should reset all values by default', function () {
            //create new
            var newObj = new JCObject(defaults);
            //udpate
            newObj.update(data);
            //reset all
            newObj.reset();
           //should be reset
            for (var prop in defaults) {
                assert(newObj.get(prop) == defaults[prop]);
            }
        });
    });
    
});
