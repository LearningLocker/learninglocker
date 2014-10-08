<?php

/*
|----------------------------------------------------------------------------
| Translations for reporting
|----------------------------------------------------------------------------
*/

return [
  'title' => 'Exports',
  'info' => 'Export information',
  'select' => [
    'report' => 'Select a report',
    'fields' => 'Select fields'
  ],
  'fields' => [
    'name' => 'Name',
    'description' => 'Description',
    'created' => 'Created'
  ],
  'actions' => [
    'saved' => 'The export has been saved.',
    'save' => 'Save',
    'download' => 'Download',
    'add' => [
      'field' => 'Add field',
      'export' => 'Add export'
    ],
    'edit' => 'Edit',
    'delete' => 'Delete'
  ],
  'new' => [
    'name' => 'New export',
    'description' => 'A new export.'
  ],
  'errors' => [
    'noReport' => 'Must have a report.',
    'noFields' => 'Must have at least one field.',
    'mustSave' => 'You must save this new export before you can download it\'s result.',
    'notFound' => 'Export with id `:exportId` not found.',
    'reportExistence' => 'Report does not exist',
    'delete' => 'Could not delete report.',
    'undefinedKey' => '`:key` is not defined.'
  ],
  'placeholders' => [
    'statementField' => 'Statement field name',
    'userField' => 'Your field name',
    'name' => 'Name this export',
    'description' => 'Describe this export'
  ],
  'unknown' => 'Unknown'
];