@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop

@section('content')
    
  @include('partials.site.elements.page_title', array('page' => Lang::get('statements.statements') ))
  
  @foreach ( $statements as $statement )
        
    @include('partials.statements.item', array( 'statement' => $statement ))

  @endforeach

  {{ $statements->links() }}

@stop