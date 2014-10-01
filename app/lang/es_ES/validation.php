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

	"accepted"         => "El :attribute debe ser aceptada.",
	"active_url"       => "El :attribute no es una URL válida.",
	"after"            => "El :attribute debe ser una fecha después de :date.",
	"alpha"            => "El :attribute sólo puede contener letras.",
	"alpha_dash"       => "El :attribute sólo puede contener letras, números y guiones.",
	"alpha_num"        => "El :attribute sólo puede contener letras y números.",
	"array"            => "El :attribute debe ser una matriz.",
	"before"           => "El :attribute debe ser una fecha antes: Fecha.",
	"between"          => array(
		"numeric" => "El :attribute debe estar entre :min y :max",
		"file"    => "El :attribute debe estar entre :min y :max kilobytes.",
		"string"  => "The :attribute debe tener entre :min y :max caracteres.",
		"array"   => "El :attribute debe tener entre :min y :max items.",
	),
	"confirmed"        => "La confirmación :attribute no coincide.",
	"date"             => "El :attribute no es una fecha válida.",
	"date_format"      => "El atributo: no coincide con el formato :format.",
	"different"        => "El atributo: y :other deben ser diferentes.",
	"digits"           => "El :attribute debe ser: dígitos dígitos.",
	"digits_between"   => "El :attribute debe estar entre :min y :max dígitos.",
	"email"            => "El Formato de :attribute no es válido.",
	"exists"           => "El seleccionado :attribute no es válido.",
	"image"            => "El :attribute debe ser una imagen.",
	"in"               => "El seleccionado :attribute no es válido.",
	"integer"          => "El :attribute debe ser un entero.",
	"ip"               => "El :attribute debe ser una dirección IP válida.",
	"max"              => array(
		"numeric" => "El :attribute debe estar entre :min y :max",
		"file"    => "El :attribute debe estar entre :min y :max kilobytes.",
		"string"  => "El :attribute debe tener entre :min y :max caracteres.",
		"array"   => "El :attribute debe tener entre :min y :max items.",
	),
	"mimes"            => "El :attribute debe ser un archivo de tipo :values.",
	"min"              => array(
		"numeric" => "El :attribute debe estar entre :min y :max",
		"file"    => "El :attribute debe estar entre :min y :max kilobytes.",
		"string"  => "The :attribute debe tener entre :min y :max caracteres.",
		"array"   => "El :attribute debe tener entre :min y :max items.",
	),
	"not_in"           => "El seleccionado :attribute no es válido.",
	"numeric"          => "El :attribute debe ser un número.",
	"regex"            => "El Formato de :attribute no es válido.",
	"required"         => "Se requiere campo de :attribute El.",
	"required_if"      => "El: campo de :attributes es necesario cuando :other es :value.",
	"required_with"    => "Se requiere campo de :attributes cuando: El :value está presente.",
	"required_without" => "El: campo de :attributes es necesario cuando los :values no están presentes.",
	"same"             => "El :attribute e :other deben coincidir.",
	"size"             => array(
		"numeric" => "El :attribute debe estar entre :min y :max",
		"file"    => "El :attribute debe estar entre :min y :max kilobytes.",
		"string"  => "The :attribute debe tener entre :min y :max caracteres.",
		"array"   => "El :attribute debe tener entre :min y :max items.",
	),
	"unique"           => "El :attribute ya se ha tomado.",
	"url"              => "El Formato de :attribute no es válido.",
  "alpha_spaces"     => "El :attribute sólo puede contener letras y espacios.",

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
