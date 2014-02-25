<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <h2>Welcome to Learning Locker</h2>

    <div>
      <p>Thanks for signing up to use Learning Locker. To complete your registration, we need you to verify
      your email.</p>
      <p>To do this, please click on the following link: {{ URL::to('email/verify', array($token)) }}.</p>
    </div>
  </body>
</html>