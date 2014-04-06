<script id="lrsTemplate" type="text/template">
  <td>
    <a href="{{ URL() }}/lrs/<%= _id %>"><%= title %></a>
  </td>
  <td>
    <%= description %>
  </td>
  <td>
    <%= statement_total %>
  </td>
  <td>
    <%= users.length %>
  </td>
  <td>
    <%= created_at %>
  </td>
  <td>
    <a href="{{ URL() }}/lrs/<%= _id %>/edit" class="btn btn-xs btn-success btn-space" title="{{ Lang::get('site.edit') }}"><i class="icon-pencil"></i></a>
  </td>
  <td>
    <button class="btn btn-danger btn-xs delete" title="{{ Lang::get('site.delete') }}"><i class="icon-trash"></i></button>
  </td>
</script>

<script id="lrsTable" type="text/template">
  <thead>        
    <tr>
      <th>Title</th>
      <th>Description</th>
      <th>Statement #</th>
      <th>User #</th>
      <th>Created</th>
      <th>Edit</th>
      <th></th>
    </tr>
  </thead>
  <tbody></tbody>
</script>

<script id="userTemplate" type="text/template">
  <td class="col-sm-1">
    <% 
      if ( verified != 'yes' ){
        var setIcon  = '<i class="icon-check-empty"></i>';
        var setClass = 'class="label label-default verify"';
      }else{
        var setIcon  = '<i class="icon-check"></i>';
        var setClass = 'class="label label-success verify"';
      }
    %>

    <div <%= setClass %> data-id="<%= _id %>" data-toggle="tooltip" data-placement="right" title="Click to manually verify user.">
      {{ Lang::get('users.verified') }} 
      <%= setIcon %>
    </div>
  </td>
  <td class="col-sm-2">
    <a href="#user/lrs"><%= name %></a>
  </td>
  <td class="col-sm-2">
    <%= email %>
  </td>
  <td class="col-sm-4">
    <% if ( lrs_owned.length > 0 ){ %>
      <p>Lrs's owned:
      <% _.each(lrs_owned, function(lrs) { %>  
        <a href="{{ URL() }}/lrs/<%= lrs._id %>"><%= lrs.title %></a>, 
      <% }); %>
      </p>
    <% } %>
    <% if ( lrs_member.length > 0 ){ %>
    <p>Lrs's member:
    <% _.each(lrs_member, function(member) { %>  
      <a href="{{ URL() }}/lrs/<%= member._id %>"><%= member.title %></a>, 
    <% }); %>
    </p>
    <% } %>
  </td>
  <td class="col-sm-2">
    <select class="form-control role-select" id="<%= _id %>">
      <option value="super" <% if (role == 'super'){ %> selected <% } %>>Super</option>
      <option value="admin" <% if (role == 'admin'){ %> selected <% } %>>Admin</option>
      <option value="observer" <% if (role == 'observer'){ %> selected <% } %>>Observer</option>
    </select>
  </td>
  <td class="col-sm-2">
    <%= created_at %>
  </td>
  <td class="col-sm-1">
    <button class="btn btn-danger btn-xs delete" title="{{ Lang::get('site.delete') }}"><i class="icon-trash"></i></button>
  </td>
</script>

<script id="userTable" type="text/template">
  <thead>        
    <tr>
      <th>Status</th>
      <th>Name</th>
      <th>Email</th>
      <th>LRSs</th>
      <th>Role</th>
      <th>Joined</th>
      <th></th>
    </tr>
  </thead>
  <tbody></tbody>
</script>

<script id="appTemplate" type="text/template">
  <td>
    <a href="#user/lrs"><%= name %></a>
  </td>
  <td>
    <%= description %>
  </td>
  <td>
    @todo
  </td>
  <td>
    <%= owner.name %>
  </td>
  <td>
    <%= organisation.name %>
  </td>
  <td>
    <%= created_at %>
  </td>
  <td>
    <button class="btn btn-danger btn-xs delete" title="{{ Lang::get('site.delete') }}"><i class="icon-remove"></i></button>
  </td>
