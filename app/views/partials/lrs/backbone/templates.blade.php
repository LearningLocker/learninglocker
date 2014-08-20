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
      <div class="panel panel-default" style="min-height:350px;">
        <div class="panel-body">
          <div class="clearfix"></div>
          <div id="graph"></div>
        </div>
      </div>
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
  <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/reporting/show/<%= _id %>"><%= name %></a>
</script>

<script id="activityList" type="text/template">
  <div id="popular-activities">
  </div>
</script>

<script id="activityListView" type="text/template">
  <span class="badge badge-warning"><%= count %></span>
  <a href="<%= _id %>">
    <% if( name[0] && name[0] != 'undefined' ){ %>
        <%= name[0][Object.keys(name[0])[0]] %>
    <% }else if( description[0] && description[0] != 'undefined' ){ %>
        <%= description[0][Object.keys(description[0])[0]] %>
    <% }else{ %>
        <%= _id %>
    <% } %>
  </a>
</script>

<script id="userListView" type="text/template">
  <span class="badge"><%= count %></span>
  <b>Name</b>:
  <% if( name.length > 1 ){ %>
  <% _.each(name, function(n) { %>  
        <%= n %>, 
  <% }); %>
  <% }else{ %>
  <%= name  %>
  <% } %>
  <br /><b>Email</b>: <%= _id.substr(7) %>
</script>

<script id="userList" type="text/template">
  <div id="active">
  </div>
</script>

<script id="lineGraph" type="text/template">
  <div id="morrisLine" style="height:350px;"></div>
</script>

<script id="dashboardHeader" type="text/template">
  <h3>Statements <span><%= statement_count %></span></h3>
  <p class="averages">Your daily average is <span style="color:#00cc00;"> <%= statement_avg %> statements</span> with 
  <span style="color:#b85e80"><%= actor_count %> learners</span> in total.</p>
</script>

<script id="showLoading" type="text/template">
  <img src="{{ URL() }}/assets/img/ajax-loader.gif" />
</script>