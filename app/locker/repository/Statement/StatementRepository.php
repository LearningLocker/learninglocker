<?php namespace Locker\Repository\Statement;

interface StatementRepository {

  public function index($lrsId, array $filters, array $options);
  public function show($lrsId, $id, $voided);
  public function toCanonical(array $statements, array $langs);
  public function toIds(array $statements);
  public function getCurrentDate();
  public function create(array $statements, \Lrs $lrs, $attachment);

}