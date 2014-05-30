<div class="reporting-segment">
  <div class="row">
    <div class="col-xs-12">
      <div class="panel panel-default">
        <div class="panel-heading">
          {{ trans('reporting.query') }}
        </div>
        <div class="panel-body">
          <button class="btn btn-danger btn-xs pull-right" id="clear" style="display:none;">{{ trans('reporting.clear') }}</button>
          <button class="btn btn-success btn-xs" id="save" style="display:none;">{{ trans('reporting.save') }}</button>
          <div style="margin:10px 0 10px 0;display:none;" class="create-report">
            <form id="createReport">
              <input type="text" name="name" class="form-control" placeholder="Report name" /><br />
              <input type="text" name="description" class="form-control" placeholder="Report description" /><br />
              <input type="submit" class="btn btn-primary" id="saveQuery" value="Create" />
            </form>
          </div>
          <div id="create-message" class="alert alert-success" style="margin:10px 0 10px 0;display:none;"></div>
          <!-- List group -->
          <div id="display-query"></div>
          <a href="" id="run" data-toggle="tab">
            <div class="btn btn-primary btn-lg btn-block">
              <span><i class="icon-chevron-sign-right" style="color:white;"></i></span>
              {{ trans('reporting.run_query') }}
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>