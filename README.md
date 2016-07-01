JCScript
====

This is a collection of JavaScripts to aid in the development of JS projects

##Installation/Setup
Run:

`npm install git+https://github.com/JoshuaCWebDeveloper/jcscript.git`

Then, in your script:

`import { JCObject } from 'jcscript'`

##API

###JCObject

A basic object class with getter and setter methods that can be inherited from when creating simple data stores.

#####get (prop)
gets a property value
- prop (string, array) The name(s) of the property(ies) to get
- returns (all) The property value, or an object of all properties requested

#####update (data, val)
updates with new data
- data (obj, string) A collection of properties and new values to 
                     update OR the name of a single property to update  
- val (string -- optional) If data is string (single prop), the 
                           value to update it to
- returns (obj) This

