<?php

return array(

	/*
	|--------------------------------------------------------------------------
	| Validation Language Lines
	|--------------------------------------------------------------------------
	|
	| The following language lines contain the default error messages used by
	| the validator class. Some of these rules have multiple versions such
	| as the size rules. Feel free to tweak each of these messages here.
	|
	*/

	"accepted"         => ":attribute må bli akseptert.",
	"active_url"       => ":attribute er ikke en gyldig URL.",
	"after"            => ":attribute må være en dato etter :date.",
	"alpha"            => ":attribute må bare inneholde bokstaver.",
	"alpha_dash"       => ":attribute må bare inneholde bokstaver tall og skråstrek",
	"alpha_num"        => ":attribute må bare inneholde bokstaver og tall.",
	"array"            => ":attribute må være en liste(array).",
	"before"           => ":attribute må være en dato før :date.",
	"between"          => array(
		"numeric" => ":attribute må være mellom :min og :max.",
		"file"    => ":attribute må være mellom :min og :max kilobyte.",
		"string"  => ":attribute må være mellom :min og :max tegn.",
		"array"   => ":attribute må ha mellom :min og :max elementer.",
	),
	"confirmed"        => "The :attribute confirmation does not match.",
	"date"             => ":attribute er ikke en gyldig dato.",
	"date_format"      => ":attribute er ikke lik formatet: :format.",
	"different"        => ":attribute and :other må være forskjellig.",
	"digits"           => ":attribute må være :digits tall.",
	"digits_between"   => ":attribute må være mellom :min og :max tall.",
	"email"            => ":attribute formatet er ikke gyldig.",
	"exists"           => "Valgt attributt :attribute er ikke gyldig.",
	"image"            => ":attribute må være et bilde.",
	"in"               => "Valgt attribut :attribute is invalid.",
	"integer"          => ":attribute må være et heltall.",
	"ip"               => ":attribute må være en gyldig IP-adresse.",
	"max"              => array(
		"numeric" => ":attribute må være mellom :min og :max.",
		"file"    => ":attribute må være mellom :min og :max kilobyte.",
		"string"  => ":attribute må være mellom :min og :max tegn.",
		"array"   => ":attribute må ha mellom :min og :max elementer.",
	),
	"mimes"            => "The :attribute must be a file of type: :values.",
	"min"              => array(
		"numeric" => ":attribute må være mellom :min og :max.",
		"file"    => ":attribute må være mellom :min og :max kilobyte.",
		"string"  => ":attribute må være mellom :min og :max tegn.",
		"array"   => ":attribute må ha mellom :min og :max elementer.",
	),
	"not_in"           => "The selected :attribute is invalid.",
	"numeric"          => ":attribute må være et tall.",
	"regex"            => ":attribute er på ugyldig format.",
	"required"         => ":attribute felt er påkrevd.",
	"required_if"      => ":attribute felt er påkrevd når :other er :value.",
	"required_with"    => ":attribute felt er påkrevd når :values er tilstede.",
	"required_without" => ":attribute felt er påkrevd når :values ikke er tilstede.",
	"same"             => "The :attribute and :other must match.",
	"size"             => array(
		"numeric" => ":attribute må være mellom :min og :max.",
		"file"    => ":attribute må være mellom :min og :max kilobyte.",
		"string"  => ":attribute må være mellom :min og :max tegn.",
		"array"   => ":attribute må ha mellom :min og :max elementer.",
	),
	"unique"           => ":attribute har allerede blitt tatt.",
	"url"              => ":attribute format er ugyldig.",
  "alpha_spaces"     => ":attribute må bare inneholde mellomrom og tegn.",

	/*
	|--------------------------------------------------------------------------
	| Custom Validation Language Lines
	|--------------------------------------------------------------------------
	|
	| Here you may specify custom validation messages for attributes using the
	| convention "attribute.rule" to name the lines. This makes it quick to
	| specify a specific custom language line for a given attribute rule.
	|
	*/

	'custom' => array(),

	/*
	|--------------------------------------------------------------------------
	| Custom Validation Attributes
	|--------------------------------------------------------------------------
	|
	| The following language lines are used to swap attribute place-holders
	| with something more reader friendly such as E-Mail Address instead
	| of "email". This simply helps us make messages a little cleaner.
	|
	*/

	'attributes' => array(),

);
