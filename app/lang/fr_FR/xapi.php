<?php

return [
  'scope-descriptions' => [
    'statements-write' => 'Écrivez un Statement quelconque',
    'statements-read-mine' => 'Lire les Statements que "je" ai écrit, qui ont une autorité qui correspond à ce que le LRS assignerait s\'il écrivait un Statement avec le token courant.',
    'statements-read' => 'Lire n\'importe quel Statement',
    'state' => 'Lire/Écrire données d\'état, limitées aux Activités et Acteurs associés avec le token courant dans la mesure où il est possible de déterminer cette relation.',
    'define' => 'Définir/Redéfinir les Activités et les Acteurs. En stockant un Statement quand ceci n\'est pas autorisé, les ids seront sauvés et le LRS peut sauvegarder le Statement original pour des objectifs d\'audit, mais vous ne devrait pas mettre à jour sa représentation interne de quelque Acteur ou Activité que ce soit.',
    'profile' => 'Lire/Écrire données de profil, limité aux Activités et Acteurs associés avec le token actuel dans la mesure où il est possible de déterminer cette relation.',
    'all-read' => 'Accès en lecture non restreint',
    'all' => 'Accès non restreint'
  ]
];
