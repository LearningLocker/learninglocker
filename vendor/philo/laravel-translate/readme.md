Translation manager for Laravel 4
===============
<img src="https://poser.pugx.org/philo/laravel-translate/version.png"> <img src="https://poser.pugx.org/philo/laravel-translate/downloads.png">

Managing translations can be a pain, switching between different language files, adding new strings, keeping everything in sync and removing translations which are no longer being used.

But that's in the past if you install this package!

## Features
Lets take a look at all the features included in this package.

### Adding new translations
To add a new translation you need to open your terminal, and run the following command:

`php artisan translate:add [--bench[="..."]] [--no-entities] <group> <line>`

So for a example:
`php artisan translate:add profile first_name`

![1](https://f.cloud.github.com/assets/1133950/1894668/f3c1f81e-7af6-11e3-8fe2-65f816b4b9f1.png)

As you can see, you will get the blade syntax returned so you can copy and paste it to your view. Adding variables to your string will result in a different syntax:
`php artisan translate:add profile texts.introduction`

![2](https://f.cloud.github.com/assets/1133950/1894724/3bcc0cc4-7af9-11e3-9c31-5333bc75d19e.png)


Translation files are dynamically generated in alphabetical order and equally spaced.

![3](https://f.cloud.github.com/assets/1133950/1894726/416c9888-7af9-11e3-92f6-88fd2b1b9078.png)


### Removing translations

To remove translations you can use the remove command which has the same syntax as the add command:

`php artisan translate:remove account upgrade`

![4](https://f.cloud.github.com/assets/1133950/1894728/469efada-7af9-11e3-84b3-8fb5e3e648b4.png)


### Clean up
The clean up command will search your files for language strings which are no longer used.

`php artisan translate:cleanup`

![5](https://f.cloud.github.com/assets/1133950/1894729/4bbb9b90-7af9-11e3-8571-d5fccf418c74.png)


Foreach line that was not found, you will get a confirmation if you want to delete the line in question.
In case you you don't want to confirm each line, you can add the `--silent` parameter.

`php artisan translate:cleanup --silent`

By default the clean up command will look through all your language files. In case you want to focus on one specific group, you can add the `--group="account"` parameter.

`php artisan translate:cleanup --group="account"`

## Installation
The package can be installed via Composer by requiring the "philo/laravel-translate": "dev-master" package in your project's composer.json.

```
{
    "require": {
        "laravel/framework": "4.1.*",
        "philo/laravel-translate": "dev-master"
    },
    "minimum-stability": "dev"
}
```

Next you need to add the service provider to app/config/app.php

```
'providers' => array(
    // ...
    'Philo\Translate\TranslateServiceProvider',
)
```

## Config

You can publish the config file in case you want to make some adjustments to the clean up command:
`php artisan config:publish --path=philo/translate philo/translate`

```
<?php
return array(
	'search_ignore_folders' => array('commands', 'config', 'database', 'lang', 'start', 'storage', 'tests'),
	'search_exclude_files'  => array('pagination', 'reminders', 'validation'),
	'digg_folders'          => array('app/models', 'app/views', 'app/controllers'),
);
```

#### Notes
When you start using the translation manager you need to make sure that all your translation files are in sync.
