<!-- logout -->

<div class="hidden-xs hidden-sm">

  <div class="logout btn-group dropup">
      <button type="button" class="btn btn-xs btn-default">{{ Auth::user()->name }}</button>
      <button type="button" class="btn btn-xs btn-default dropdown-toggle" data-toggle="dropdown">
        <span class="caret"></span>
        <span class="sr-only">Toggle Dropdown</span>
      </button>
      <ul class="dropdown-menu" role="menu">
        @if ( \app\locker\helpers\Access::isRole('super') )
          <li><a href="{{ uRL() }}"><i class="icon icon-dashboard"></i> {{ Lang::get('site.admin_dash') }}</a></li>
        @endif
        <li><a href="{{ uRL() }}/users/{{ Auth::user()->_id }}/edit"><i class="icon icon-cogs"></i> {{ Lang::get('site.account') }}</a></li>
        <li><a href="{{ URL() }}/logout"><i class="icon icon-signout"></i> {{ Lang::get('site.logout') }}</a></li>
      </ul>
  </div>

  <!-- footer -->
  <div id="footer">
      <p class="powered-by"><small>Powered by <a href="http://learninglocker.net" target='_blank'>Learning Locker</a></small></p>
  </div>

</div>

<div class="visible-xs">
  <hr>
  <ul class="nav nav-stacked">
      @if ( \app\locker\helpers\Access::isRole('super') )
        <li><a href="{{ uRL() }}"><i class="icon icon-dashboard"></i> {{ Lang::get('site.admin_dash') }}</a></li>
      @endif
      <li><a href="{{ uRL() }}/users/{{ Auth::user()->_id }}/edit"><i class="icon icon-cogs"></i> {{ Lang::get('site.account') }}</a></li>
      <li><a href="{{ URL() }}/logout"><i class="icon icon-signout"></i> {{ Lang::get('site.logout') }}</a></li>
    </ul>
</div>