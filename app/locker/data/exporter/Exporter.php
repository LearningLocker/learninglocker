<?php namespace Locker\Data\Exporter;

use \Report, \Statement;

/**
* 
*/
class Exporter {
	
	function __construct() {
		# code...
	}

	public function filter( $statements, $fields ) {
		return $statements->select($fields)->get()->toJSON();
	}
}