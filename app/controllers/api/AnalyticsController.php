<?php namespace Controllers\API;

use \Locker\Data\Analytics\AnalyticsInterface as Analytics;

class AnalyticsController extends BaseController {

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

  }

  /**
   * Our pre-defined segment routes. These allow for easy querying of one of 
   * the following: verb, agents, activities, results, courses, badges.
   *
   * @param $param
   *
   * @return jSON response 
   *
   **/
  public function getSection( $section ){

    $filter       = isset($this->params['filter'])       ? $this->params['filter']       : '';
    $returnFields = isset($this->params['returnFields']) ? $this->params['returnFields'] : '';

    $data = $this->analytics->section( $section, $filter, $returnFields );

    if( $data['success'] == false ){
      return $this->returnSuccessError( false, \Lang::get('apps.api.invalid_route'), 400 );
    }

    return $this->returnJson( $data['data']['result'] );

  }

  /**
   * Return suitable analytics based on options passed.
   *
   * @param Object $options
   * @return Json  $results
   *
   **/
  public function index(){

    $data = $this->analytics->analytics( $this->params );

    if( $data['success'] == false ){
      return $this->returnSuccessError( false, \Lang::get('apps.no_data'), 400 );
    }

    return $this->returnJson( $data['data']['result'] );

  }

}