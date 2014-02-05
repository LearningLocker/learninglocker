@extends('layouts.master')

@section('sidebar')
	@include('partials.lrs.sidebars.lrs')
@stop

@section('content')

	<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/statements/generator" class="btn btn-default pull-right">
		<i class="icon icon-plus"></i> {{ Lang::get('statements.generator') }}
	</a>

	<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/statements/explorer" class="btn btn-default btn-space pull-right">
		<i class="icon icon-search"></i> {{ Lang::get('statements.explorer') }}
	</a>
		
	@include('partials.site.elements.page_title', array('page' => Lang::get('statements.statements') ))
	
	@foreach ( $statements as $statement )
				
		@include('partials.statements.item', array( 'statement' => $statement ))

	@endforeach

	{{ $statements->links() }}

@stop