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
      foreach ($fields as $field) {
        if (!is_null($field['to'])) {
          $mappedStatement[$field['to']] = 
            !is_null($field['from']) ?
            $statement[$field['from']] :
            null;
        }
      }

      array_push($mappedStatements, $mappedStatement);
    }

    return $mappedStatements;
  }

  public function filter ( $statements, $fields ) {
    $statementFields = [];

    foreach ($fields as $field) {
      array_push($statementFields, $field['from']);
    }

    return $statements->select($statementFields)->get();
  }
}