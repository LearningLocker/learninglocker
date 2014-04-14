<?php

/*
|--------------------------------------------------------------------------
| Learning Locker custom validators
|--------------------------------------------------------------------------
|
| Here are some validators custom to Learning Locker
|
*/

Validator::extend('alpha_spaces', function($attribute, $value){
    return preg_match('/^[\pL\s]+$/u', $value);
});