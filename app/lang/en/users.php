<?php

/*
|----------------------------------------------------------------------------
| Translations for users
|----------------------------------------------------------------------------
*/

return array(
  'users'  => 'Users',
  'role'   => 'Role',
  'invite' => array(
    'invite'  => 'Invite users',
    'email'   => 'Email addresses (separate lines)',
    'message' => 'Message (optional)',
    'sample'  => 'I would like to invite you to join this Learning Record Store (LRS).',
    'invited' => 'Those users have been invited. :tokens<br /><br />Share these one time password reset links with their respective user.<br />If you have emails configured these links will be emailed to the users.',
    'failed'  => 'Inviting that user failed, check the user is not already a member of the LRS and the email is valid.',
    'has_added' => ':INVITOR has added you to the <strong>:LRS_TITLE</strong> Learning Record Store (LRS).',
    'has_invited' => ':INVITOR has invited you to join the <strong>:LRS_TITLE</strong> Learning Record Store (LRS).',
    'instructions' => 'Please go to the following web address:'
  ),
  'password'         => 'Password',
  'password_again'   => 'Password confirm',
  'password_current' => 'Current password',
  'password_change'  => 'Change password',
  'password_add'     => 'Add a password',
  'password_problem' => 'There was a problem saving your password.',
  'password_remind'  => 'Password Reminder',
  'password_current_wrong' => 'Your current password was not correct.',
  'password_instructions' => 'Please add a password for your account. You need to do this before you can continue.',
  'email'          => 'Email',
  'verify'         => 'Verify',
  'verify_success' => 'You have verified this user.',
  'verified'       => 'Verified',
  'verify_request' => 'Please check your email for next steps.',
  'email_verified' => 'Thanks, you have now validated your email.',
  'email_verify_problem' => 'There was a problem validating your email address.',
  'unverified'     => 'Unverified',
  'verify_resend'  => 'Resend verify email',
  'reset'          => 'Reset your password',
  'success'        => 'Your password has been saved',
  'roles' => array(
    'super'       => 'Super Admin (can access and do everything)',
    'plus'        => 'Observer Plus (no specific privileges)',
    'observer'    => 'Observer (no specific privileges)',
    'help'        => 'The only reason Observer and Observer Plus exist is to provide an option to grant certain users the privilege of creating LRSs.',
  ),
  'role_change'    => 'The user\'s role has been changed.',
  'deleted'        => 'The user was deleted and any LRSs they created transferred to the site admin.',
  'updated'        => 'Account settings have been updated',
  'updated_error'  => 'There was a problem updating that account.',
  'registration' => array(
      'thanks'       => 'Thanks for signing up to use Learning Locker. To complete your registration, we need you to verify your email.',
      'instructions' => 'Please go to the following web address:'
    ) 
);