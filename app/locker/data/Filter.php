<?php namespace app\locker\data;

/**
 * Data to display when filtering statements.
 * This class is only here as a hack for a demo - all this 
 * code will be replaced / redone.
 **/

class Filter extends BaseData {

  protected $data;
  public $timeline_data, $results;

  public function __construct( $data ){
    $this->data = $data;
    $this->timeline();
    $this->courses();
  }

  public function courses(){

    $courses = array();
    $return_results = array();

    foreach( $this->data as $d ){
      if( isset($d['context']['contextActivities']) ){
        foreach( $d['context']['contextActivities']['grouping'] as $key => $value ){
          if( $key === 'type' && $value == 'http://adlnet.gov/expapi/activities/course' ){
            $courses[] = $d['context']['contextActivities']['grouping']['id'];
          }
        }
      }
    }

    $array = array_count_values( $courses );
    arsort( $array );
    $results = array_slice($array, 0, 4);

    foreach( $results as $key => $value ){
      $get_name = \Statement::where('context.contextActivities.grouping.id', $key)->first();
      if( isset( $get_name['context']['contextActivities']['grouping']['definition']['name']['en-gb'] ) ){
        $return_results[] = array('name' => $get_name['context']['contextActivities']['grouping']['definition']['name']['en-gb'],
                      'count' => $value);
      }else{
        $return_results[] = array('name' => $get_name['context']['contextActivities']['grouping']['definition']['name']['en-GB'],
                      'count' => $value);
      }
    }

    $this->results = $return_results;

  }

  public function timeline(){

    $set_data = '';
    $count    = 0;
    $first    = true;
    $day      = '';

    foreach( $this->data as $d ){

      $day = substr($d['stored'],0,10);

      if( $first ) {
        $last_timestamp = $day;
      }

      if($day != $last_timestamp && !$first ) {

        $set_data .= json_encode( array( "y" => $last_timestamp, "a" => $count ) ) . ' ';
        $count = 0;
        
      }

      $count++;
      $last_timestamp = $day;
      $first = false;

    }

    $set_data .= json_encode( array( "y" => $day, "a" => $count ) ) . ' ';

    $this->timeline_data = trim( $set_data );

  }

  private function count(){
    return count( $this->data );
  }

}

