<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <h2>{{ Lang::get('reminders.password_reset') }}</h2>

    <div>
      {{ Lang::get('reminders.password_reset_form') }}: {{ URL::to('password/reset', array($token)) }}
    </div>
  </body>
</html>