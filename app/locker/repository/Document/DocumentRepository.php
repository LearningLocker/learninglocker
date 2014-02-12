<?php namespace Locker\Repository\Document;

interface DocumentRepository {

	public function store( $lrs, $data, $documentType );

	public function find( $lrs, $documentType, $activityId, $actor, $stateId );

	public function all( $lrs, $documentType, $activityId, $actor );

}