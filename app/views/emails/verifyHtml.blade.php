<!DOCTYPE html>
<html lang="{{ app('translator')->getLocale() }}">
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <h2>{{ trans('site.welcome') }}</h2>

    <div>
      <p>{{ trans('users.registration.thanks') }}</p>
      <p>{{ trans('users.registration.click') }} <a href="{{ $url }}">{{ $url }}</a></p>
    </div>
  </body>
</html>