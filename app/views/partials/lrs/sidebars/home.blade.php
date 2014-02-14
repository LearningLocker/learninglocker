@if( Auth::check() )

  @if( isset($list) )
  <ul>
    <li>
      <select class="form-control" style="width:220px;" onchange="javascript:location.href = this.value;">
        <option></option>
        @foreach( $list as $l )
          @if( isset($l->title) )
            <option value="{{ URL() }}/lrs/{{ $l->_id }}">{{ $l->title }}</option>
          @endif
        @endforeach
      </select>
    </li>
  </ul>
  @endif

  @if( app\locker\helpers\Lrs::lrsCanCreate() )
  <ul class="nav nav-stacked sidebar-nav">
    <li class="link">
      <a href="{{ URL() }}/lrs/create"><i class="icon icon-plus-sign"></i> {{ Lang::get('lrs.new') }}</a>
    </li>
  </ul>
  <div class="clearfix"></div>
  @endif
  
  @include('layouts.sidebars.sidebar_footer')

@endif