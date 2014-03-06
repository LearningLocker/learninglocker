<?php namespace Controllers\api;

use \Locker\Repository\Statement\StatementRepository as Statement;

class ReportController extends BaseController {

  /**
  * Statement Repository
  */
  protected $statement;

  /**
   * Filter parameters
   **/
  protected $params;


  /**
   * Construct
   *
   * @param StatementRepository $statement
   */
  public function __construct(Statement $statement){

    $this->statement = $statement;
    $this->beforeFilter('@setParameters');

  }

}