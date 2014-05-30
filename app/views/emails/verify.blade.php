<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <h2>{{ trans('site.welcome') }}</h2>

    <div>
      <p>{{ trans('users.registration_various.thanks') }}</p>
      <p>{{ trans('users.registration_various.click') }}: {{ URL::to('email/verify', array($token)) }}.</p>
    </div>
  </body>
</html>