JCScript
====

This is a collection of JavaScripts to aid in the development of JS projects

##Installation/Setup
Run:

`npm install jcscript`

Then, in your script:

```
import JCScript from 'jcscript';
var JCObject = JCScript.JCObject;
```
-- OR -- 

`import { JCObject } from 'jcscript'`

## Examples

Use `JCObject` to create and access a simple object

```
/* Create new Employee using default values */
var Employee= new JCObject ({
    firstName: '',
    lastName: '',
    title: '',
    projects: {}
});
/* Populate with some data */
Employee.update({
    firstName: Joshua,
    lastName: Carter,
    title: Jr. Web Developer
});


/* Later in your code */
var name = Employee.get(['firstName', 'lastName']).join(' ');
Employee.update('title', 'Core Application Developer');

```

You can also use ES6 classes

```
/* Create Employee class */
var Employee= class extends JCObject {
    constructor (data) {
        /* Create model */
        super({
            firstName: '',
            lastName: '',
            title: '',
            projects: {}
        });
        //populate with data
        this.update(data);
    }
};
/* Create Employee */
var Joshua = new Employee({
    firstName: Joshua,
    lastName: Carter,
    title: Jr. Web Developer
});
```

Use `JCFluxStore` to do the same thing with a [Flux](https://facebook.github.io/flux/) model

```
/* Create new Employee using default values */
var Employee= new JCFluxStore({
    firstName: Joshua,
    lastName: Carter,
    title: Jr. Web Developer
}, {
    firstName: '',
    lastName: '',
    title: '',
    projects: {}
});


/* Later in your code */
Employee.addChangeListener(function () {
    $("#name").text(Employee.get(['firstName', 'lastName']).join(' '));
    $("#title").text(Employee.get('title'));
});

$("#promote").on('click', function (e) {
    Employee.Actions().update(Employee.get('id'), 'title', 'Core Application Developer');
});
```

##API

###JCObject

A basic object class with getter and setter methods that can be inherited from when creating simple data stores.

#####constructor ([model])
- model (obj) An object of property names and default values 
              to use to create the object
        
#####<a name="jcobject-get"></a>get (prop)
gets a property value
- prop (string, array) The name(s) of the property(ies) to get
- returns (all) The property value, or an object of all properties requested

#####<a name="jcobject-update"></a>update (data[, val])
updates with new data
- data (obj, string) A collection of properties and new values to 
                     update OR the name of a single property to update  
- val (string) If data is string (single prop), the 
               value to update it to
- returns (obj) This

###JCFluxStore

Aa basic [Flux](https://facebook.github.io/flux/) store modeled by a JCObject with built-in actions and dispatcher.

#####constructor ([data, defaults, Dispatch, Actions, AC])
- data (obj) A collection of properties and values to populate the store with
- defaults (obj) An object of property names and default values to use to create the store
- Dispatch (Flux.Dispatcher) A Flux dispatcher to use instead of the built-in
- Actions (obj) An object of Flux actions to make available instead of the built-in
- AC (obj) An object of Flux action values to use instead of the built-in
        
#####get (prop)
[JCObject.get()](#jcobject-get)

#####<a name="jcflux-update"></a>update (data[, val]) -- *Triggers Change Event*
[JCObject.update()](#jcobject-update)

####Built-In Actions

#####update (id, data[, val]) -> [JCFluxStore.update()](#jcflux-update)
- id (int) The id of the object to update
- Action parameters: data, val
- Action name: **UPDATE**
