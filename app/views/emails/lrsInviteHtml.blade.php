<!DOCTYPE html>
<html lang="{{ app('translator')->getLocale() }}">
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <h2>{{ trans('users.invite.has_added', ['INVITOR' => $sender->name, 'LRS_TITLE' => $lrs->title]) }}</h2>
    <div>
      <p>{{ trans('users.invite.instructions') }} <a href="{{ $url }}">{{ $url }}</a></p>
    </div>
  </body>
</html>