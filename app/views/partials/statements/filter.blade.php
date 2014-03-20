@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop

@section('content')
    
  @include('partials.site.elements.page_title', array('page' => Lang::get('statements.statements') ))

  {{ Breadcrumbs::render('filter', $lrs) }}
  
  <div class="row">
    <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8">
      @foreach ( $statements as $statement )
        @include('partials.statements.item', array( 'statement' => $statement ))
      @endforeach
      {{ $statements->links() }}
    </div>
    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4">
      <div class="panel panel-default">
        <div class="panel-heading">
          Filter
        </div>
        <div class="panel-body" style="overflow:hidden">
          <ol>
          <?php $url = URL() . '/lrs/' . $lrs->_id . '/statements'; ?>
          @foreach( $filter as $k => $v )
            <?php $url = $url . '/' . $k . '/' . $v; ?>
            <li><a href="{{  $url }}">{{ $k }}: {{ rawurldecode($v) }}</a></li>
          @endforeach
          </ol>
        </div>
      </div>
      <div class="panel panel-default">
        <div class="panel-heading">
          Timeline
        </div>
        <div class="panel-body">
          @include('partials.graphs.view.single_bar')
        </div>
      </div>
    </div>
    
  </div>

@stop

@section('footer')
  @parent
  @include('partials.graphs.js.morris')
  @include('partials.graphs.data.single_bar')
  @include('partials.graphs.js.easypiechart')
@stop