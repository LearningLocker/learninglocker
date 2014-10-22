@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop

@section('content')
    
  @section('title')  
    @include('partials.site.elements.page_title', array('page' => Lang::get('statements.statements') ))
  @show
  
  @foreach ( $statements as $statement )
        
    @include('partials.statements.item', array( 'statement' => $statement ))

  @endforeach

  {{ $statements->links() }}

  <div>
    @section('buttons')
    @show
  </div>

@stop