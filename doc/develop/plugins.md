# Plugins

When the method of a store is invoked, a **context** is created. The context is
just an object with the method parameters, such as the new annotation in the
case of `create` or the lookup ID in the case of `get`, as well as metadata
pertinent to the annotation.

Plugins can be registered to intercept the context at specific points in the
processing lifecycle, currently `pre` and `post`.

Plugins hooking into the `pre` phase can augment the context with additional
metadata or prevent further processing if certain conditions are met. Plugins
hooking into the `post` phase can access and modify the context after the method has been
dispatched.

Examples where plugins are useful:

* Validation: Detect invalid arguments for an operation
* Authentication: Inject a user id from a session into the context
* Authorization: Determine whether the calling user is may execute this
  operation.
* User lookup: Provide user details from an external data source, such as the
  display name.
* Notification: Send an e-mail for new annotations

## Registering plugins

To register plugins, add them to the `ANNO_PLUGINS_PRE` / `ANNO_PLUGINS_POST`
config variables. The syntax is `<module>[:<export>]`:

* `mod1:AuthPlugin` will use the function exported as `AuthPlugin` from a module `mod1`
* `mod1` will use the default export of module `mod1` as the plugin

