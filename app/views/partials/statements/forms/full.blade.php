{{ Form::open(array('route' => 'statements.store', 'class' => 'form-horizontal')) }}
  <div class="bordered">
    <h4>Actor</h4>
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('actor_objectType', 'ObjectType', array('class' => 'col-sm-4 control-label' )) }}
          <div class="col-sm-8">
             {{ Form::select('actor_objectType', array('Agent' => 'Agent', 'Group' => 'Group' ), '', array('class' => 'form-control')) }}
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('actor_name', 'Name', array('class' => 'col-sm-4 control-label' )) }}
          <div class="col-sm-8">
            {{ Form::text('actor_name', '',array('class' => 'form-control')) }}
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('actor_identifier', 'Funcitonal Identifier', array('class' => 'col-sm-4 control-label' )) }}
          <div class="col-sm-8">
            {{ Form::select('actor_identifier', array('mbox' => 'mbox', 'mbox_sha1sum' => 'mbox_sha1sum', 
            'openID' => 'OpenID', 'account' => 'Account' ), '', array('class' => 'form-control', 'required' => true)) }}
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('actor_identifierValue', 'Identifier Value', array('class' => 'col-sm-4 control-label' )) }}
          <div class="col-sm-8">
            {{ Form::text('actor_identifierValue', '',array('class' => 'form-control', 'required' => true)) }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="bordered clearfix">
    <h4>Verb</h4>
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('verb', 'Established verb', array('class' => 'col-sm-4 control-label' )) }}
          <div class="col-sm-8">
            <select name="verb" class="form-control" required='true'>
              <option></option>
              @foreach ( $verbs as $key => $value)
              <option value="{{ $key }}">
              {{ $value }}
              </option>
              @endforeach
            </select>
          </div>
        </div>
      </div>
    </div>
    <hr>
    <div><h5>Or, add a custom verb</h5></div>
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('verb_uri', 'ID', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('verb_uri', '',array('class' => 'form-control', 'placeholder' => 'Verb Uri')) }}
            <p class="help-block">Put in some help text.</p>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('verb_display', 'Display', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('verb_display', '',array('class' => 'form-control')) }}
            <p class="help-block">Put in some help text.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="bordered clearfix">
    <h4>Object</h4>
    <div class="form-group">
      {{ Form::label('object_objectType', 'ObjectType', array('class' => 'col-sm-2 control-label' )) }}
      <div class="col-sm-10">
         {{ Form::select('object_objectType', array('actvity' => 'Activity', 'agent' => 'Agent', 
         'group' => 'Group', 'statementRef' => 'StatementRef' ), '', array('class' => 'form-control')) }}
      </div>
    </div>
    <hr>
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('activity_id', 'ID', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('activity_id', '',array('class' => 'form-control', 'required' => true)) }}
            <p class="help-block">Put in some help text.</p>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('definition', 'Definition', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('definition', '',array('class' => 'form-control')) }}
            <p class="help-block">Put in some help text.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('activity_name', 'Name', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('activity_name', '',array('class' => 'form-control')) }}
            <p class="help-block">Put in some help text...</p>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('activity_description', 'Description', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('activity_description', '',array('class' => 'form-control')) }}
            <p class="help-block">Put in some help text.</p>
          </div>
        </div>
      </div>
    </div>
    <button class="btn btn-success btn-xs"><i class="icon icon-plus-sign-alt"></i> Add Extension</button>
  </div>

  <div class="bordered">
    <h4>Result</h4>
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('success', 'Success', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::select('success', array('', 'true', 'false' ), '', array('class' => 'form-control')) }}
          </div>
        </div>
        <div class="form-group">
          {{ Form::label('completed', 'Completed', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::select('completed', array('', 'true', 'false' ), '', array('class' => 'form-control')) }}
          </div>
        </div>
        <div class="form-group">
          {{ Form::label('response', 'Response', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('response', '',array('class' => 'form-control', 'placeholder' => 'Response')) }}
          </div>
        </div>
        <div class="form-group">
          {{ Form::label('duration', 'Duration', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('duration', '',array('class' => 'form-control', 'placeholder' => 'Duration')) }}
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('scaled', 'Scaled', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('scaled', '',array('class' => 'form-control', 'placeholder' => 'Response')) }}
          </div>
        </div>
        <div class="form-group">
          {{ Form::label('raw', 'Raw', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('raw', '',array('class' => 'form-control', 'placeholder' => 'Response')) }}
          </div>
        </div>
        <div class="form-group">
          {{ Form::label('min', 'Min', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('min', '',array('class' => 'form-control', 'placeholder' => 'Response')) }}
          </div>
        </div>
        <div class="form-group">
          {{ Form::label('max', 'Max', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('max', '',array('class' => 'form-control', 'placeholder' => 'Duration')) }}
          </div>
        </div>
      </div>
    </div>
    <button class="btn btn-success btn-xs"><i class="icon icon-plus-sign-alt"></i> Add Extension</button>
  </div>

  <div class="bordered">
    <h4>Context</h4>
    <span class="label label-default">@todo</span>
    <button class="btn btn-success btn-xs"><i class="icon icon-plus-sign-alt"></i> Add Extension</button>
  </div>

  <div class="bordered">
    <h4>Attachments</h4>
    <span class="label label-default">@todo</span>
  </div>

  <div class="bordered clearfix">
    <h4>Language</h4>
    <div class="form-group">
      <div class="col-sm-4">
        <?php $lang = \Site::first()->lang; ?>
        {{ Form::text('language', $lang,array('class' => 'form-control', 'placeholder' => 'en-US')) }}
      </div>
    </div>
  </div>

  <hr>

  <button type="submit" class="btn btn-primary">Generate</button>
  <input type="hidden" name="_token" value="{{ csrf_token() }}" />
  <input type="hidden" name="lrs" value="{{ $lrs->_id }}" />
</form>
     