</script>

<script id="appTable" type="text/template">
  <thead>        
    <tr>
      <th>Title</th>
      <th>Description</th>
      <th>Grant</th>
      <th>Owner</th>
      <th>Organisation</th>
      <th>Created</th>
      <th></th>
    </tr>
  </thead>
  <tbody></tbody>
</script>

<script id="noItemsView_template" type="text/template">
  <p>Nothing exists.</p>
</script>

<script id="addNew" type="text/template">
  <a href="{{ URL() }}/lrs/create" class="btn btn-default pull-right">{{ Lang::get('lrs.create') }}
</script>

<script id="mainTemplate" type="text/template">
  <div id="contents">

  </div>
</script>

<script id="dashboardStats" type="text/template">
  <div class="row">
    <div class="col-xs-12 col-sm-4 col-lg-4">
      <div class="bordered stats-box">
        <span><%= stats.lrs_count %></span>
        Total LRSs
      </div>
    </div>
    <div class="col-xs-12 col-sm-4 col-lg-4">
      <div class="bordered stats-box">
        <span><%= stats.statement_count %></span>
        Total Statements
      </div>
    </div>
    <div class="col-xs-12 col-sm-4 col-lg-4">
      <div class="bordered stats-box">
        <span><%= stats.user_count %></span>
        Total Users
      </div>
    </div>
  </div>
</script>

<script id="lineGraph" type="text/template">
  <div class="row">
    <div class="col-xs-12 col-sm-12">
      <div class="panel panel-default">
        <div class="panel-body">
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

<script id="indexTemplate" type="text/template">
  <div class="row">
    <div class="col-xs-12 col-sm-12 col-lg-12">
      <div id="header">
        
      </div>
      <div id="graph">

      </div>
      <div id="contents">

      </div>
    </div>
  </div>
</script>

<script id="settingsTemplate" type="text/template">
  <a href="{{ URL() }}/site/<%= _id %>/edit" class="btn btn-default pull-right">Edit</a>
  <div class="table-responsive">
    <table class="table table-bordered table-striped">
      <tbody>
        <tr>
          <td class="col-sm-2"><b>{{ Lang::get('site.name') }}</b></td>
          <td><%= name %></td>
        </tr>
        <tr>
          <td><b>{{ Lang::get('site.description') }}</b></td>
          <td><%= description %></td>
        </tr>
        <tr>
          <td><b>{{ Lang::get('site.email') }}</b></td>
          <td><%= email %></td>
        </tr>
        <tr>
          <td><b>{{ Lang::get('site.language') }}</b></td>
          <td><%= lang %></td>
        </tr>
        <tr>
          <td><b>{{ Lang::get('site.create_lrs') }}</b></td>
          <td>
            <% _.each(create_lrs, function(create) { %>  
              <%= create %>, 
            <% }); %>
          </td>
        </tr>
        <tr>
          <td><b>{{ Lang::get('site.api_status') }}</b></td>
          <td>
            <span class="label <% if ( api != 'Off' ){ %> label-success <% }else{ %> label-danger <% } %>">API <%= api %></span>
          </td>
        </tr>
        <tr>
          <td><b>{{ Lang::get('site.registration') }}</b></td>
          <td>
            <span class="label <% if ( registration == 'Open' ){ %> label-success <% }else{ %> label-danger <% } %>">
              <%= registration %>
            </span>
          </td>
        </tr>
        <tr>
          <td><b>{{ Lang::get('site.restrict') }}</b></td>
          <td>
            <% if ( domain == 'undefined' ){ %> None <% }else{ %> <%= domain %> <% } %>
          </td>
        </tr>
        <tr>
          <td><b>{{Lang::get('site.claim')}}</b></td>
          <td><span class="label <% if ( claim != 'No' ){ %> label-success <% }else{ %> label-danger <% } %>"><%= claim %></span></td>
        </tr>
      </tbody>
    </table>
  </div>
</script>

<script id="showLoading" type="text/template">
  <img src="{{ URL() }}/assets/img/ajax-loader.gif" />
</script>