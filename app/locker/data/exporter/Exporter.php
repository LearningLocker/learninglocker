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
   * Adds quotes to a field that already contains quotes.
   * @param  String $field The field to be quoted.
   * @return String        The correctly quoted field.
   */
  private function quoteQuotedField ( $field ) {
    $splits = explode('"', $field);
    $quotedField = array_shift($splits);

    foreach ($splits as $split) {
      $quotedField .= '"' . $split . '"';
    }

    return $quotedField;
  }

  /**
   * Adds quotes to a field if necessary.
   * @param  String $field The field to be quoted.
   * @return String        The correctly quoted field.
   */
  private function quoteField ( $field ) {
    if (strpos($field, '"') !== false) {
      return quoteQuotedField($field);
    } else if (strpos($field, ',') !== false) {
      return '"' . $field . '"';
    } else {
      return $field;
    }
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
            $this->quoteField($statement[$field['from']]) :
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