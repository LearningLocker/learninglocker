<?php

/*
|----------------------------------------------------------------------------
| Translations for LRSs
|----------------------------------------------------------------------------
*/

return array(
    'add'       => 'Ajouter LRS',
    'home'		=> 'Accueil LRS',
    'create'    => 'Créer un LRS',
    'delete_confirm' => 'Êtes-vous certain de vouloir supprimer ce LRS? IL N\'Y A PAS DE RETOUR EN ARRIERE ET VOUS PERDREZ TOUS LES STATEMENTS.',
    'edit'      => 'Éditer un LRS',
    'new'		=> 'Créer un nouveau LRS',
    'verify'    => 'Veuillez <a href=":verify_link">vérifier votre email</a> avant de créer un LRS.',
    'list'      => 'Liste des LRS',
    'none'      => 'Aucun LRS disponible.',
    'reporting' => 'Reporting',
    'deleted'   => 'Le LRS a été supprimé',
    'updated'   => 'Le LRS a été mis à jour',
    'create_problem' => 'Il y a eu un problème à la création de ce LRS.',
    'created'   => 'Le LRS a été créé.',
    'active'    => 'Actif',

    'sidebar'	=> array(
    	'dash' 	    => 'Panneau de contrôle',
    	'edit' 	    => 'Éditer détails du LRS',
    	'endpoint'  => 'Gérer clients',
    	'api'	    => 'API du LRS',
    	'users'     => 'Gérer utilisateurs',
    	'analytics' => 'Analytique',
    	'reporting' => 'Reporting',
      'exporting' => 'Exports'
    ),

    'endpoint' 	=> array(
    	'endpoint'       => 'Endpoint',
    	'basic_http'     => 'Authentification HTTP de base',
    	'submit'         => 'Accepter Statements xAPI',
    	'instructions'   => 'Pour accepter les statements xAPI, il est nécessaire d\'utiliser le endpoint suivant et de vous authentifier.',
    	'new_key_secret' => 'Génerer une nouvelle clef et secret'
    ),

    'api'       => array(
    	'oauth'    => 'OAuth 2.0',
    	'settings' => 'Paramètres d\'API',
    	'api'	   => 'API du LRS'
    ),
    
	'client'       => array(
    	'manageclients'   => 'Clients',
    	'manageclients_intro'   => 'Créer un nouveau client pour chaque application ou utilisateur accédant au LRS via xAPI.',
    	'new_client'   => 'Créer client',
    	'unnamed_client' => 'Client sans nom',
    	'created_fail' => 'Le client n\'a pas été créé. Désolé.',
    	'created_success' => 'Le client a été créé. Hourra!',
    	'updated'   => 'Le client a été mis à jour',
    	'none' => 'Non, nous n\'avons pas de client.',
    	'delete_client_success' => 'Client supprimé.',
    	'delete_client_error' => 'Oups. Un problème est survenu. Le client n\'a pas été supprimé.',
    	'authority' => array(
			'ifi' => 'Identifiant',
			'mbox' => 'Email',
			'mbox_sha1sum' => 'Email encrypté',
			'openid' => 'Open id',
			'account' => 'Compte',
			'accountname' => 'Nom du compte',
			'accounthomepage' => 'Accueil du compte'
		)
    	
    ),

    'update_key'       => 'Votre clef a été mise à jour.',
    'update_key_error' => 'Une erreur est survenue durant la mise à jour de votre clef et secret.',
    'remove_user'      => 'Cet utilisateur a été supprimé de ce LRS.'
);
