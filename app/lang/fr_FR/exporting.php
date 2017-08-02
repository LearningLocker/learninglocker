<?php

/*
|----------------------------------------------------------------------------
| Translations for reporting
|----------------------------------------------------------------------------
*/

return [
  'title' => 'Exports',
  'info' => 'Exporter l\'information',
  'select' => [
    'report' => 'Sélectionner un rapport',
    'fields' => 'Sélectionner les champs'
  ],
  'fields' => [
    'name' => 'Nom',
    'description' => 'Description',
    'created' => 'Créé'
  ],
  'actions' => [
    'saved' => 'L\'export a été sauvegardé.',
    'save' => 'Sauvegarder',
    'download' => 'Télécharger',
    'add' => [
      'field' => 'Ajouter champ',
      'export' => 'Ajouter export'
    ],
    'edit' => 'Éditer',
    'delete' => 'Supprimer'
  ],
  'new' => [
    'name' => 'Nouvel export',
    'description' => 'Un nouvel export.'
  ],
  'errors' => [
    'noReport' => 'Il doit y avoir un rapport.',
    'noFields' => 'Il doit y avoir au moins un champ.',
    'mustSave' => 'Vous devez sauvegarder ce nouvel export avant de pouvoir télécharger ses résultats.',
    'notFound' => 'Export avec l\'id `:exportId` non trouvé.',
    'reportExistence' => 'Le rapport n\'existe pas',
    'delete' => 'Impossible de supprimer le rapport.',
    'undefinedKey' => '`:key` n\'est pas définie.'
  ],
  'placeholders' => [
    'statementField' => 'Nom de champ du Statement',
    'userField' => 'Votre nom de champ',
    'name' => 'Nommez cet export',
    'description' => 'Décrivez cet export'
  ],
  'unknown' => 'Inconnu'
];
