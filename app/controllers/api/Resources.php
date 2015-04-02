<?php namespace Controllers\API;

use \LockerRequest as LockerRequest;
use \Response as IlluminateResponse;

abstract class Resources extends Base {

  /**
   * Gets the data from the request.
   * @return Mixed
   */
  protected function getData() {
    return json_decode(LockerRequest::getContent(), true);
  }

  /**
   * Gets all models.
   * @return [Model]
   */
  public function index() {
    return IlluminateResponse::json($this->repo->index($this->getOptions()), 200);
  }

  /**
   * Creates a model.
   * @return Model.
   */
  public function store() {
    return IlluminateResponse::json($this->repo->store($this->getData(), $this->getOptions()), 200);
  }

  /**
   * Gets a model.
   * @param String $id
   * @return Model
   */
  public function show($id) {
    return IlluminateResponse::json($this->repo->show($id, $this->getOptions()), 200);
  }

  /**
   * Updates an model.
   * @param String $id
   * @return Model
   */
  public function update($id) {
    return IlluminateResponse::json($this->repo->update($id, $this->getData(), $this->getOptions()), 200);
  }

  /**
   * Deletes an model.
   * @param String $id
   * @return Boolean
   */
  public function destroy($id) {
    return IlluminateResponse::json($this->repo->destroy($id, $this->getOptions()), 204);
  }
}