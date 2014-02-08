<?php namespace Controllers\xAPI;

use Illuminate\Routing\Controller;

class BaseController extends Controller {


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

	protected function returnSuccessError( $success, $message, $code ){
		return \Response::json( array( 'success'  => $success, 
									   'message'  => $message), 
										$code );
	}

}