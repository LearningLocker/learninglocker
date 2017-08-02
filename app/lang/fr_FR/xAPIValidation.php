<?php

return array(
  'errors' => array(
    'nesting' => 'Un SubStatement ne peut pas contenir un statement inclus.',
    'score' => array(
      'scaled' => 'Résultat: score: proportionné doit être entre 1 et -1.',
      'max' => 'Résultat: score: max doit être plus grand que min.',
      'min' => 'Résultat: score: min doit être plus petit que max.',
      'raw' => 'Résultat: score: raw doit être entre max et min.'
    ),
    'timestamp' => 'Timestamp doit être au format ISO 8601.',
    'version' => 'Le statement a une version invalide.',
    'actor' => array(
      'one' => 'Un statement peut uniquement établir un identifiant fonctionnel d\'acteur.',
      'valid' => 'Un statement doit avoir un identifiant fonctionner d\'acteur.'
    ),
    'allowed' => '`:value` n\'est pas une `:key` autorisée dans :section',
    'required' => '`:key` est une clef requise et n\'est pas présent dans :section',
    'property' => '`:key` n\'est pas une propriété permise dans :section.',
    'langMap' => '`:key` n\'est pas une carte de langues valide dans :section.',
    'lang' => '`:key` n\'est pas une langue valide dans :section.',
    'base64' => '`:key` n\'est pas une string valide pour contenus base64 dans :section.',
    'incorrect' => 'Le statement n\'existe pas ou n\'est pas au format correct.',
    'null' => '`:key` dans :section contient une valeur NULL, ce qui n\'est pas autorisé.',
    'object' => array(
      'interactionType' => 'Object: définition: interactionType n\'est pas valide.',
      'invalidProperty' => 'Object: définition: a une propriété invalide.',
      'definition' => 'Object: définition: doit être un tableau avec ID de clefs et description.',
      'extensions' => 'Object: définition: les extensions doivent être un objet.'
    ),
    'group' => array(
      'groups' => 'Un groupe ne peut contenir des groupes.',
      'limit' => 'Un groupe peut seulement avoir :limit membres.'
    ),
    'type' => '`:key` n\'est pas un :type valide dans :section.',
    'numeric' => '`:key` n\'est pas numérique dans :section.',
    'format' => '`:key` n\'est pas dans le format correct dans :section.',
    'account' => 'Un `account` doit avoir un `name` et un `homePage`.'
  )
);
