<div class="reporting-segment">
  <div class="row">
    <div class="col-xs-12">
      <div class="panel panel-default">
        <div class="panel-heading">
          Query
        </div>
        <div class="panel-body">
          <button class="btn btn-danger btn-xs pull-right" id="clear">Clear</button>
          <button class="btn btn-success btn-xs" id="save">Save</button>
          <div style="margin:10px 0 10px 0;display:none;" class="create-report">
            <form id="createReport">
              <input type="text" name="name" class="form-control" placeholder="Report name" /><br />
              <input type="text" name="description" class="form-control" placeholder="Report description" /><br />
              <input type="submit" class="btn btn-primary" id="saveQuery" value="Create" />
            </form>
          </div>
          <div id="create-message" class="alert alert-success" style="display:none;"></div>
        </div>
        <!-- List group -->
        <ul class="list-group">
          <li class="list-group-item clearfix">
            <div id="display-query">
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>