Format based on [Keep a Changelog](http://keepachangelog.com/)

## [unreleased]
### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security
### Migrations

## [2.5.1]
### Fixed
  - Empty filter in series accesible via shareable dashboards
  - API crash when passed a malformed ID

## [2.5.0]
### Added
  - Node 8 support (#1131)
  - Button to copy shareable link (#1190)
  - Shareable dashboard dynamic filtering (#1177)
  - Can delete uncompleted exports (#1184)
### Fixes
  - Fixes freeze when uploading org logo (#1179)
  - Changed order of persona imports (#1182)
  - Adjusted worker garbage collection (#1186)
  - Better logging of queue subscription errors (#1180)
  - Editing export projection now requires submit action (#1185)

## [2.4.2]
### Fixes
  - Worker garbage collection (#1214)
  - Efficiencies for requeuing statements (#1216)
  - Remove max memory restart values for PM2 and replace with garbage collection on all services

## [2.4.1]
### Fixes
  - Speeds up worker requests with SQS
  - Better error handling and logging for statementForwards (#1196)
  - Deadletter queue prefix fix (#1187)
    - Please note that you will need to clear down the existing SQS queues in order to amend the redrive policy
  - Worker garbage collection (#1195)

## [2.4.0]
### Fixes
  - Logs out the user when their token has expired (#1167)
  - Deleted dashboard bug (#1142)
  - Existing personas' names updated via CSV import (#1143)
  - Highlighting on nested query builder entries (#1149)
### Added
  - Upgraded mongoose (v5) (#1132)
  - Organisation, store and client deletions logged into new `audits` collection (#1132)
  - Registration prompt on home screen (#1165)

## [2.3.6]
### Fixed
  - Client can patch users fully (#1188)

## [2.3.5]
### Fixed
  - Persona Error CSV Downloading (#1174)
  - Persona Upload Lock Timeouts (#1176)

## [2.3.4]
### Fixed
  - Larger nginx buffer size (#1170)

## [2.3.3]
### Fixed
  - Legacy shareable dashboard links respect filters (#1162)

## [2.3.2]
### Fixed
  - Check persona and attribute exists before creating (#1153)

## [2.3.1]
### Fixed
  - Respect organisation creation scope (#1153)
  
## [2.3.0]
### Added
  - Multiple shareable links per dashboard (#1096)
    - Requires migration to be run - `yarn migrate`
  - Aggregations now can read from secondary members on replica set (#1095)
  - Sentinel Redis support (#1119)
  - New role to allow organisation creation (via site admin) (#1110)
  - Widgets now auto pick visualisation name when populated (#1126)
### Security
  - Passwords can only be changed for the user logged in or by site admins (#1112)
### Fixes
  - Unicode data now pulled from dependency (#1125)
  - Ensure order on personaIdentifier IFI values (fixes issue with multiple personaIdents for the same actor) (#1120)
  - Fix for personaIdentifier migration
  - Client can select more than 10 xAPI stores (#1130)
  - Server side validation of Statement Forward queries (#1138)
  - Statement forwards decode `&46;` in statement keys (#1134)
  - Fixed issue with hanging file imports on persona data (#1141)
  - Switch to `clamdscan` as primary AV scanner (#1141)
    - Requires updated .env settings - refer to .env.example
### Performance and build
  - Webpack 3 - improved build speed (#1094)
### Migrations
**This update requires a migration which can be run using `yarn migrate`.**

## [2.2.4]
### Fixes
  - Server side validation of Statement Forward queries (#1138)
  - Persona import errors if there are no iris. (#1140)
  - Workers handle errors on missing personas (#1137)
  - Workers handle errors on invalid JSON in statement forward callbacks (#1137)

## [2.2.3]
### Fixes
  - Persona Attribute and Identifier APIs now parse $oid values for `persona` filters (#1133)
  
## [2.2.2]
### Fixes
  - Cast `SMTP_SECURED` boolean flag ([Github #1117](https://github.com/LearningLocker/learninglocker/issues/1117)) ([#LL-510](https://ht2labs.myjetbrains.com/youtrack/issue/LL-510))
### Added
  - `SMTP_IGNORE_TLS` and `SMTP_REQUIRE_TLS` env flags (https://nodemailer.com/smtp/#tls-options)

## [2.2.1]
### Fixes
  - Ensures order on personaIdentifier IFIs 

## [2.2.0]
### Added
  - Override system email address ([#1029](https://github.com/LearningLocker/learninglocker/pull/1029)) (thanks to [@eashman](https://github.com/eashman))
  - Google cloud services 
    - Storage
      - Requires the Cloud Storage JSON API to be enabled for your Google Cloud project
      - New environment configs:
        - `FS_GOOGLE_CLOUD_KEY_FILENAME` 
          - Path to your Service account key JSON file. Must be configured to allow read/write/delete to your Cloud Storage bucket
        - `FS_GOOGLE_CLOUD_PROJECT_ID` - Project ID
        - `FS_GOOGLE_CLOUD_BUCKET` - Bucket name
    - PubSub queues
      - Requires PubSub API to be enabled for your Google Cloud project
      - New environment configs:
        - `PUBSUB_GOOGLE_CLOUD_KEY_FILENAME` 
          - Path to your Service account key JSON file. Must be configured to allow read/write/delete to your Cloud Storage bucket
        - `PUBSUB_GOOGLE_CLOUD_PROJECT_ID` - Project ID
        - `PUBSUB_GOOGLE_CLOUD_SUBSCRIPTION_NAME` - Pubsub subscription name (defaults to `ll`)
### Fixed
  - "Go to visualisation" from dashboard widget ([#1034](https://github.com/LearningLocker/learninglocker/pull/1034)) (thanks to [@eashman](https://github.com/eashman))
  - Hide the source and results before visualisation type is picked
### Personas refactor
  - Personas, identifiers and their attributes split into separate models
  - Provides much more control over identifiers and attributes via the API and UI
  - Improved CSV upload tool
  - Improved persona creation performance
### Migrations
This update requires a migration which can be run using `yarn migrate`. If installing via the deploy script this will automatically be done.

## [2.1.4] - 2018-02-19
### Fixed
  - Fix for sending secured SMTP emails

## [2.1.3] - 2018-01-15
### Added
  - Ensures `timestamp` and `stored` are selected over `statement.timestamp` and `statement.stored` in parsed queries

## [2.1.2] - 2018-01-02
### Fixed
  - `GOOGLE_ENABLED` .env value no longer compiled into API build and can be updated in the .env, followed by a restart of the API
  - Better error handling in migrations
  - Missing icons in Safari and Edge

## [2.1.1] - 2017-12-19
### Fixed
  - Arrays in statement API response were being converted to keys

## [2.1.0] - 2017-11-23
### Added
  - Migration funcionality ([#LL-395](https://ht2labs.myjetbrains.com/youtrack/issue/LL-395))
  - Can now set the max times statement forwarding will retry.
  - Legend added to X vs Y charts ([#LL-322](https://ht2labs.myjetbrains.com/youtrack/issue/LL-322))
  - Prevents deleting a role if assigned to a user, added error alerts ([#LL-353](https://ht2labs.myjetbrains.com/youtrack/issue/LL-353))
  - User integration tests
### Fixed
 - Client auth not working with some APIs ([#LL-367](https://ht2labs.myjetbrains.com/youtrack/issue/LL-367))
### Changed
 - Only allow sensible combinations of roles

## [2.0.7] - 2017-11-08
### Fixes
 - Couldn't see some visualisations when printing


## [2.0.6] - 2017-10-26
### Security
  - Ensure all dashboards can load ([#LL-423](https://ht2labs.myjetbrains.com/youtrack/issue/LL-423))


## [2.0.5] - 2017-10-23
### Security
  - Non super admin users unable to create new organisation ([#LL-415](https://ht2labs.myjetbrains.com/youtrack/issue/LL-415))
  - Clients with appropriate scopes could not request certain models
  - Clients without appropriate scopes can no longer see certain models
  - Prevent admins of one organisation amending anothers


## [2.0.4] - 2017-10-12
### Added
### Changed
### Deprecated
### Removed
### Fixed
  - Statement forwarding queries not matching. ([#LL-414](https://ht2labs.myjetbrains.com/youtrack/issue/LL-414))
### Security
### Migrations

## [2.0.3] - 2017-10-11
### Added
### Changed
### Deprecated
### Removed
### Fixed
  - Repeating failed requests. ([#LL-411](https://ht2labs.myjetbrains.com/youtrack/issue/LL-411))
  - Not being able to delete the last model ([#LL-412](https://ht2labs.myjetbrains.com/youtrack/issue/LL-412))
  - 404 errors being displayed globally ([#LL-413](https://ht2labs.myjetbrains.com/youtrack/issue/LL-413))
  - Returning aggregations results as a string
### Security
### Migrations

## [2.0.2] - 2017-10-03
### Added
  - Legend added to X vs Y charts ([#LL-322](https://ht2labs.myjetbrains.com/youtrack/issue/LL-322))
  - Prevents deleting a role if assigned to a user, added error alerts ([#LL-353](https://ht2labs.myjetbrains.com/youtrack/issue/LL-353))
### Changed
 - Require submit to apply changes from advanced query editor
 - Tidy up unused variables in .env.example
### Deprecated
### Removed
### Fixed
 - Allowed statement forwarding to follow redirects
 - Statement forwarding menu item displaying incorrectly
 - Client auth not working with some APIs
### Security
 - If a request returns unauthorised the current user will be logged out
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
