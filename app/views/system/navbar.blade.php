<ul class="nav navbar-nav navbar-right">
  @if ( \Locker\Helpers\Access::isRole('super') )
  <li><a href="{{ URL() }}"><i class="icon icon-dashboard"></i> {{ trans('site.admin_dash') }}</a></li>
  @endif
  <li class="dropdown">
    <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon icon-list"></i> {{ trans('site.navbar.lrs_list') }} <b class="caret"></b></a>
    <ul class="dropdown-menu">
      @if( isset( $list ) )
        @foreach( $list as $lrs )
          <li><a href="{{ URL() }}/lrs/{{ $lrs->_id }}"><i class='icon icon-bar-chart'></i> {{ $lrs->title }}</a></li>
        @endforeach
      @else
        <li><a href="#">{{ trans('site.navbar.none') }}</a></li>
      @endif
      <li class="divider"></li>
      <li class="dropdown-header">{{ trans('site.navbar.other') }}</li>
      <li><a href="{{ URL() }}/site#lrs">{{ trans('site.navbar.lrs_home') }}</a></li>
      @if( \Locker\Helpers\Lrs::lrsCanCreate() )
        <li><a href="{{ URL() }}/lrs/create">{{ trans('lrs.create') }}</a></li>
      @endif
    </ul>
  </li>
  <li><a href="{{ URL() }}/users/{{ Auth::user()->_id }}/edit"><i class="icon icon-cog"></i> {{ trans('site.settings') }}</a></li>
  <li><a href="{{ URL() }}/logout">{{ trans('site.logout') }}</a></li>
</ul>