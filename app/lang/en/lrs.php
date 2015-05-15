<?php

/*
|----------------------------------------------------------------------------
| Translations for LRSs
|----------------------------------------------------------------------------
*/

return array(
    'add'       => 'Add LRS',
    'home'		=> 'LRS home',
    'create'    => 'Create an LRS',
    'delete_confirm' => 'Are you sure you want to delete this LRS? THERE IS NO UNDO AND YOU WILL LOSE ALL STATEMENTS.',
    'edit'      => 'Edit an LRS',
    'new'		=> 'Create new LRS',
    'verify'    => 'You need to <a href=":verify_link">verify your email</a> before you can create an LRS.',
    'list'      => 'LRS List',
    'none'      => 'No LRS\'s available.',
    'reporting' => 'Reporting',
    'deleted'   => 'The LRS was deleted',
    'updated'   => 'The LRS was updated',
    'create_problem' => 'There was a problem creating that LRS.',
    'created'   => 'The LRS was created.',
    'active'    => 'Active',

    'sidebar'	=> array(
    	'dash' 	    => 'Dashboard',
    	'edit' 	    => 'Edit LRS details',
    	'endpoint'  => 'Manage clients',
    	'api'	    => 'LRS API',
    	'users'     => 'Manage users',
    	'analytics' => 'Analytics',
    	'reporting' => 'Reporting',
      'exporting' => 'Exporting'
    ),

    'endpoint' 	=> array(
    	'endpoint'       => 'Endpoint',
    	'basic_http'     => 'Basic HTTP Authentication',
    	'submit'         => 'Accept xAPI Statements',
    	'instructions'   => 'In order to accept xAPI statements you will need to submit to the following endpoint and authenticate.',
    	'new_key_secret' => 'Generate new key and secret'
    ),

    'api'       => array(
    	'oauth'    => 'OAuth 2.0',
    	'settings' => 'API Settings',
    	'api'	   => 'LRS API'
    ),
    
	'client'       => array(
    	'manageclients'   => 'Clients',
    	'manageclients_intro'   => 'Create a new client for each application or user accessing the LRS via xAPI.',
    	'new_client'   => 'Create client',
    	'unnamed_client' => 'Unnamed client',
    	'created_fail' => 'The client was not created sucecssfully. Sorry.',
    	'created_sucecss' => 'The client was created sucecssfully. Hurrah!',
    	'updated'   => 'The client was updated',
    	'none' => 'Yes, we have no clients.',
    	'delete_client_success' => 'Client deleted.',
    	'delete_client_error' => 'Oops. Something went wrong. The client has not been deleted.',
    	'authority' => array(
			'ifi' => 'Identifier',
			'mbox' => 'Email',
			'mbox_sha1sum' => 'Encrypted email',
			'openid' => 'Open id',
			'account' => 'Account',
			'accountname' => 'Account Name',
			'accounthomepage' => 'Account Homepage'
		)
    	
    ),

    'update_key'       => 'Your key has now been updated.',
    'update_key_error' => 'There was an error updating your key and secret.',
    'remove_user'      => 'That user has been removed from this LRS.'
);