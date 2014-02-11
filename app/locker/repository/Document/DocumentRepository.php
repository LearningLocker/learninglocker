<?php namespace Locker\Repository\Document;

interface DocumentRepository {

	public function store( $lrs, $data, $apitype );

	public function find( $lrs, $stateId );

	public function all( $lrs, $activityId, $actor );

}