Format based on [Keep a Changelog](http://keepachangelog.com/)

## [unreleased]
### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security
### Migrations

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
<<<<<<< HEAD

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
=======
### Migrations
>>>>>>> release/v2.1.0
