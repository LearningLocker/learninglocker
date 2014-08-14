<?php namespace Controllers\API;

use Illuminate\Routing\Controller;

class BaseController extends Controller {


public function CORSOptions(){
  $statusCode = 204;

  $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : URL();

  $headers = [
      'Access-Control-Allow-Origin'      => $origin,
      'Access-Control-Allow-Methods'     => 'GET, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers'     => 'Origin, Content-Type, Accept, Authorization, X-Requested-With, X-Experience-API-Version, X-Experience-API-Consistent-Through, Updated',
      'Access-Control-Allow-Credentials' => 'true'
  ];

  return \Response::make(null, $statusCode, $headers);
}

public function returnJSON( $data=array(), $additional_params=array(), $extra=array(), $debug=array() ){

    $json = array(
        'version'   =>  \Config::get('api.using_version'),
        'route'     =>  \Request::path()
    );

    $json['url_params'] = \Route::getCurrentRoute()->parameters();

    $params = $this->params;
    if( isset($this->params['filter']) ){
      $params['filter'] = json_decode( $this->params['filter'] );
    }
  
    if( sizeof($additional_params) > 0 ){
      $params = array_merge( $params, $additional_params);
    }

    $json['params'] = $params;

    if( sizeof($extra)>0){
      $json = array_merge( $json, $extra );
    }
        
    $json['data'] = $data;

    if( \Config::get('app.debug') ){
      $json['debug'] = array(
        'sql'   =>  \DB::getQueryLog()
      );

      $json['debug'] = array_merge($json['debug'], $debug );
    }

    return \Response::json( $json );
        
  }

  /**
  * GENERIC MODEL HANDLING
  **/

  protected function findModel( $modelType, $id, $with=array() ){

    $model = $modelType::with( $with )->find($id);

    if( is_null($model)){
      \App::abort(404, 'Model not found');
    } else {
      return $model;
    }

  }

  protected function returnModel($model){
    return $this->returnJSON( $model->toArray() );
  }

  protected function returnSuccessError( $success, $message, $code ){
    return \Response::json( array( 'success'  => $success, 'message'  => $message), $code );
  }

  /**
   * Get all of the input and files for the request and store them in params.
   *
   */
  public function setParameters(){
    $this->params = \Request::all();

    if( !isset($this->params['content']) ){
      $this->params['content'] = file_get_contents("php://input");
    }
  }
  
  /**
   * Get the LRS details based on Auth credentials
   *
   **/
  public function getLrs(){
    //get the lrs
    $key    = \Request::getUser();
    $secret = \Request::getPassword();
    $lrs    = \Lrs::where('api.basic_key', $key)
           ->where('api.basic_secret', $secret)
           ->first();
    $this->lrs = $lrs;
  }


}