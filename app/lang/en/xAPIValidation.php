<?php

return array(
  'errors' => array(
    'nesting' => 'A SubStatement cannot contain a nested statement.',
    'score' => array(
      'scaled' => 'Result: score: scaled must be between 1 and -1.',
      'max' => 'Result: score: max must be greater than min.',
      'min' => 'Result: score: min must be less than max.',
      'raw' => 'Result: score: raw must be between max and min.'
    ),
    'timestamp' => 'Timestamp needs to be in ISO 8601 format.',
    'version' => 'The statement has an invalid version.',
    'actor' => array(
      'one' => 'A statement can only set one actor functional identifier.',
      'valid' => 'A statement must have a valid actor functional identifier.'
    ),
    'allowed' => '`:value` is not an allowed `:key` in :section',
    'required' => '`:key` is a required key and is not present in :section',
    'property' => '`:key` is not a permitted property in :section.',
    'langMap' => '`:key` is not a valid language map in :section.',
    'lang' => '`:key` is not a valid language in :section.',
    'base64' => '`:key` is not a valid string with base64 contents in :section.',
    'incorrect' => 'The statement doesn\'t exist or is not in the correct format.',
    'null' => '`:key` in :section contains a NULL value which is not permitted.',
    'object' => array(
      'interactionType' => 'Object: definition: interactionType is not valid.',
      'invalidProperty' => 'Object: definition: It has an invalid property.',
      'definition' => 'Object: definition: It needs to be an array with keys id and description.',
      'extensions' => 'Object: definition: extensions need to be an object.'
    ),
    'group' => array(
      'groups' => 'A group cannot contain groups.',
      'limit' => 'The group can only have :limit members.'
    ),
    'type' => '`:key` is not a valid :type in :section.',
    'numeric' => '`:key` is not numeric in :section.',
    'format' => '`:key` is not in the correct format in :section.',
    'account' => 'An `account` must have a `name` and a `homePage`.'
  )
);
