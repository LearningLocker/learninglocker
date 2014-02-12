<?php namespace Locker\Repository\Document;

interface DocumentRepository {

  public function store( $lrs, $documentType, $data, $updated, $method );

  public function find( $lrs, $documentType, $data );

  public function all( $lrs, $documentType, $data );

}