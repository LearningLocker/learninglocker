<?php namespace Locker\Data\Exporter;

use \Report, \Statement;

/**
* 
*/
class Exporter {
  
  function __construct() {
    # code...
  }

  public function mapFields ( $statements, $fields ) {
    $mappedStatements = [];

    foreach ($statements as $statement) {
      $mappedStatement = [];
      foreach ($fields as $oldField => $newField) {
        $mappedStatement[$newField] = 
          !is_null($statement[$oldField]) ?
          $statement[$oldField] :
          null;
      }

      array_push($mappedStatements, $mappedStatement);
    }

    return $mappedStatements;
  }

  public function filter ( $statements, $fields ) {
    return $statements->select($fields)->get();
  }
}