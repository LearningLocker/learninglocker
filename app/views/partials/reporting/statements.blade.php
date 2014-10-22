@extends('partials.statements.list')

@section('title')
  @include('partials.site.elements.page_title', array('page' => Lang::get('statements.reporting') ))
  <ol class="breadcrumb">
    <li><a href="{{ route('reporting.index', [$report->lrs]) }}">{{ Lang::get('statements.reporting') }}</a></li>
    <li class="active">{{$report->name}}</li>
  </ol>
@stop

@section('buttons')
  <a id="edit" href="{{ route('reporting.index', [$report->lrs]) }}#{{$report->_id}}/edit" class="btn btn-info"><i class="icon icon-pencil"></i> {{ Lang::get('site.edit') }}</a>
  <a id="graph" href="{{ route('reporting.index', [$report->lrs]) }}#{{$report->_id}}/graph" class="btn btn-success"><i class="icon icon-signal"></i> {{ Lang::get('reporting.graph') }}</a>
@stop