<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <h2>{{ $sender->name }} has added you to the {{ $lrs->title }} LRS</h2>
    <div>
      <p>To visit the LRS, click here {{ URL() }}/lrs/{{ $lrs->_id }}</p>
    </div>
  </body>
</html>