<?php namespace Controllers\xAPI;

use Illuminate\Routing\Controller;

class BaseController extends Controller {

    /**
     * Check request header for correct xAPI version
     **/
    public function checkVersion( $route, $request ){

        //should be X-Experience-API-Version: 1.0.0 or 1.0.1 (can accept 1.0), reject everything else.
        $version = \Request::header('X-Experience-API-Version');

        if( !isset($version) || ( $version < '1.0.0' || $version > '1.0.9' ) && $version != '1.0' ){
            return $this->returnSuccessError( true, 'This is not an accepted version of xAPI.', '400' );
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

	public function returnArray( $statements=array(), $params=array() ){

        $array = array(
            'X-Experience-API-Version'   =>  \Config::get('xapi.using_version'),
            'route'     =>  \Request::path()
        );

        $array['params'] = $params;

        //replace replace &46; in keys with . 
        //see https://github.com/LearningLocker/LearningLocker/wiki/A-few-quirks for more info
        if( !empty($statements) ){
        	foreach( $statements as &$s ){
        		$s = \app\locker\helpers\Helpers::replaceHtmlEntity( $s );
        	}
        }
        
        $array['statements'] = $statements;

        $array['more'] = '';//if more results available, provide link to access them

        return \Response::make( $array, 200 );
        
    }


    /**
     * Get all of the input and files for the request and store them in params.
     *
     */
    public function setParameters(){

        $this->params = \Request::all();

    }

    /**
     * Return JSON with success boolean, message and HTTP status code
     * @param  $success
     * @param  $message
     * @param  $code    HTTP Status code
     * @return Response
     */
	protected function returnSuccessError( $success, $message, $code ){
		return \Response::json( array( 'success'  => $success, 
									   'message'  => $message), 
										$code );
	}

}