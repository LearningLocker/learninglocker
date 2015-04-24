<?php

return array(
  'errors' => array(
    'nesting' => 'Ein SubStatement kann kein verschachteltes Statement enthalten.',
    'score' => array(
      'scaled' => 'Ergebnis: Wertung: Wert muss zwischen 1 und -1 sein.',
      'max' => 'Ergebnis: Wertung: max muss größer sein als min.',
      'min' => 'Ergebnis: Wertung: min muss kleiner sein als max.',
      'raw' => 'Ergebnis: Wertung: raw muss zwischen max und min sein.'
    ),
    'timestamp' => 'Der Timestamp muss dem Format ISO-8601 entsprechen.',
    'version' => 'Das Statement hat eine ungültige Version.',
    'actor' => array(
      'one' => 'Ein Statement kann nur einen identifizierenden Actor beinhalten.',
      'valid' => 'Ein Statement muss einen gültigen identifizierenden Actor beinhalten.'
    ),
    'allowed' => '`:value` ist nicht erlaubt als `:key` in :section',
    'required' => '`:key` wird als Key benötigt ist aber nicht in :section verfügbar',
    'property' => '`:key` ist keine erlaubte Eigenschaft in :section.',
    'langMap' => '`:key` ist keine erlaubte language map in :section.',
    'lang' => '`:key` ist keine erlaubte Sprache in :section.',
    'base64' => '`:key` ist kein erlaubvter String mit base64-Inhalten in :section.',
    'incorrect' => 'Das Statement existiert nicht oder ist nicht im korrekten format.',
    'null' => '`:key` in :section enhält einen unerlaubten NULL-Wert.',
    'object' => array(
      'interactionType' => 'Objekt: Dfinition: interactionType ist nicht korrekt.',
      'invalidProperty' => 'Objekt: Definition: Hat eine ungültige Eigenschaft.',
      'definition' => 'Objekt: Definition: Muss ein Array mit den Keys id und description sein.',
      'extensions' => 'Objekt: Definition: extensions muss ein Objekt sein.'
    ),
    'group' => array(
      'groups' => 'Eine Gruppe kann keine Gruppen enthalten.',
      'limit' => 'Eine Gruppe kann nur :limit Mitglieder haben.'
    ),
    'type' => '`:key` ist nicht gültig als :type in :section.',
    'numeric' => '`:key` ist in :section nicht numerisch.',
    'format' => '`:key` ist in :section nicht im korrekten Format.',
    'account' => 'Ein `account` muss einen `Name`- und einen `homePage`-Wert haben.'
  )
);
