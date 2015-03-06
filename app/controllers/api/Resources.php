<?php namespace Controllers\API;

use \LockerRequest as LockerRequest;
use \Response as IlluminateResponse;
use \Helpers\Exceptions\NotFoundException as NotFoundException;

class Resources extends BaseController {

  /**
   * Constructs a new resource controller.
   */
  public function __construct() {
    $this->beforeFilter('@setParameters');
    $this->beforeFilter('@getLrs');
  }

  /**
   * Gets the options from the request.
   * @return [String => Mixed]
   */
  protected function getOptions() {
    return [
      'lrs_id' => $this->lrs->_id
    ];
  }

  /**
   * Gets the data from the request.
   * @return Mixed
   */
  protected function getData() {
    return json_decode(LockerRequest::getContent(), true);
  }

  /**
   * Constructs an error response.
   * @return \Illuminate\Http\JsonResponse Response containing the exception details.
   */
  protected function errorResponse(Exception $exception, $code = 400, $headers = []) {
    return IlluminateResponse::json([
      'message' => $exception->getMessage(),
      'trace' => Config::get('app.debug') ? $exception->getTrace() : trans('api.info.trace')
    ], $code, $headers);
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
    try {
      return IlluminateResponse::json($this->repo->show($id, $this->getOptions()), 200);
    } catch (NotFoundException $ex) {
      return $this->errorResponse($ex, 404);
    }
  }

  /**
   * Updates an model.
   * @param String $id
   * @return Model
   */
  public function update($id) {
    try {
      return IlluminateResponse::json($this->repo->update($id, $this->getData(), $this->getOptions()), 200);
    } catch (NotFoundException $ex) {
      return $this->errorResponse($ex, 404);
    }
  }

  /**
   * Deletes an model.
   * @param String $id
   * @return Boolean
   */
  public function destroy($id) {
    try{
      return IlluminateResponse::json($this->repo->destroy($id, $this->getOptions()), 204);
    } catch (NotFoundException $ex) {
      return $this->errorResponse($ex, 404);
    }
  }
}