<a class="navbar-brand" href="{{ URL() }}">
  <?php
    $site = \Site::first();
    if( isset($site->name) ){
      $site = $site->name;
    }else{
      $site = 'Learning Locker';
    }
  ?>
  {{ isset($title) ? $title : $site }}
</a>