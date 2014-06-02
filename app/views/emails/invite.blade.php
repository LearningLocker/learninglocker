<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <h2>{{ $sender->name }} {{ trans('users.invite.has_invited') }} {{ $title }}</h2>
    <div>
      {{ $custom_message }}
    </div>
    <div>
      <p>{{ trans('users.invite.invite_instructions') }}: {{ URL::to('email/invite', array($token)) }}</p>
    </div>
  </body>
</html>