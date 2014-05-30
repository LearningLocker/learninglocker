<div class="row">
  <div class="col-xs-12">
    <div class="bordered">
      <div id="line-example"></div>
    </div>
  </div>
</div>
<div class="row">
  <div class="col-xs-12 col-sm-12">
    <button class="btn btn-default btn-sm" id="getStatements" style="display:none;"><i class="icon icon-exchange"></i> {{ trans('reporting.view_stats') }}</button>
    <div class="showStatements" style="display:none;">
      <hr>
      <h4>{{ trans('reporting.related') }} <span id="statementCount"></span></h4>
      <div id="statements">

      </div>
    </div>
  </div>
</div>