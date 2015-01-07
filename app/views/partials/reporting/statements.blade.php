@extends('partials.statements.list')

@section('title')
  @include('partials.site.elements.page_title', array('page' => Lang::get('statements.reporting') ))
  <ol class="breadcrumb">
    <li><a href="{{ route('reporting.index', [$report->lrs]) }}" data-toggle="tooltip" data-placement="bottom" title="Click to view reports">{{ Lang::get('statements.reporting') }}</a></li>
    <li class="active" data-toggle="tooltip" data-placement="bottom" title="The name of the report">{{$report->name}}</li>
  </ol>
@stop

@section('buttons')
  <a id="edit" data-toggle="tooltip" data-placement="top" title="Click to edit the report" href="{{ route('reporting.index', [$report->lrs]) }}#{{$report->_id}}/edit" class="btn btn-info"><i class="icon icon-pencil"></i> {{ Lang::get('site.edit') }}</a>
  <a id="graph" data-toggle="tooltip" data-placement="top" title="Click to view the report graph" href="{{ route('reporting.index', [$report->lrs]) }}#{{$report->_id}}/graph" class="btn btn-success"><i class="icon icon-signal"></i> {{ Lang::get('reporting.graph') }}</a>
@stop

@section('footer')
  @parent
  <script type="text/javascript">
    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });
  </script>
@show

