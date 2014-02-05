@if( Auth::check() )

	<ul style="margin-bottom:30px;">
		<li class="link">
			<select class="form-control" style="width:220px;" onchange="javascript:location.href = this.value;">
					<option></option>
				<optgroup label="List">
					<option value="{{ URL() }}/lrs">{{ Lang::get('lrs.home') }}</option>
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
	<ul class="nav nav-stacked sidebar-nav">
		<li class="link  @if ( isset($dash_nav) ) active @endif">
			<a href="{{ URL() }}/lrs/{{ $lrs->_id }}">
				<span class="menu-icon"><i class="icon icon-dashboard"></i></span> {{ Lang::get('lrs.sidebar.dash') }}
			</a> 
		</li>
		<li class="link @if ( isset($statement_nav) ) active @endif">
			<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/statements">
				<span class="menu-icon"><i class="icon icon-exchange"></i></span> {{ Lang::get('statements.statements') }}
			</a>
		</li>
		<li class="link @if ( isset($analytics_nav) ) active @endif">
			<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/analytics">
				<span class="menu-icon"><i class="icon icon-bar-chart"></i></span>  {{ Lang::get('lrs.sidebar.analytics') }}
			</a>
		</li>
		<li class="link @if ( isset($reporting_nav) ) active @endif">
			<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/reporting">
				<span class="menu-icon"><i class="icon icon-pencil"></i></span>  {{ Lang::get('lrs.sidebar.reporting') }}
			</a>
		</li>
	</ul>
	@if ( app\locker\helpers\Lrs::lrsOwner($lrs->_id) )
		<h3>{{ Lang::get('site.settings') }}</h3>
		<ul class="nav nav-stacked sidebar-nav">
			<li class="link @if ( isset($account_nav) ) active @endif">
				<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/edit" >
					<span class="menu-icon"><i class="icon icon-cog"></i></span> {{ Lang::get('lrs.sidebar.edit') }}
				</a>
			</li>
			<li class="link @if ( isset($endpoint_nav) ) active @endif">
				<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/endpoint" >
					<span class="menu-icon"><i class="icon icon-cogs"></i></span> {{ Lang::get('lrs.sidebar.endpoint') }}
				</a>
			</li>
			<!--
			<li class="link @if ( isset($api_nav) ) active @endif">
				<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/api">
					<span class="menu-icon"><i class="icon icon-code"></i></span>  {{ Lang::get('lrs.sidebar.api') }}
				</a>
			</li>
			-->
			<li class="link @if ( isset($user_nav) ) active @endif">
				<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/users">
					<span class="menu-icon"><i class="icon icon-group"></i></span> {{ Lang::get('lrs.sidebar.users') }}
				</a>
			</li>
		</ul>
	@endif
	<div class="clearfix"></div>
	
	@include('layouts.sidebars.sidebar_footer')

@endif