<?php namespace Locker\Data\Exporter;

use \Report, \Statement;

/**
* 
*/
class Exporter {
  
  function __construct() {
    # code...
  }

  private function getField ( $value, $field ) {
    $fields = explode('.', $field);
    return $this->getFieldValue($value, $fields, 0, count($fields));
  }

  private function getFieldValue ( $value, $fields, $fieldIndex, $fieldCount ) {
    $set = isset($value[$fields[$fieldIndex]]);
    dd(json_encode($value['statement.id']));

    // Base case: reached last field so return value.
    if ($fieldIndex === $fieldCount - 1) {
      return $set ? $value[$fields[$fieldIndex]] : null;
    }

    // Recursive case: more fields remaining.
    else {
      return $set && isAssoc($value[$fields[$fieldIndex]]) ? $this->getFieldValue(
        $value[$fields[$fieldIndex]],
        $fields,
        $fieldIndex + 1,
        $fieldCount
      ) : null;
    }
  }

  public function mapFields ( $statements, $fields ) {
    $mappedStatements = [];

    foreach ($statements as $statement) {
      $mappedStatement = [];
      foreach ($fields as $oldField => $newField) {
        dd($statement['statement.timestamp']);
        $mappedStatement[$newField] = 
          $this->getField($statement, $oldField) ?
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

  private function isAssoc($arr) {
    return is_array($arr) && array_keys($arr) !== range(0, count($arr) - 1);
  }
}