<?php namespace Controllers\API;

use \Locker\Data\Analytics\AnalyticsInterface as Analytics;

class StatementController extends BaseController {

  /**
  * Analytics Interface
  */
  protected $analytics;

  /**
   * Filter parameters
   **/
  protected $params;


  /**
   * Construct
   *
   * @param StatementRepository $statement
   */
  public function __construct(Analytics $analytics){

    $this->analytics = $analytics;
    $this->beforeFilter('@setParameters');
    $this->beforeFilter('@getLrs');

  }

  /**
   * Return raw statements based on filter
   *
   * @param Object $options
   * @return Json  $results
   *
   **/
  public function index(){

    //were statement sections passed?
    if( isset( $this->params['sections'] ) ){
      $section = json_decode( $this->params['sections'], true);
      $section = $section;
    }else{
      $section = [];
    }

    $data = $this->analytics->analytics( $this->lrs->_id, $this->params, 'statements', $section );

    if( $data['success'] == false ){
      return $this->returnSuccessError( false, \Lang::get('apps.no_data'), 400 );
    }

    return $this->returnJson( $data['data'] );

  }

}