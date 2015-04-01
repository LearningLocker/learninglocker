@if( Auth::check() )

  @if( isset($list) )
  <ul class="nav nav-sidebar">
    <li>
      <select class="form-control sidebar-select" onchange="javascript:location.href = this.value;">
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

  @if( \Locker\Helpers\Lrs::lrsCanCreate() )
  <ul class="nav nav-sidebar">
    <li class="">
      <a href="{{ URL() }}/lrs/create"><i class="icon icon-plus-sign"></i> {{ Lang::get('lrs.new') }}</a>
    </li>
  </ul>
  <div class="clearfix"></div>
  @endif
  
  @include('layouts.sidebars.sidebar_footer')

@endif