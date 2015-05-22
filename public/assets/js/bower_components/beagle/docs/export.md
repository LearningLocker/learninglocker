# Beagle
## Routes
```coffee
bazRoutes = beagle.routes({
    # Accepts a path if it is exactly 'hello'.
    'hello': (params, path) ->
        console.log('baz/hello', params, path, params.joe, params.id)
})

myRoutes = beagle.routes({
    # Accepts paths that start with 'foo'.
    'foo/*': (params, path) ->
        console.log('foo/*', params, path, params.joe)

    # Accepts paths that start with 'user' followed by an id.
    'user/:id': (params, path) ->
        console.log('user/:id', params, path, params.joe, params.id)

    # Accepts a path if it is exactly 'bar'.
    'bar': (params, path) ->
        console.log('bar', params, path, params.joe)

    # Accepts paths that start with 'baz' followed by an id.
    # The rest of the path is passed to bazRoutes.
    'baz/:id/*': bazRoutes
}, {
    # If the id param exists then this function can modify the id.
    'id': (id, params) ->
        console.log(id, params)
        return id
})
```

## Walk
```coffee
# When hash changes myRoutes will be looked through.
# The given object below (second argument) will be the default params.
beagle.walk(myRoutes, {
    'joe': 'bloggs'
})
```
