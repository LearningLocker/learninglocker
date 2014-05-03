


<div class="row">
  <div class="col-xs-12 col-sm-12 col-lg-12">
    <div class="statement-row clearfix">

      <h4>{{ Lang::get('lrs.client.unnamed_client') }}</h4>
      <div class="col-md-2">
        <b>{{ Lang::get('site.username') }}</b>
      </div>
      <div class="col-md-10">
        {{ $client->api['basic_key']}}
      </div>
      <div class="col-md-2">
        <b>{{ Lang::get('site.password') }}</b>
      </div>
      <div class="col-md-10">
        {{ $client->api['basic_secret'] }}
      </div>

    </div>
  </div>
</div>