<?php

/*
|----------------------------------------------------------------------------
| Translations for reporting
|----------------------------------------------------------------------------
*/

return [
  'title' => 'Exporte',
  'info' => 'Export information',
  'select' => [
    'report' => 'Report auswählen',
    'fields' => 'Felder auswählen'
  ],
  'fields' => [
    'name' => 'Name',
    'description' => 'Beschreibung',
    'created' => 'Erstellt'
  ],
  'actions' => [
    'saved' => 'Der Export wurde gespeichert.',
    'save' => 'Speichern',
    'download' => 'Download',
    'add' => [
      'field' => 'Feld hinzufügen',
      'export' => 'Export hinzufügen'
    ],
    'edit' => 'Bearbeiten',
    'delete' => 'Löschen'
  ],
  'new' => [
    'name' => 'Neuer Export',
    'description' => 'Ein neuer Export.'
  ],
  'errors' => [
    'noReport' => 'Muss einen Report enthalten.',
    'noFields' => 'Muss mindestens ein Feld beinhalten.',
    'mustSave' => 'Dieser neue Report muss gespeichert werden, bevor man ihn herunterladen kann.',
    'notFound' => 'Der Export mit der id `:exportId` wurde nicht gefunden.',
    'reportExistence' => 'Dieser Report existiert nicht',
    'delete' => 'Der Report konnte nicht gelöscht werden.',
    'undefinedKey' => '`:key` ist nicht definiert.'
  ],
  'placeholders' => [
    'statementField' => 'Statement Feldname',
    'userField' => 'Feldname',
    'name' => 'Name dieses Exports',
    'description' => 'Beschrebung dieses Exports'
  ],
  'unknown' => 'Unbekannt'
];