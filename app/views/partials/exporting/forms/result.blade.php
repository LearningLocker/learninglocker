<div class="reporting-segment">
  <div class="row">
    <div class="col-xs-12 col-sm-6">
      <div class="panel panel-default">
        <div class="panel-heading">
          Scaled
        </div>
        <div class="panel-body">
        
          <div class="form-group scaled">
            <div class="pull-right">
              <input type="text" id="scaled_from" style="width:50px;" disabled="" /> 
              to <input type="text" id="scaled_to" style="width:50px;" disabled="" />
              <span class="btn btn-primary btn-xs" id="scaled_values" data-type="result" 
              style="display:none;"><i class='icon icon-plus'></i></span>
            </div>
            <div class="checkbox">
              <label>
                <input type="checkbox" id="scaled" value="result.score" data-type="result.score.scaled" data-display="Include Scaled"> Scaled
              </label>
            </div>
          </div>

          <div class="form-group scaled">
            <div class="pull-right">
              <input type="text" id="raw_from" style="width:50px;" disabled="" /> to 
              <input type="text" id="raw_to" style="width:50px;" disabled="" />
              <span class="btn btn-primary btn-xs" id="raw_values" data-type="result"  
              style="display:none;"><i class='icon icon-plus'></i></span>
            </div>
            <div class="checkbox">
              <label>
                <input type="checkbox" id="raw" value="result.score" data-type="result.score.raw" data-display="Include Raw"> Raw
              </label>
            </div>
          </div>

          <div class="form-group scaled">
            <div class="pull-right">
              <input type="text" id="min_from" style="width:50px;" disabled="" /> to 
              <input type="text" id="min_to" style="width:50px;" disabled="" />
              <span class="btn btn-primary btn-xs" id="min_values" data-type="result" 
              style="display:none;"><i class='icon icon-plus'></i></span>
            </div>
            <div class="checkbox">
              <label>
                <input type="checkbox" id="min" value="result.score" data-type="result.score.min" data-display="Include Min"> Min
              </label>
            </div>
          </div>

          <div class="form-group scaled">
            <div class="pull-right">
              <input type="text" id="max_from" style="width:50px;" disabled="" /> to 
              <input type="text" id="max_to" style="width:50px;" disabled="" />
              <span class="btn btn-primary btn-xs" id="max_values" data-type="result" 
              style="display:none;"><i class='icon icon-plus'></i></span>
            </div>
            <div class="checkbox">
              <label>
                <input type="checkbox" id="max" value="result.score" data-type="result.score.max" data-display="Include Max"> Max
              </label>
            </div>
          </div>
          
        </div>
      </div>
    </div>
    <div class="col-xs-12 col-sm-6">

      <div class="panel panel-default">
        <div class="panel-heading">
          Success / Complete
        </div>
        <div class="panel-body">

          <div class="form-group scaled">
            <button class="btn btn-xs btn-default pull-right" id="success-clear">Clear</button>
            <b>Success</b>
            <div class="radio">
              <label>
                <input type="radio" name="success" id="success" value="true">
                true
              </label>
            </div>
            <div class="radio">
              <label>
                <input type="radio" name="success" id="success" value="false">
                false
              </label>
            </div>
          </div>

          <div class="form-group scaled">
            <button class="btn btn-xs btn-default pull-right" id="completion-clear">Clear</button>
            <b>Completion</b>
            <div class="radio">
              <label>
                <input type="radio" name="completion" id="completion" value="true">
                true
              </label>
            </div>
            <div class="radio">
              <label>
                <input type="radio" name="completion" id="completion" value="false">
                false
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>