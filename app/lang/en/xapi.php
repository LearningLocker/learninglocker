<?php

return [
  'scope-descriptions' => [
    'statements-write' => 'Write any Statement',
    'statements-read-mine' => 'Read Statements written by "me", that is with an authority matching what the LRS would assign if writing a Statement with the current token.',
    'statements-read' => 'Read any Statement',
    'state' => 'Read/Write state data, limited to Activities and Actors associated with the current token to the extent it is possible to determine this relationship.',
    'define' => 'Define/Redefine Activities and Actors. If storing a Statement when this is not granted, ids will be saved and the LRS may save the original Statement for audit purposes, but should not update its internal representation of any Actors or Activities.',
    'profile' => 'Read/Write profile data, limited to Activities and Actors associated with the current token to the extent it is possible to determine this relationship.',
    'all-read' => 'Unrestricted read access',
    'all' => 'Unrestricted access'
  ]
];
