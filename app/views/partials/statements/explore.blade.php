@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop


@section('content')

  @if($errors->any())
  <ul class="alert alert-danger">
    {{ implode('', $errors->all('<li>:message</li>'))}}
  </ul>
  @endif

  @include('partials.site.elements.page_title', array('page' => Lang::get('statements.explorer') ))

  {{ Breadcrumbs::render('explorer', $lrs) }}

  <div class="row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      @include('partials.statements.elements.selector')
    </div>
  </div>

  <div class="row">
    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4">
      <div class="panel panel-default">
        <div class="panel-heading">
          Filter
        </div>
        <div class="panel-body" style="overflow:hidden">
          <ol>
          <?php $url = URL() . '/lrs/' . $lrs->_id . '/statements/explorer'; ?>
            <li><a href="{{ $url }}">Home</a></li>
          @foreach( $filter as $k => $v )
            <?php $url = $url . '/' . $k . '/' . $v; ?>
            <li><a href="{{  $url }}">{{ $k }}: {{ rawurldecode($v) }}</a></li>
          @endforeach
          </ol>
        </div>
      </div>
      <div class="panel panel-default">
        <div class="panel-heading">
          <span class="pull-right badge badge-default">{{ $total }}</span>
          Result total
        </div>
        <div class="panel-body">
          @if( isset($results) )
            <p>The top four courses (if available) represented in this result set.</p>
            <hr>
            @foreach( $results as $k => $v )
              <?php 
                $percentage = round(($v['count'] / $total)*100, 1);
              ?>
              <div class="clearfix" style="margin-bottom:10px;">
                <span class="explorerChart easyPieChart pull-left" data-percent="{{ $percentage }}"></span>
                <div style="margin-left:96px;padding-top:20px">
                  <span class="label label-default">{{ $percentage }}%</span> {{ $v['name'] }}
                </div>
              </div>
            @endforeach
          @endif
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
    <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8">
      @foreach ( $statements as $statement )
        @include('partials.statements.explore_item', array( 'statement' => $statement ))
      @endforeach
      {{ $statements->links() }}
    </div>
    
  </div>
  
@stop

@section('footer')
  @parent
  @include('partials.graphs.js.morris')
  @include('partials.graphs.data.single_bar')
  @include('partials.graphs.js.easypiechart')
@stop