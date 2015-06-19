[![Logo](http://i1176.photobucket.com/albums/x331/photo-ryansmith/beagle_zps958f9ae8.png)](/)

[![Build Status](https://travis-ci.org/ht2/beagle.svg?branch=master)](https://travis-ci.org/ht2/beagle)
[![Dependencies](https://david-dm.org/ht2/beagle.png)]()
[![Chat](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/ht2/beagle?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

If you have a bug, enhancement, or question you can post it in the issues, however, please see the [guidelines](/contributing.md) before doing so. You may also ask questions and chat on [Gitter](https://gitter.im/ryansmith94/couple).

## Users
Documentation can be found in the [docs](/docs) directory. You should use [Bower](http://bower.io/) to install this for the Browser using `bower install beagle` and then use [requirejs](http://requirejs.org/) to require `bower_components/beagle/build/export`.

## Developers
You may contribute to this project via issues and pull requests, however, please see the [guidelines](/contributing.md) before doing so.

### Getting Started
1. [Fork](/fork) the repository.
2. Clone your forked version of the repository.
3. Run `npm install`.
4. Change the code.
5. Run `gulp`. See "Build Process" below for more information.
6. Repeat from Step 4 or continue to step 7.
7. Commit and push your changes to Github.
8. Create a [pull request](/compare) on Github (ensuring that you follow the [guidelines](/contributing.md)).

### Directory Structure
- [src](/src) - Source code written in CoffeeScript.
- [spec](/spec) - Testing code written in CoffeeScript.
- [build](/build) - Compiled source in JavaScript.

### Build Process
You should try to ensure that [`gulp`](http://gulpjs.com/) runs without any errors before submitting a pull request`.
