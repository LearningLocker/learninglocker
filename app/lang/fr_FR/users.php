<?php

/*
|----------------------------------------------------------------------------
| Translations for users
|----------------------------------------------------------------------------
*/

return array(
  'users'  => 'Utilisateurs',
  'role'   => 'Rôle',
  'invite' => array(
    'invite'  => 'Inviter utilisateurs',
    'email'   => 'Adresses e-mail (lignes séparées)',
    'message' => 'Message (optionnel)',
    'sample'  => 'Je souhaite vous inviter à rejoindre ce Learning Record Store (LRS).',
    'invited' => 'Ces utilisateurs ont été invités. :tokens<br /><br />Partagez ces liens de réinitialisation de mots de passe d\'usage unique avec leurs utilisateurs respectifs.<br />Si vous avez des e-mails configurés ces liens seront envoyés par e-mail aux utilisateurs.',
    'failed'  => 'L\'invitation de cet utilisateur a échoué. Vérifiez que l\'utilisateur ne soit pas déjà inscrit sur le LRS et que son e-mail est valide.',
    'has_added' => ':INVITOR vous a ajouté au Learning Record Store (LRS) <strong>:LRS_TITLE</strong>.',
    'has_invited' => ':INVITOR vous a invité à rejoindre le Learning Record Store (LRS) <strong>:LRS_TITLE</strong>.',
    'instructions' => 'Veuillez visiter l\'adresse suivante:'
  ),
  'password'         => 'Mot de passe',
  'password_again'   => 'Confirmer mot de passe',
  'password_current' => 'Mot de passe courant',
  'password_change'  => 'Changer le mot de passe',
  'password_add'     => 'Ajouter un mot de passe',
  'password_problem' => 'Il y a eu un problème pour sauvegarder votre mot de passe.',
  'password_remind'  => 'Rappel de mot de passe',
  'password_current_wrong' => 'Votre mot de passe courant n\'est pas correct.',
  'password_instructions' => 'Veuillez ajouter un mot de passe à votre compte. Vous devez faire ceci avant de poursuivre.',
  'email'          => 'Email',
  'verify'         => 'Vérifier',
  'verify_success' => 'Vous avez vérifié cet utilisateur.',
  'verified'       => 'Vérifié',
  'verify_request' => 'Veuillez vérifier votre e-mail avant les étapes suivanes.',
  'email_verified' => 'Merci, votre e-mail est confirmé.',
  'email_verify_problem' => 'Un problème est survenu lors de la validation de votre adresse e-mail.',
  'unverified'     => 'Non vérifié',
  'verify_resend'  => 'Réenvoyer e-mail de vérification',
  'reset'          => 'Réinitialiser votre mot de passe',
  'success'        => 'Votre mot de passe a été sauvegardé',
  'roles' => array(
    'super'       => 'Super Admin (peut accéder et tout faire)',
    'plus'        => 'Plus observateur (aucun privilège spécifique)',
    'observer'    => 'Observateur (aucun privilège spécifique)',
    'help'        => 'La seule raison pour laquelle les observateurs et les observateurs "plus" existent est pour fournir une option pour allouer à certains utilisateurs le privilège de créer des LRSs.',
  ),
  'role_change'    => 'Le rôle de l\'utilisateur a été modifié.',
  'deleted'        => 'L\'utilisateur a été supprimé et tous les LRSs qu\'ils ont créé ont été transférés à l\'administrateur du site.',
  'updated'        => 'Paramètres de compte mis à jour',
  'updated_error'  => 'Un problème est survenu lors de la mise à jour de ce compte.',
  'registration' => array(
      'thanks'       => 'Merci de vous êtes inscrit pour utiliser Learning Locker. Pour compléter votre inscription, nous devons vérifier votre adresse e-mail.',
      'click'        => 'Veuillez visiter l\'adresse suivante:'
    ) 
);
