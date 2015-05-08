<script id="dashboardTemplate" type="text/template">
  <div id="contents">

  </div>
</script>

<script id="dashboard" type="text/template">
  
  <div class="row">
    <div class="col-xs-12 col-sm-12">
      <div class="statement-graph clearfix">
        <div id="header"></div>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col-xs-12 col-sm-12">
      <div id="graph"></div>
    </div>
  </div>

  <div class="row">

    <div id="contents-one">
      <div class="col-xs-12 col-sm-12 col-md-4">
        <div class="panel panel-default" style="min-height:400px;">
          <div class="panel-heading">
            Most active users
          </div>
          <div class="panel-body">
            <div id="active-users">
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="contents-two">
      <div class="col-xs-12 col-sm-12 col-md-4">
        <div class="panel panel-default" style="min-height:400px;">
          <div class="panel-heading">
            Popular Activities
          </div>
          <div class="panel-body">
            <div id="popular-activities">

            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="contents-three">
      <div class="col-xs-12 col-sm-12 col-md-4">
        <div class="panel panel-default" style="min-height:400px;">
          <div class="panel-heading">
            <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/reporting" class="btn btn-primary btn-xs pull-right">Visit reporting tool</a>
            Latest reports
          </div>
          <div class="panel-body">
            <div id="latest-reports">

            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</script>

<script id="reportList" type="text/template">
  <div id="recent">
  </div>
</script>

<script id="reportListView" type="text/template">
  <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/reporting#<%= _id %>/graph"><%= name %></a>
</script>

<script id="activityList" type="text/template">
  <div id="popular-activities">
  </div>
</script>

<script id="activityListView" type="text/template">
  <span class="badge badge-warning"><%= count %></span>
  <a href="<%= _id %>"><% if( name[0] && name[0] != 'undefined' ){ %><%= name[0][Object.keys(name[0])[0]] %><% }else if( description[0] && description[0] != 'undefined' ){ %><%= description[0][Object.keys(description[0])[0]] %><% }else{ %><%= _id %><% } %></a>
</script>

<script id="userListView" type="text/template">
  <span class="badge"><%= count %></span>
  <b>Name</b>:
  <%= names.length > 0 ? names.join(', ') : 'Unknown' %></br>
  <%= _id.mbox != null ? '<b>Email:</b> ' + _id.mbox : '' %>
  <%= _id.mbox_sha1sum != null ? '<b>Email:</b> ' + _id.mbox_sha1sum : '' %>
  <%= _id.openid != null ? '<b>OpenID:</b> ' + _id.openid : '' %>
  <%= _id.account != null ? '<b>Account:</b> ' + _id.account.homePage + '/' + _id.account.name : '' %>
</script>

<script id="userList" type="text/template">
  <div id="active" style="overflow-wrap: break-word">
  </div>
</script>

<script id="lineGraph" type="text/template">
  <form id="dateRange" class="form-inline" role="form">
    <span class="input-group col-sm-4" style="display:inline-table">
      <span class="input-group-addon">Since</span>
      <input type="date" class="form-control" id="startDateInput" value="<%= dates().start %>" placeholder="YYYY/MM/DD"/>
    </span>
    <span class="input-group col-sm-4" style="display:inline-table">
      <span class="input-group-addon">Until</span>
      <input type="date" class="form-control" id="endDateInput" value="<%= dates().end %>" placeholder="YYYY/MM/DD"/>
    </span>
    <button type="submit" id="updateGraph" class="btn btn-default" style="vertical-align: top">
      <span class="icon-refresh"></span> Update graph
    </button>
  </form>
  
  <div class="row">
    <div class="col-xs-12 col-sm-12">
      <div class="panel panel-default">
        <div class="panel-body">
          <div id="morrisLine" class="text-center">
            <% if (statement_graph == null || statement_graph === '') { %>
                No data.
            <% } %>
          </div>
        </div>
      </div>
    </div>
  </div>
</script>

<script id="dashboardHeader" type="text/template">
  <h3>Statements <span><%= statement_count %></span></h3>
  <p class="averages">Your daily average is <span style="color:#00cc00;"> <%= statement_avg %> statements</span> with 
  <span style="color:#b85e80"><%= actor_count %> learners</span> in total.</p>
</script>

<script id="showLoading" type="text/template">
  <img src="{{ URL() }}/assets/img/ajax-loader.gif" />
</script>
