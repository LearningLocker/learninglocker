<?php

/*
|----------------------------------------------------------------------------
| Translations for LRSs
|----------------------------------------------------------------------------
*/

return array(
    'add' => 'Neues LRS',
    'home' => 'LRS Übersicht',
    'create' => 'LRS erstellen',
    'delete_confirm' => 'Soll dieses LRS wirklich gelöscht werden? DIESE AKTION IST UNUMKEHRBAR UND ALLE STATEMENTS WERDEN UNWIEDERBRINGLICH GELÖSCHT.',
    'edit' => 'LRS bearbeiten',
    'new' => 'Neues LRS anlegen',
    'verify' => 'Die <a href=":verify_link">E-Mail muss verifiziert werden</a> um ein neues LRS erstellen zu können.',
    'list' => 'LRS List',
    'none' => 'Es sind keine LRSs vorhanden.',
    'reporting' => 'Reporting',
    'deleted' => 'Das LRS wurde gelöscht',
    'updated' => 'Das LRS wurde aktualisiert',
    'create_problem' => 'Es gab ein Problem bei der Erstellung des LRS.',
    'created' => 'Das LRS wurde erstellt.',
    'active' => 'Aktiv',

    'sidebar' => array(
        'dash' => 'Dashboard',
        'edit' => 'LRS details bearbeiten',
        'endpoint' => 'xAPI statements',
        'api' => 'LRS API',
        'users' => 'Benutzer verwalten',
        'analytics' => 'Analytik',
        'reporting' => 'Report',
        'exporting' => 'Export'
    ),

    'endpoint' => array(
        'endpoint' => 'Endpoint',
        'basic_http' => 'Basic HTTP Authentifizierung',
        'submit' => 'Akzeptiere xAPI Statements',
        'instructions' => 'xAPI statements müssen mit Authentifizierung an den folgenden Enpoint übermittelt werden.',
        'new_key_secret' => 'Neuen Key und Secret erzeugen'
    ),

    'api' => array(
        'oauth' => 'OAuth 2.0',
        'settings' => 'API Einstellungen',
        'api' => 'LRS API'
    ),
    
    'client' => array(
        'manageclients' => 'Weiter Clients verwalten',
        'manageclients_intro' => 'Es kann für jede Anwendung oder benutzer der auf das LRS über die xapi zugreifen soll ein neuer Client angelegt werden.',
        'new_client' => 'Neuen Client erstellen',
        'unnamed_client' => 'Unbenannter Client',
        'created_fail' => 'Der Client konnte nicht erstellt werden.',
        'created_sucecss' => 'Der Client wurde erstellt.',
        'updated' => 'Der Client wurde aktualisiert.',
        'none' => 'Es sind keine Clients verfügbar.',
        'delete_client_success' => 'Der Client wurde gelöscht.',
        'delete_client_error' => 'Der Client konnte nicht gelöscht werden.',
        'authority' => array(
            'ifi' => 'Identifier',
            'mbox' => 'E-Mail',
            'mbox_sha1sum' => 'Verschlüsselte E-Mail',
            'openid' => 'OpenID',
            'account' => 'Account',
            'accountname' => 'Account Name',
            'accounthomepage' => 'Account Homepage'
        )
        
    ),

    'update_key' => 'Der Key wurde aktualisiert.',
    'update_key_error' => 'Der Key und Secret konnten nicht aktualisiert werden.',
    'remove_user' => 'Der Benutzer wurde aus dem LRS entfernt.'
);