<script id="dashboardTemplate" type="text/template">
  <div id="contents">

  </div>
</script>

<script id="dashboard" type="text/template">
  <div class="row">
    <div class="col-xs-12 col-sm-12 col-lg-12">
      <div id="header"></div>
      <div id="graph"></div>
      <div class="row">
        <div id="contents-one"></div>
        <div id="contents-two"></div>
        <div id="contents-three"></div>
      </div>
    </div>
  </div>
</script>

<script id="activitiesWidget" type="text/template">
<div class="col-xs-12 col-sm-4">
  <div class="panel panel-default">
    <div class="panel-heading">
      Popular Activities
    </div>
    <div class="panel-body">
      This will be the body.
    </div>
  </div>
</div>
</script>

<script id="usersWidget" type="text/template">
<div class="col-xs-12 col-sm-4">
  <div class="panel panel-default">
    <div class="panel-heading">
      Most Active Learners
    </div>
    <div class="panel-body">
      This will be the body.
    </div>
  </div>
</div>
</script>

<script id="buttonWidget" type="text/template">
<div class="col-xs-12 col-sm-4">
  <div class="panel panel-default">
    <div class="panel-heading">
      Options
    </div>
    <div class="panel-body">
      <button class="btn btn-block btn-primary">Reporting tool</button>
      <button class="btn btn-block btn-primary">Saved reports</button>
    </div>
  </div>
</div>
</script>


<script id="lineGraph" type="text/template">
  <div class="row">
    <div class="col-xs-12 col-sm-12">
      <div class="panel panel-default">
        <div class="panel-body">
          <div class="btn-group pull-right">
            <button type="button" class="btn btn-default btn-sm active">All</button>
            <button type="button" class="btn btn-default btn-sm">Last Month</button>
            <button type="button" class="btn btn-default btn-sm">Last Week</button>
          </div>
          <div class="clearfix"></div>
          <div id="morrisLine" style="height:350px;"></div>
        </div>
      </div>
    </div>
  </div>
</script>

<script id="dashboardHeader" type="text/template">
  <div class="row">
    <div class="col-xs-12 col-sm-12">
      <div class="statement-graph clearfix">
        <h3>Statements <span><%= stats.statement_count %></span></h3>
        <p class="averages">Your daily average is <span style="color:#00cc00;"> <%= stats.statement_avg %> statements</span> with 
        <span style="color:#b85e80"><%= stats.learner_avg %> learners</span> participating.</p>
      </div>
    </div>
  </div>
</script>

<script id="showLoading" type="text/template">
  <img src="{{ URL() }}/assets/img/ajax-loader.gif" />
</script>