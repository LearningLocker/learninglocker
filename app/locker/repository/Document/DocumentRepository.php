<?php namespace Locker\Repository\Document;

interface DocumentRepository {

	public function store( $lrs, $id, $contents, $apitype );

	public function find( $lrs, $stateId );

	public function all( $lrs, $activityid );

}