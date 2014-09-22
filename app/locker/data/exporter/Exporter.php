<?php namespace Locker\Data\Exporter;

use \Report, \Statement;

/**
* 
*/
class Exporter {
  
  function __construct() {
    # code...
  }

  /**
   * Adds quotes to a field if necessary.
   * http://stackoverflow.com/questions/3933668/convert-array-into-csv
   * @param  String $field The field to be quoted.
   * @return String        The correctly quoted field.
   */
  private function quoteField($field, $delimiter = ',', $enclosure = '"') {
    $delimiter_esc = preg_quote($delimiter, '/');
    $enclosure_esc = preg_quote($enclosure, '/');

    if (preg_match( "/(?:${delimiter_esc}|${enclosure_esc}|\s)/", $field)) {
      return $enclosure . str_replace(
        $enclosure,
        $enclosure . $enclosure,
        $field
      ) . $enclosure;
    } else {
      return $field;
    }
  }

  /**
   * Gets a field from an AssocArray.
   * @param  AssocArray $object The AssocArray containing the field.
   * @param  String $field  The field to be retrieved.
   * @return String         The value contained in the field.
   */
  private function getField($object, $field) {
    $keys = explode('.', $field);
    $len = count($keys);

    for (
      $i = 0;
      $i < $len && !is_null($object[$keys[$i]]);
      $i += 1
    ) {
      $object = $object[$keys[$i]];
    }

    return $this->quoteField(json_encode($object));
  }

  /**
   * Maps values from old keys to new keys.
   * @param  Array $statements The statements to be mapped.
   * @param  AssocArray $fields     The fields to be mapped.
   * @return Array             The mapped statements.
   */
  public function mapFields ( $statements, $fields ) {
    $mappedStatements = [];

    foreach ($statements as $statement) {
      $mappedStatement = [];
      foreach ($fields as $field) {
        if (!is_null($field['to'])) {
          $mappedStatement[$field['to']] = 
            !is_null($field['from']) ?
            $this->getField($statement, $field['from']) :
            null;
        }
      }

      array_push($mappedStatements, $mappedStatement);
    }

    return $mappedStatements;
  }

  /**
   * Filters the statements.
   * @param  Statement $statements The statement query to be used.
   * @param  AssocArray $fields     The fields to be mapped.
   * @return Array             The array of filtered statements.
   */
  public function filter ( $statements, $fields ) {
    $statementFields = [];

    foreach ($fields as $field) {
      array_push($statementFields, $field['from']);
    }

    return $statements->select($statementFields)->get();
  }
}