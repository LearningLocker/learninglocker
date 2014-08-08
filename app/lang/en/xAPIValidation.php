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
		'property' => ':key is not a permitted property in :section.',
		'langMap' => ':key is not a valid language map in :section.',
		'base64' => ':key is not a valid string with base64 contents in :section.'
	)
);
