@if( Auth::check() )

  <ul class="nav nav-sidebar">
    <li class="link">
      <select class="form-control sidebar-select" onchange="javascript:location.href = this.value;">
          <option></option>
        <optgroup label="List">
          <option value="{{ URL() }}/site#lrs">{{ Lang::get('lrs.home') }}</option>
        </optgroup>
        <optgroup label="Available LRSs">
          @if( isset($list) )
            @foreach( $list as $l )
              <option value="{{ URL() }}/lrs/{{ $l->_id }}" @if($l->_id == $lrs->_id) SELECTED @endif>{{ $l->title }}</option>
            @endforeach
          @endif
        </optgroup>
      </select>
    </li>
  </ul>
  <ul class="nav nav-sidebar">
    <li class="@if ( isset($dash_nav) ) active @endif">
      <a href="{{ URL() }}/lrs/{{ $lrs->_id }}">
        <span class="menu-icon"><i class="icon icon-bar-chart"></i></span> {{ Lang::get('lrs.sidebar.dash') }}
      </a> 
    </li>
    <li class="@if ( isset($reporting_nav) ) active @endif">
      <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/reporting">
        <span class="menu-icon"><i class="icon icon-pencil"></i></span>  {{ Lang::get('lrs.sidebar.reporting') }}
      </a>
    </li>
    <li class="@if ( isset($exporting_nav) ) active @endif">
      <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/exporting">
        <span class="menu-icon"><i class="icon icon-download"></i></span>  {{ Lang::get('lrs.sidebar.exporting') }}
      </a>
    </li>
    <li class="@if ( isset($statement_nav) ) active @endif">
      <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/statements">
        <span class="menu-icon"><i class="icon icon-exchange"></i></span> {{ Lang::get('statements.statements') }}
      </a>
    </li>
  </ul>
  @if ( \Locker\Helpers\Lrs::lrsOwner($lrs->_id) || \Locker\Helpers\Lrs::lrsEdit($lrs) )
    <h4>{{ Lang::get('site.settings') }}</h4>
    <ul class="nav nav-sidebar">
      <li class="@if ( isset($account_nav) ) active @endif">
        <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/edit" >
          <span class="menu-icon"><i class="icon icon-cog"></i></span> {{ Lang::get('lrs.sidebar.edit') }}
        </a>
      </li>
      <li class="@if ( isset($endpoint_nav) ) active @endif">
        <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/client/manage" >
          <span class="menu-icon"><i class="icon icon-cogs"></i></span> {{ Lang::get('lrs.sidebar.endpoint') }}
        </a>
      </li>
      <li class="@if ( isset($user_nav) ) active @endif">
        <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/users">
          <span class="menu-icon"><i class="icon icon-group"></i></span> {{ Lang::get('lrs.sidebar.users') }}
        </a>
      </li>
    </ul>
  @endif

  @include('layouts.sidebars.sidebar_footer')

@endif