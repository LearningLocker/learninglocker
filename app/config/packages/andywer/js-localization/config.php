<?php

return array(

    /*
    |--------------------------------------------------------------------------
    | Define the languages you want exported messages for
    |--------------------------------------------------------------------------
    */

    'locales' => array('en', 'es_ES'),

    /*
    |--------------------------------------------------------------------------
    | Define the messages to export
    |--------------------------------------------------------------------------
    |
    | An array containing the keys of the messages you wish to make accessible
    | for the Javascript code.
    | Remember that the number of messages sent to the browser influences the
    | time the website needs to load. So you are encouraged to limit these
    | messages to the minimum you really need.
    |
    | Supports nesting:
    |   array( 'mynamespace' => array( 'test1', 'test2' ) )
    | for instance will be internally resolved to:
    |   array('mynamespace.test1', 'mynamespace.test2')
    |
    */

    'messages' => array('reporting', 'exporting', 'site', 'statements'),

);
