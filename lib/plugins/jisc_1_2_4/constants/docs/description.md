# Jisc UDD api
## Version 1.2.4
## Schema https://github.com/jiscdev/analytics-udd/releases/tag/v1.2.4

### About

A JSON intepratation of the API version can be returned through `GET /about`


### Soft Deletions (introduced v1.2.4)

All models in the UDD are soft deleted by default.

Upon a DELETE request, the model is cleared of none identifying data (fields are set to NULL unless primary key, e.g. `STUDENT_ID` in Student) and is no longer returned or amendable by standard requests.

To retrieve or update soft deleted models, use the `trashed` query parameter in your request.

`GET /student?trashed=1`

The deletion date is stored in the DELETED_AT field. This can be queried like any other date field:

`GET /student?trashed=1&query={"DELETED_AT": {"$gte": "2016-01-01 00:00"}}`

In order to permanently delete a model (remove it from the database), use the `force` query parameter:

`DELETE /student/:id?force=1`

If your model has previously been soft deleted, you would need to combine this with the `trashed` query parameter, otherwise it will not be found:

`DELETE /student/:id?force=1&trashed=1`

To restore a model, send a PATCH request to update the model and set the `deleted` field to null. It is *not* compulsory to remove the DELETED_AT field in case you wish to keep this field for analytical purposes.

```
PATCH /student/:id
{
  "deleted": false,
  "DELETED_AT": null // optional
}
```

_Note that using DELETE in api versions prior to the introduction of soft deletes will cause the model to be permanently removed from the database._

### Sort

`GET /student?sort=name`

`GET /student?sort=-name`

`GET /student?sort={"name":1}`

`GET /student?sort={"name":0}`


### Skip

`GET /student?skip=10`


### Limit
Only overrides options.limit if the queried limit is lower.

`GET /student?limit=10`


### Query
Supports all operators ($regex, $gt, $gte, $lt, $lte, $ne, etc.) as well as shorthands: ~, >, >=, <, <=, !=

`GET /student?query={"STUDENT_ID":"STUDENT_1"}`

`GET /student?query={"STUDENT_ID":{"$regex":"^(STUDENT)"}}`

`GET /student?query={"STUDENT_ID":"~^(STUDENT_1)"}`

`GET /student?query={"PARENTS_ED":{"$gt":2}}`

`GET /student?query={"PARENTS_ED":">2"}`

`GET /student?query={"PARENTS_ED":{"$gte":2}}`

`GET /student?query={"PARENTS_ED":">=2"}`

`GET /student?query={"PARENTS_ED":{"$lt":2}}`

`GET /student?query={"PARENTS_ED":"<2"}`

`GET /student?query={"PARENTS_ED":{"$lte":2}}`

`GET /student?query={"PARENTS_ED":"<=2"}`

`GET /student?query={"PARENTS_ED":{"$ne":2}}`

`GET /student?query={"PARENTS_ED":"!=2"}`


### Populate
Works with create, read and update operations.
Relations are available as a lower camel cased version of the property
e.g. Student relation to StudentModuleInstance is available as student.studentModuleInstances


`GET/POST/PUT /student?populate=tutor`

`GET/POST/PUT /student?populate={"path":"tutor"}`

`GET/POST/PUT /student?populate=[{"path":"tutor"},{"path":"studentModuleInstances"}]`

`GET/POST/PUT /student?populate=[{"path":"customer"},{"path":"products"}]`


Can be nested to fetch relations of relations

`GET/POST/PUT /student?populate={"path":"tutor","populate":{"path":"staffModuleInstances","model":"StaffModuleInstance"}}`

### Select
`GET /student?select=PARENTS_ED`

`GET /student?select=-PARENTS_ED`

`GET /student?select={"PARENTS_ED":1}`

`GET /student?select={"PARENTS_ED":0}`
