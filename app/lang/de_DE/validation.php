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

    "accepted" => ":attribute mus akzeptiert werden.",
    "active_url" => ":attribute ist keine gültige URL.",
    "after" => ":attribute muss ein Datum nach :date sein.",
    "alpha" => ":attribute kann nur Buchstaben enthalten.",
    "alpha_dash" => ":attribute kann nur Buchstaben, Zahlen und Striche enthalten.",
    "alpha_num" => ":attribute kann nur Buchstaben und Zahlen enthalten.",
    "array" => ":attribute muss ein Array sein.",
    "before" => ":attribute muss ein Datum bevor :date sein.",
    "between" => array(
        "numeric" => ":attribute muss zwischen :min und :max sein.",
        "file" => ":attribute muss zwischen :min und :max Kilobytes sein.",
        "string" => ":attribute muss zwischen :min und :max Zeichen sein.",
        "array" => ":attribute muss zwischen :min und :max Items haben.",
    ),
    "confirmed" => ":attribute stimmt nicht überein.",
    "date" => ":attribute ist kein gültiges Datum.",
    "date_format" => ":attribute stimmt nicht mit dem Format :format überein.",
    "different" => ":attribute und :other müssen sich unterscheiden.",
    "digits" => ":attribute muss :digits Ziffer(n) sein.",
    "digits_between" => ":attribute muss zwischen :min und :max Ziffer(n) sein.",
    "email" => ":attribute Format ist ungültig.",
    "exists" => "Gewähltes :attribute ist ungültig.",
    "image" => ":attribute muss ein Bild sein.",
    "in" => "selected :attribute ist ungültig.",
    "integer" => ":attribute muss eine Ganzzahl sein.",
    "ip" => ":attribute muss eine gültige IP-Addresse sein.",
    "max" => array(
        "numeric" => ":attribute darf nicht größer sein als :max.",
        "file" => ":attribute darf nicht größer sein als :max Kilobytes.",
        "string" => ":attribute darf nicht mehr als :max Zeichen haben.",
        "array" => ":attribute darf nicht mehr als :max Items haben.",
    ),
    "mimes"            => ":attribute muss eine Datei vom Typ type: :values sein.",
    "min"              => array(
        "numeric" => ":attribute muss mindestens :min sein.",
        "file" => ":attribute muss mindestens :min Kilobytes haben.",
        "string" => ":attribute muss mindestens :min Zeichen haben.",
        "array" => ":attribute muss mindestens :min Items haben.",
    ),
    "not_in" => "Gewähltes :attribute ist ungültig.",
    "numeric" => ":attribute muss eine Zahl sein.",
    "regex" => ":attribute Format ist ungültig.",
    "required" => ":attribute Feld ist ein Pflichtfeld.",
    "required_if" => ":attribute Feld ist ein Pflichtfeld wenn :other gleich :value ist.",
    "required_with" => ":attribute Feld ist ein Pflichtfeld wenn :values vorhanden ist.",
    "required_without" => ":attribute Feld ist ein Pflichtfeld wenn :values nicht vorhanden ist.",
    "same" => ":attribute und :other müssen übereinstimmen.",
    "size" => array(
        "numeric" => ":attribute muss :size groß sein.",
        "file" => ":attribute muss :size Kilobytes groß sein.",
        "string" => ":attribute muss :size Zeichen lang sein.",
        "array" => ":attribute muss :size Items beinhalten.",
    ),
    "unique" => ":attribute ist bereits vergeben.",
    "url" => ":attribute Format ist ungültig.",
    "alpha_spaces" => ":attribute darf nur Zahlen und Leerzeichen beinhalten.",

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => array(),

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | following language lines are used to swap attribute place-holders
    | with something more reader friendly such as E-Mail Address instead
    | of "email". This simply helps us make messages a little cleaner.
    |
    */

    'attributes' => array(),

);
