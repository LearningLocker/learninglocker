<div class="col-xs-12 col-sm-4 col-lg-4">
  <div class="app-list">
    <h3><a href="{{ URL() }}/oauth/apps/{{ $app->_id }}"><i class="icon icon-cog"></i> {{ $app->name }}</a></h3>
    <ul class="app-listing">
      <li>{{ $app->description }}</li>
      <li><b>App website:</b> <a href="{{ $app->website }}">{{ $app->website }}</a></li>
      <li><b>Organisation:</b> <a href="{{ $app->organisation['website'] }}">{{ $app->organisation['name'] }}</a></li>
      <li><b>Owner:</b> {{ $app->owner['name'] }} | {{ $app->owner['email'] }} | {{ $app->owner['role'] }}</li>
      <li><b>Created:</b> {{ $app->created_at }}</li>
    </ul>
  </div>
</div>