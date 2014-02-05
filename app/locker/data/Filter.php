<?php namespace app\locker\data;

/**
 * Data to display when filtering statements
 **/

class Filter extends BaseData {

	protected $data;
	public $timeline_data;

	public function __construct( $data ){
		$this->data = $data;
		$this->timeline();
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

