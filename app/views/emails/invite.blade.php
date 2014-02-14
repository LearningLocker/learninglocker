<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <h2>{{ $sender->name }} has invited you to join the {{ \Site::first()->name }} LRS</h2>
    <div>
      {{ $custom_message }}
    </div>
    <div>
      <p>To do this, please click on the following link: {{ URL::to('email/invite', array($token)) }}.</p>
    </div>
  </body>
</html>