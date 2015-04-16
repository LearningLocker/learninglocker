<?php namespace Locker\Repository\Statement;

interface Repository {
  public function store(array $statements, array $attachments, array $opts);
  public function index(array $opts);
  public function show($id, array $opts);
}

class EloquentRepository implements Repository {

  /**
   * Constructs a new EloquentRepository for statements.
   */
  public function __construct() {
    $this->storer = new EloquentStorer();
    $this->indexer = new EloquentIndexer();
    $this->shower = new EloquentShower();
  }

  /**
   * Stores statements and attachments with the given options.
   * @param [\stdClass] $statements
   * @param [\stdClass] $attachments
   * @param [String => Mixed] $opts
   * @return [String] UUIDs of the stored statements.
   */
  public function store(array $statements, array $attachments, array $opts) {
    return $this->storer->store($statements, $attachments, new StoreOptions($opts));
  }

  /**
   * Gets all of the available models with the options.
   * @param [String => Mixed] $opts
   * @return [[\stdClass], Int] Array containing the statements and count.
   */
  public function index(array $opts) {
    $opts = new IndexOptions($opts);
    $builder = $this->indexer->index($opts);
    return [
      $this->indexer->format($builder, $opts),
      $this->indexer->count($builder, $opts)
    ];
  }

  /**
   * Gets the model with the given ID and options.
   * @param String $id ID to match.
   * @param [String => Mixed] $opts
   * @return [\stdClass]
   */
  public function show($id, array $opts) {
    return $this->shower->show($id, new ShowOptions($opts));
  }
}