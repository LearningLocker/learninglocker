Format based on [Keep a Changelog](http://keepachangelog.com/)

## [unreleased]
### Added
  - Prevents deleting a role if assigned to a user, added error alerts ([#LL-353](https://ht2labs.myjetbrains.com/youtrack/issue/LL-353))

### Changed
### Deprecated
### Removed
### Fixed
 - Client auth not working with some APIs
### Security
### Migrations

## [2.0.1] - 2017-09-25
### Added
### Changed
### Deprecated
### Removed
### Fixed
 - Adds VERSION file
### Security
### Migrations

## [2.4.3] - 2017-09-11
### Added
### Changed
### Deprecated
### Removed
### Fixed
 - Removed $match from StatementForwarder default query ([#LL-387](https://ht2labs.myjetbrains.com/youtrack/issue/LL-387))
### Security
### Migrations

## [2.4.2] - 2017-09-04
### Added
### Changed
 - Added no auth to statement forwarding and change statement forwarding to retry 3 times with 1 hour delay ([#LL-382](https://ht2labs.myjetbrains.com/youtrack/issue/LL-382))
### Deprecated
### Removed
### Fixed
 - Embedded dashboards don't show any data ([#LL-380](https://ht2labs.myjetbrains.com/youtrack/issue/LL-380))
### Security
### Migrations
 - Delete the STATEMENT_FORWARDING_REQEUST_QUEUE in order to apply new settings

## [2.4.1] - 2017-08-08
### Added
### Changed
### Deprecated
### Removed
### Fixed
 - API responses were being cached in IE leading to strange behaviours ([#LL-351](https://ht2labs.myjetbrains.com/youtrack/issue/LL-351))
 - Checkboxes on roles page are orange again ([#LL-352](https://ht2labs.myjetbrains.com/youtrack/issue/LL-352))
 - Reverted right to left text orders on drop down list to fix problem with punctuation placement ([#LL-296](https://ht2labs.myjetbrains.com/youtrack/issue/LL-296))
 - Couldn't download exports if not super admin ([#LL-344](https://ht2labs.myjetbrains.com/youtrack/issue/LL-344))
 - Per series colour picker in visualisations ([#LL-327](https://ht2labs.myjetbrains.com/youtrack/issue/LL-327))
### Security
### Migrations
 - Added migration to update download paths ([#LL-344](https://ht2labs.myjetbrains.com/youtrack/issue/LL-344))
   - `node cli/dist/server migrateDownloadPaths`

## [2.4.0] - 2017-07-25
### Added
 - Added new roles and permissions. Added per user statement filters, allows an admin to restrict a user to viewing a subset of data. E.g. just statements from their team  ([#LL-163](https://ht2labs.myjetbrains.com/youtrack/issue/LL-163))
 - Fixed fonts not being loaded into IE ([#LL-250](https://ht2labs.myjetbrains.com/youtrack/issue/LL-250))
 - UI indication of save complete ([#LL-18](https://ht2labs.myjetbrains.com/youtrack/issue/LL-18))
 - Statement forwarding ([#LL-239](https://ht2labs.myjetbrains.com/youtrack/issue/LL-239))
### Changed
  - Could delete the last remaining role ([#LL-339](https://ht2labs.myjetbrains.com/youtrack/issue/LL-339))
  - Allowed queries to go back to 2 years ([#LL-302](https://ht2labs.myjetbrains.com/youtrack/issue/LL-302))
### Deprecated
### Removed
### Fixed
 - Manage organisations scope didn't work ([#LL-340](https://ht2labs.myjetbrains.com/youtrack/issue/LL-340))
 - Couldn't invite existing users to new organisations ([#LL-325](https://ht2labs.myjetbrains.com/youtrack/issue/LL-325))
 - HTML appearing in invite emails ([#LL-180](https://ht2labs.myjetbrains.com/youtrack/issue/LL-180))
 - Merging complex queries sometimes failed ([#LL-179](https://ht2labs.myjetbrains.com/youtrack/issue/LL-180))
### Security
### Migrations
 - Adds roles to the database ([#LL-163](https://ht2labs.myjetbrains.com/youtrack/issue/LL-163))
   - `node cli/dist/server migrateScopesToRoles`
 - Add sub querybuildercache
   - `node cli/dist/server migrateQueryBuilderCachesPath`

## [2.3.10] - 2017-07
### Fixed
 - Searching additional data across personas ([#LL-305](https://ht2labs.myjetbrains.com/youtrack/issue/LL-305))

## [2.3.9] - 2017-06-27
### Added
 - AWS Cloudwatch logging via Winston
### Fixed
 - JISC assessmentInstance relations ([#LL-297](https://ht2labs.myjetbrains.com/youtrack/issue/LL-297))

## [2.3.8] - 2017-06-14
### Added
 - More filtering on Result (score etc) ([#LL-184](https://ht2labs.myjetbrains.com/youtrack/issue/LL-184), [#LL-266](https://ht2labs.myjetbrains.com/youtrack/issue/LL-266))
 - Speed improvements to xAPI Redis handling  ([#LL-260](https://ht2labs.myjetbrains.com/youtrack/issue/LL-260))
 - New Relic custom attributes  ([#LL-234](https://ht2labs.myjetbrains.com/youtrack/issue/LL-234))
 - Group on contextAttributes in visualisations  ([#LL-221](https://ht2labs.myjetbrains.com/youtrack/issue/LL-221))
 - Editing of axes names in visualisations ([#LL-149](https://ht2labs.myjetbrains.com/youtrack/issue/LL-149), [#LL-272](https://ht2labs.myjetbrains.com/youtrack/issue/LL-272))
### Fixed
 - Allowed dashboard wigets to be thinner ([#LL-24](https://ht2labs.myjetbrains.com/youtrack/issue/LL-24))
 - Fixed long names overflowing in lists ([#LL-222](https://ht2labs.myjetbrains.com/youtrack/issue/LL-222))
 - Changed query date selector to use react toolbox date selector ([#LL-93](https://ht2labs.myjetbrains.com/youtrack/issue/LL-93))
 - Pagination of models wasn't handeling deleting. ([#LL-217](https://ht2labs.myjetbrains.com/youtrack/issue/LL-217))
 - Fixed selecting dropdown options with a single click ([#LL-238](https://ht2labs.myjetbrains.com/youtrack/issue/LL-238))
 - Correlation graphs ([#LL-237](https://ht2labs.myjetbrains.com/youtrack/issue/LL-237))
 - Type filtering of drop down select boxes (e.g. exports, saved queries) ([#LL-257](https://ht2labs.myjetbrains.com/youtrack/issue/LL-257))
### Migrations
 - Migrate axes on visualisations ([#LL-246](https://ht2labs.myjetbrains.com/youtrack/issue/LL-246))
   - `node cli/dist/server migrateVisualiseAxes`


## [2.3.7] - 2017-05-17
### Added
 - Snapshot tests for UI components
### Changed
 - Added a link to the help centre to the bottom of the side navigation bar ([#LL-198](https://ht2labs.myjetbrains.com/youtrack/issue/LL-198))
### Fixed
 - Export deletion issues  ([#LL-167](https://ht2labs.myjetbrains.com/youtrack/issue/LL-167))
 - Couldn't update authority properly under for clients ([#LL-212](https://ht2labs.myjetbrains.com/youtrack/issue/LL-212))
 - Journey recalculation sometimes reported as unfinished ([#LL-145](https://ht2labs.myjetbrains.com/youtrack/issue/LL-145))
 - Problems updating some queries when in Journey waypoints ([#LL-210](https://ht2labs.myjetbrains.com/youtrack/issue/LL-210))
### Security

## [2.3.6] - 2017-05-09
### Fixed
 - Embedded dashboards loading issue ([#LL-211](https://ht2labs.myjetbrains.com/youtrack/issue/LL-211))

## [2.3.5] - 2017-05-05
### Changed
 - Make Google Authentication optional at the .env level ([#LL-206](https://ht2labs.myjetbrains.com/youtrack/issue/LL-206))
### Fixed
 - Use of redis/bull for queues
 - Can't change axes or series when editing visualisations ([#LL-202](https://ht2labs.myjetbrains.com/youtrack/issue/LL-202))
 - Can't set a site admin ([#LL-200](https://ht2labs.myjetbrains.com/youtrack/issue/LL-200))

## [2.3.4] - 2017-04-28
### Fixed
 - Embedded dashboard aggregations return 403s after initial day of use ([#LL-185](https://ht2labs.myjetbrains.com/youtrack/issue/LL-185))
 - Can't open user ModelListItem in "All Users" (super admin) ([#LL-186](https://ht2labs.myjetbrains.com/youtrack/issue/LL-186))
 - Persona merge facility - cannot do last step ([#LL-193](https://ht2labs.myjetbrains.com/youtrack/issue/LL-193))

## [2.3.3] - 2017-04-27
### Fixed
 - Can't use query builder in visualisations ([#LL-196](https://ht2labs.myjetbrains.com/youtrack/issue/LL-196))
 - Column visualisations cannot be made ([#LL-192](https://ht2labs.myjetbrains.com/youtrack/issue/LL-192))
 - Wrong S3 config for storage in SaaS ([#LL-194](https://ht2labs.myjetbrains.com/youtrack/issue/LL-194))

## [2.3.2] - 2017-04-25
### Added
### Changed
### Deprecated
### Removed
### Fixed
 - Manage Persona sorting correctly set to descending on createdAt ([#LL-188](https://ht2labs.myjetbrains.com/youtrack/issue/LL-188))
### Security

## [2.3.1] - 2017-04-24
### Added
### Changed
 - New queries or exports are selected automatically ([#LL-167](https://ht2labs.myjetbrains.com/youtrack/issue/LL-167))
### Deprecated
### Removed
### Fixed
 - The currently selected export and query can be deleted ([#LL-167](https://ht2labs.myjetbrains.com/youtrack/issue/LL-167))
 - Empty values can no longer be added to the query builder ([#LL-177](https://ht2labs.myjetbrains.com/youtrack/issue/LL-177))
 - Connection namespacing ([#LL-171](https://ht2labs.myjetbrains.com/youtrack/issue/LL-171))
 - Searching in Persona merge ([#LL-170](https://ht2labs.myjetbrains.com/youtrack/issue/LL-170))

### Security

## [2.3.0.4] - 2017-04-11
### Fixed
 - Newly created orgs didn't show until user logged out and in ([#LL-172](https://ht2labs.myjetbrains.com/youtrack/issue/LL-172))
 - Allow from headers in embeddable dashboards ([#LL-169](https://ht2labs.myjetbrains.com/youtrack/issue/LL-169))

## [2.3.0.1] - 2017-04-04
### Fixed
 - Icons being replaced with text in some places ([#LL-166](https://ht2labs.myjetbrains.com/youtrack/issue/LL-166))

## [2.3.0] - 2017-04-04
### Added
- Embedded dashboards. Can be shared anywhere or with specific domains ([#LL-60](https://ht2labs.myjetbrains.com/youtrack/issue/LL-60))
- Saved queries. Can be partially or completely applied.
- Search to login page for people with a lot of organisations
- Logging into an org directly by going to the route if you are already logged in
- A more fine grained scoping layer to prepare for 2.4
- Owner and created at are always visible on models
- Added query editor to the export ui, this is a temporary feature while we work on improving exports

### Changed
- Allow up to 500,000 records in an export, was 100,000
- Smarter logic around data fetching resulting in less server load and faster time to data (debouncing, preventing duplicate requests)
- Assets now chunked into per page bundles, you don’t have to load the whole site to see a single page

### Fixed
- Scrolling down really far in a journey visualisation sometimes stopped loading more results
- Removing a user from an organisation could actually delete them
- Setting a Journey to inactive wouldn’t actually stop it processing new statements ([#LL-139](https://ht2labs.myjetbrains.com/youtrack/issue/LL-139))
