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

	"accepted"         => ":attribute doit être accepté.",
	"active_url"       => ":attribute n\'est pas une URL valide.",
	"after"            => ":attribute doit être une date après :date.",
	"alpha"            => ":attribute peut seulement contenir des lettres.",
	"alpha_dash"       => ":attribute peut seulement contenir des lettres, des nombres et des tirets.",
	"alpha_num"        => ":attribute peut seulement contenir des lettres et des nombres.",
	"array"            => ":attribute doit être un tableau.",
	"before"           => ":attribute doit être une date avant :date.",
	"between"          => array(
		"numeric" => ":attribute doit être entre :min et :max.",
		"file"    => ":attribute doit être de entre :min et :max kilobytes.",
		"string"  => ":attribute doit avoir entre :min et :max caractères.",
		"array"   => ":attribute doit acoir entre :min et :max éléments.",
	),
	"confirmed"        => "La confirmation de :attribute ne correspond pas.",
	"date"             => ":attribute n'est pas une date valide.",
	"date_format"      => ":attribute ne correspond pas au format :format.",
	"different"        => ":attribute et :other doivent être différents.",
	"digits"           => ":attribute doit être de :digits numéros.",
	"digits_between"   => ":attribute doit être d'entre :min et :max numéros.",
	"email"            => "Le format de :attribute est invalide.",
	"exists"           => "Le :attribute sélectionné est invalide.",
	"image"            => ":attribute doit être une image.",
	"in"               => "L\':attribute est invalide.",
	"integer"          => ":attribute doit être entier.",
	"ip"               => ":attribute doit être une adresse IP valide.",
	"max"              => array(
		"numeric" => ":attribute ne peut pas être supérieur à :max.",
		"file"    => ":attribute ne peut pas être supérieur à :max kilobytes.",
		"string"  => ":attribute ne peut pas être supérieur à :max caractères.",
		"array"   => ":attribute ne peut pas avoir plus de :max éléments.",
	),
	"mimes"            => ":attribute doit être un fichier de type: :values.",
	"min"              => array(
		"numeric" => ":attribute doit être d'au moins :min.",
		"file"    => ":attribute doit être d'au moins :min kilobytes.",
		"string"  => ":attribute doit être d'au moins :min caractères.",
		"array"   => ":attribute doit avoir au moins :min éléments.",
	),
	"not_in"           => "Le :attribute sélectionné est invalide.",
	"numeric"          => ":attribute doit être un nombre.",
	"regex"            => "Le format de :attribute est invalide.",
	"required"         => "Le champ :attribute est requis.",
	"required_if"      => "Le champ :attribute est requis quand :other est :value.",
	"required_with"    => "Le champ :attribute est requis quand :values est présent.",
	"required_without" => "Le champ :attribute est requis quand :values n'est pas présent.",
	"same"             => ":attribute et :other doivent correspondre.",
	"size"             => array(
		"numeric" => ":attribute doit être de taille :size.",
		"file"    => ":attribute doit être de :size kilobytes.",
		"string"  => ":attribute doit être de :size caractères.",
		"array"   => ":attribute doit contenir :size éléments.",
	),
	"unique"           => ":attribute est déjà utillisé.",
	"url"              => "Le format de :attribute est invalide.",
  "alpha_spaces"     => ":attribute peut seulement contenir des lettres et des espaces.",

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
