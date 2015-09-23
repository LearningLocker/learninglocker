<!DOCTYPE html>
<html lang="{{ app('translator')->getLocale() }}">
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <h2>{{ Lang::get('reminders.password_reset') }}</h2>

    <div>
      {{ Lang::get('reminders.password_reset_form') }}: <a href="{{ URL::to('password/reset', array($token)) }}">
      {{ URL::to('password/reset', array($token)) }}</a>
    </div>
  </body>
</html>