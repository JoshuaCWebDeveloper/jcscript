/* JCObject.test.js
 * Tests JCObject
 * Dependencies: assert, extend, Q modules, mocha context
 * Author: Joshua Carter
 * Created: November 6, 2016
 */
"use strict";
//include dependencies
var assert = require('assert'),
    extend = require('extend'),
    JCObject = require('../build/index').JCObject,
    Q = require('q');

//begin mocha tests
describe('JCObject', function () {
    //define data to use for testing
    var defaults = {
            firstName: '',
            lastName: '',
            years: 0
        },
        data = {
            id: 345,
            firstName: 'Joshua',
            lastName: 'Carter',
            years: 2
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
        it ('Should fetch a single given property', function () {
            //new object
            var newObj = new JCObject(defaults);
            //get single prop
            assert.equal(newObj.get("firstName"), defaults.firstName);
        });
        it ('Should return an object when given an array', function () {
            //get data
            var foundData = testObj.get(Object.keys(defaults));
            //check data
            for (var prop in defaults) {
                assert.equal(foundData[prop], defaults[prop]);
            }
        });
        it ('Should return all properties by default', function () {
            //new object
            var newObj = new JCObject(defaults),
                //get data
                foundData = newObj.get();
            //should return all data
            assert.equal(Object.keys(foundData).length, Object.keys(data).length);
            //check data
            for (var prop in defaults) {
                assert.equal(foundData[prop], defaults[prop]);
            }
        });
        it ('Should return copies of object values', function () {
            //copy data
            var thisData = extend({
                    projects: {
                        1: 'JCScript',
                        2: 'EvilAI'
                    }
                }, data),
                //copy defaults
                thisDefaults = extend({
                    projects: {}
                }, defaults),
                //new object
                newObj = new JCObject(thisDefaults),
                thisProj = {};
            //update with data
            newObj.update(thisData);
            //get projects
            thisProj = newObj.get("projects");
            //change object value
            thisProj["2"] = "NewAPI";
            //should not have changed
            assert.equal(newObj.get("projects")["2"], thisData.projects["2"]);
        });
        it ('Should return copies of array values', function () {
            //copy data
            var thisData = extend({
                    projects: ['JCScript', 'EvilAI']
                }, data),
                //copy defaults
                thisDefaults = extend({
                    projects: []
                }, defaults),
                //new object
                newObj = new JCObject(thisDefaults),
                thisProj = {};
            //update with data
            newObj.update(thisData);
            //get projects
            thisProj = newObj.get("projects");
            //change object value
            thisProj[1] = "NewAPI";
            //should not have changed
            assert.equal(newObj.get("projects")[1], thisData.projects[1]);
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
        it ('Should not affect properties not defined in model', function () {
            //create new
            var newObj = new JCObject(defaults);
            //custom prop
            newObj.customProp = 1;
            //udpate
            newObj.update("customProp", 2);
            //should not have changed
            assert(newObj.customProp == 1);
        });
        it ('Should be able to update properties that are currently undefined', function () {
            //create some defaults
            var model = {
                    name: undefined
                },
                //new objwect
                newObj = new JCObject(model);
            //udpate
            newObj.update("name", 3);
            //should now be undefined
            assert.equal(newObj.get("name"), 3);
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
