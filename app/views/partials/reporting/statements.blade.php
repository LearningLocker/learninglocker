@extends('partials.statements.list')

@section('title')
  <div class="page-header">
    <h1>{{ Lang::get('statements.reporting') }}<span style="margin-left: 10px; font-size:15px; vertical-align:middle;"><i class="icon icon-question-sign" data-toggle="modal" data-target="#myModal"></i></span></h1>

    <!-- Modal -->
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title" id="myModalLabel">What is a report?</h4>
          </div>
          <div class="modal-body">
            <p>Reports allow you to filter statements that were sent to the LRS by a range of criteria; this is useful if you just want to see all the statements for a particular actor, activity, etc. or a combination thereof.</p><p>For example, a report would allow you to retrieve all of the statements made by Joe Bloggs in Decemeber on the "Maths 101" course.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ol class="breadcrumb">
    <li><a href="{{ route('reporting.index', [$report->lrs]) }}" data-toggle="tooltip" data-placement="bottom" title="View all of the reports for this LRS">{{ Lang::get('statements.reporting') }}</a></li>
    <li class="active">{{$report->name}}</li>
  </ol>
@stop

@section('buttons')
  <a id="edit" href="{{ route('reporting.index', [$report->lrs]) }}#{{$report->_id}}/edit" class="btn btn-info"><i class="icon icon-pencil"></i> {{ Lang::get('site.edit') }}</a>
  <a id="graph" data-toggle="tooltip" data-placement="top" title="View a graph of statements that match this report" href="{{ route('reporting.index', [$report->lrs]) }}#{{$report->_id}}/graph" class="btn btn-success"><i class="icon icon-signal"></i> {{ Lang::get('reporting.graph') }}</a>
@stop

@section('footer')
  @parent
  <script type="text/javascript">
    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });
  </script>
@stop
