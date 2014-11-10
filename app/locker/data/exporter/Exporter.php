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

    if (preg_match("/(?:${delimiter_esc}|${enclosure_esc}|\s)/", $field)) {
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
   * @param  Boolean $json determines if the field should be json.
   * @return String         The value contained in the field.
   */
  private function getField($object, $field, $json = true) {
    $keys = explode('.', $field);
    $len = count($keys);
    $i = 0;

    while ($i < $len && isset($object[$keys[$i]])) {
      $object = $object[$keys[$i]];
      $i += 1;
    }

    if ($i == $len) {
      if ($json) {
        return $object;
      } else {
        return substr($this->quoteField(json_encode($object)), 2, -2);
      }
    } else {
      return $json ? null : '""';
    }
  }

  /**
   * Maps values from old keys to new keys.
   * @param  Array $statements The statements to be mapped.
   * @param  AssocArray $fields     The fields to be mapped.
   * @param  Boolean $json determines if fields should be json.
   * @return Array             The mapped statements.
   */
  public function mapFields($statements, $fields, $json = true) {
    $mappedStatements = [];

    foreach ($statements as $statement) {
      $mappedStatement = [];
      foreach ($fields as $field) {
        if (!is_null($field['to'])) {
          $mappedStatement[$field['to']] = 
            !is_null($field['from']) ?
            $this->getField($statement, $field['from'], $json) :
            null;
        }
      }

      array_push($mappedStatements, $mappedStatement);
    }

    return $mappedStatements;
  }
}