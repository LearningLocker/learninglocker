# Tests
This file explains the purposes of some of the classes and directories within this directory.

## Abstract Classes
### TestCase
This is a class to extend for all tests.

### InstanceTestCase (extends TestCase)
This is a class to extend for testing a Learning Locker (LL) instance/installation. Any tests that depend on a LL instance being setup before testing should utilise this class.

### LrsTestCase (extends InstanceTestCase)
This is a class to extend for testing an LRS inside a LL instance. Any tests that depend on an LRS being created before testing should utilise this class.

### StatementsTestCase (extends LrsTestCase)
This is a class to extend for testing retrieval of statements inside an LRS. Any tests that depend on a statements being created before or during testing should utilise this class.

## Directories
### fixtures
This directory should contain any files required by the tests.

### repos
This directory should contain tests for repositories (data in, data out).

### routes
This directory should contain tests for routes (request in, response out). Inside this directory there is a RouteTestTrait that should be used by all classes inside this directory for sending requests.
