<?php
/**
 * Used to handle an LRSs 3 document APIs.
 *
 **/

use Jenssegers\Mongodb\Model as Eloquent;

class DocumentAPI extends Eloquent {

	/**
	 * Our MongoDB collection used by the model.
	 *
	 * @var string
	 */
	protected $collection = 'documentapi';

	/**
	 * Hidden values we don't return
	 *
	 * @var array
	 *
	 **/
	protected $hidden = array('_id', 'created_at', 'updated_at', 'lrs', 'apitype');


}