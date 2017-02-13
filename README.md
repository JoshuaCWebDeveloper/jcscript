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

Use `ClientService` to easily manage network requests

```
var Service = new ClientService ();
Service.get("http://www.example.com/api/employee/1").then(data => {
    Employee.update(data);
});
Service.ajax(
    "PUT",
    "http://www.example.com/api/employee/1",
    Employee.get(['firstName', 'lastName', 'title', 'projects'])
);
```

##API

###JCObject

A basic object class with getter and setter methods that can be inherited from when creating simple data stores.

#####constructor ([model])
- model (obj) An object of property names and default values 
              to use to create the object
        
#####<a name="jcobject-get"></a>get (prop)
Gets a property value.
- prop (string, array) The name(s) of the property(ies) to get
- returns (all) The property value, or an object of all properties requested

#####<a name="jcobject-update"></a>update (data[, val])
Updates with new data.
- data (obj, string) A collection of properties and new values to 
                     update OR the name of a single property to update  
- val (string) If data is string (single prop), the 
               value to update it to
- returns (obj) This

###JCFluxStore

A basic [Flux](https://facebook.github.io/flux/) store modeled by a JCObject with built-in actions and dispatcher.

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

#####addChangeListener (callback)
#####removeChangeListener (callback)
Add/remove a change listener that gets called when change events are triggered in the store.
- callback (func) The listener to register

####Built-In Actions

#####update (id, data[, val]) -> [JCFluxStore.update()](#jcflux-update)
- id (int) The id of the object to update
- Action parameters: data, val
- Action name: **UPDATE**

###ClientService

A service class for sending and handling network requests from clients with default functionality to automatically resend failed requests. This means that the service will wait for a successful HTTP status before resolving the returned promise while progressively waiting one second longer before each resend. The service can be configured to reject the returned promise instead of resending the request for specific HTTP statuses or all statuses. This configuration can be done globally or on a per request level. Authorization can also be handled by providing a value for the `Authorization` header and listening for invalid auth events. Requests are sent using [jQuery.ajax()](http://api.jquery.com/jquery.ajax/); settings properties to override those provided to jQuery.ajax() by default can be passed on a per request basis. Returned promises are from the [Q](https://github.com/kriskowal/q/wiki/API-Reference) library.

#####<a name="clientservice-constructor"></a>constructor ([auth, reject])
- auth (string) The value of an `Authorization` header to send with the request
- reject (int) An integer HTTP status code to reject a promise for by default
  + If a 4** or 5** code is received, the default behavior is to resend the request (waiting one second longer before each resend)
  + Any HTTP status codes passed will instead result in a rejection of the promise
- reject (array[int]) An array of integer HTTP status codes   
- reject (string) The string 'any' will reject the promise for all failed requests

#####setAuth (auth)
Sets the auth value for the service (see [ClientService.constructor()](#clientservice-constructor)).
- auth (string) The auth string to set

#####revokeAuth ()        
Revokes the current auth value.

#####setReject (reject)
Sets the default reject value for requests (see [ClientService.constructor()](#clientservice-constructor)).
- reject (string, int, array) The reject value to set

#####addInvalidAuthListener (callback)
#####removeInvalidAuthListener (callback)
Add/remove an invalid auth listener that gets called when the server invalidates the given auth string with a 401 HTTP status.
- callback (func) The listener to register, function will receive the body of the response as an argument

#####<a name="clientservice-ajax"></a>ajax (method, url[, data, serviceOptions, ajaxOptions])
Send AJAX request to url.
- method (string) The HTTP method to use (e.g. 'POST', 'DELETE', etc...)
- url (string)  The url to send the request to
- data (obj) A JavaScript object to be sent to the API 
  + (encoded as JSON if 'application/json' contentType -- default)
- serviceOptions (obj) Service property values to use for just this request (overrides default values)
  + ({auth, reject}, see [ClientService.constructor()](#clientservice-constructor)) 
- ajaxOptions (obj) Settings properties to pass to [jQuery.ajax()](http://api.jquery.com/jquery.ajax/) for this request (overrides settings set by service)
- returns (Q) A [Q](https://github.com/kriskowal/q/wiki/API-Reference) Promise
  + Resolved with (any) The body of the response parsed by jQuery.ajax()
  + Rejected with (array) The jqXHR object and the body of the response (parsed if JSON or XML)
  + Rejected with (string) If the call is cancelled while waiting to resend, the string "CANCELLED"

#####get (url[, params, serviceOptions, ajaxOptions])
Calls [ClientSerivce.ajax()](#clientservice-ajax) using `GET` method.
- url (string)  The url to send the request to.
- params (obj) A JavaScript object to be sent to the API as urlencoded string
- serviceOptions (obj) Service property values to use for just this request
- ajaxOptions (obj) Settings properties to pass to [jQuery.ajax()](http://api.jquery.com/jquery.ajax/) for this request
- returns (Q) A [Q](https://github.com/kriskowal/q/wiki/API-Reference) Promise

#####getLastCallId ()
Gets the call id of the most recent request.
- returns (string) The call id of the most recent request

#####cancel (callId)
Cancels a request with the given call id.
- callId (string) The call id of the request to cancel
