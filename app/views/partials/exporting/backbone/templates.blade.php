<script id="fieldModel" type="text/template">
  <li class="input-group">
    <input type="text" value="<%= xAPIKey %>" class="form-control typeahead" placeholder="Enter field name" />
    <span id="remove" class="btn btn-danger input-group-addon">
      <i class="icon icon-minus"></i>
    </span>
  </li>
</script>

<script id="fieldCollection" type="text/template">
  <div class="panel panel-default">
    <div class="panel-heading">
      Select fields
    </div>
    <div class="panel-body">
      <ul class="list-group" id="fields">
      </ul>
      <div id="addField" class="btn btn-success">
        <i class="icon icon-plus"></i> {{ Lang::get('exporting.addField') }}
      </div>
    </div>
  </div>
  <div id="run" class="btn btn-primary">
    <i class="icon icon-play-circle"></i> {{ Lang::get('exporting.run') }}
  </div>
  <div id="download" class="btn btn-primary">
    <i class="icon icon-download"></i> {{ Lang::get('exporting.download') }}
  </div>
</script>