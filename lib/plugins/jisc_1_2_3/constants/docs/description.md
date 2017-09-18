# Jisc UDD api
## Version 1.2.3
## Schema https://github.com/jiscdev/analytics-udd/releases/tag/v1.2.3

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
