# Contributing to Laravel Breadcrumbs

If you want to submit a bug fix, the information below may help you to get
started. Then simply open a
[pull request](https://github.com/davejamesmiller/laravel-breadcrumbs/pulls) on
GitHub.

If you want to submit a new feature, I suggest opening an
[issue](https://github.com/davejamesmiller/laravel-breadcrumbs/issues) to
discuss the idea first, to make sure it will be accepted.

## Developing against a real application

The easiest way to develop Laravel Breadcrumbs alongside a real Laravel
application is to set it up as normal, but tell Composer to install from source
with the `--prefer-source` flag.

If you've already got it installed, delete it from the `vendor/` directory and
re-install from source:

```bash
cd /path/to/repo
rm -rf vendor/davejamesmiller/laravel-breadcrumbs
composer install --prefer-source
```

There is a [test app](https://github.com/davejamesmiller/laravel-breadcrumbs-test)
available to simplify testing against multiple versions of Laravel.

## Using your fork in a project

If you have forked the package (e.g. to fix a bug or add a feature), you may
want to use that version in your project until the changes are merged and
released. To do that, simply update the `composer.json` in your main project as
follows:

```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/YOUR_USERNAME/laravel-breadcrumbs.git"
        }
    ],

    "require": {
        "davejamesmiller/laravel-breadcrumbs": "dev-YOUR_BRANCH"
    }
}
```

Replace `YOUR_USERNAME` with your GitHub username and `YOUR_BRANCH` with the
branch name (e.g. `master`). This tells Composer to use your repository instead
of the default one.

## Unit tests

To run the unit tests, simply [install PHP Unit](http://phpunit.de/manual/current/en/installation.html)
and run:

```bash
cd /path/to/laravel-breadcrumbs
composer update --dev
phpunit
```

(Note: The unit tests are not 100% complete yet, and the code will probably need
some refactoring to make it easier to test.)

## Code coverage in unit tests

To check code coverage, you will also need [Xdebug](http://xdebug.org/)
installed. Run:

```bash
cd /path/to/laravel-breadcrumbs
composer update --dev
php -d xdebug.coverage_enable=On `which phpunit` --coverage-html test-coverage
```

Then open `test-coverage/index.html` to view the results. However, be aware of
the [edge cases](http://phpunit.de/manual/current/en/code-coverage-analysis.html#code-coverage-analysis.edge-cases)
in PHPUnit.

## Releasing a new version

*This is a reference for me:*

* Make sure all tests pass and also check the code coverage report
* Check the README is up to date, including the version number
* Check the CHANGELOG is up to date
* Commit all changes
* Push the code changes (`git push`)
* Double-check the [Travis CI results](https://travis-ci.org/davejamesmiller/laravel-breadcrumbs)
* Tag the release (`git tag 1.2.3`)
* Push the tag (`git push --tag`)
