<?php namespace Locker\Repository\Statement;

interface Repository {
  public function store(array $statements, array $attachments, array $opts);
  public function index(array $opts);
  public function show($id, array $opts);
  public function getAttachments(array $statements, array $opts);
  public function count(array $opts);
}

class EloquentRepository implements Repository {

  /**
   * Constructs a new EloquentRepository for statements.
   */
  public function __construct() {
    $this->storer = new EloquentStorer();
    $this->indexer = new EloquentIndexer();
    $this->shower = new EloquentShower();
    $this->attacher = new FileAttacher();
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
   * @return [[\stdClass], Int, [String => Mixed]] Array containing the statements, count, and opts.
   */
  public function index(array $opts) {
    $opts = new IndexOptions($opts);
    $builder = $this->indexer->index($opts);
    $count = $this->indexer->count($builder, $opts);
    return [
      $this->indexer->format($builder, $opts),
      $count,
      $opts->options
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

  /**
   * Gets the attachments for the given statements and options.
   * @param [\stdClass] $statements
   * @param [String => Mixed] $opts
   * @return [\stdClass]
   */
  public function getAttachments(array $statements, array $opts) {
    return $this->attacher->index($statements, new IndexOptions($opts));
  }

  /**
   * Gets a count of all the statements available with the given options.
   * @param [String => Mixed] $opts
   * @return Int
   */
  public function count(array $opts) {
    $opts = new IndexOptions($opts);
    $builder = $this->indexer->index($opts);
    return $this->indexer->count($builder, $opts);
  }
}
