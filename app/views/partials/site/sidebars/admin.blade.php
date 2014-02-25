@if( Auth::check() )

  <h3>Admin Options</h3>
  
  <ul class="nav nav-stacked sidebar-nav">
    <li class="link  @if ( isset($dash_nav) ) active @endif">
      <a href="{{ URL() }}/site"><span class="menu-icon"><i class="icon icon-dashboard"></i></span> Dashboard</a> 
    </li>
    <li class="link @if ( isset($settings_nav) ) active @endif">
      <a href="{{ URL() }}/site/settings"><span class="menu-icon"><i class="icon icon-cog"></i></span> Settings</a>
    </li>
    <li class="link @if ( isset($lrs_nav) ) active @endif">
      <a href="{{ URL() }}/site/lrs"><span class="menu-icon"><i class="icon icon-bar-chart"></i></span>  LRSs</a>
    </li>
    <li class="link @if ( isset($users_nav) ) active @endif">
      <a href="{{ URL() }}/site/users"><span class="menu-icon"><i class="icon icon-group"></i></span>  Users</a>
    </li>
    <li class="link @if ( isset($app_nav) ) active @endif">
      <a href="{{ URL() }}/oauth/apps"><span class="menu-icon"><i class="icon icon-code"></i></span>  Apps</a>
    </li>
  </ul>
  
  @include('layouts.sidebars.sidebar_footer')

@endif