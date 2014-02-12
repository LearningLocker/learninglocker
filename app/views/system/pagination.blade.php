<?php
  $presenter = new Illuminate\Pagination\BootstrapPresenter($paginator);
?> 
@if ($paginator->getLastPage() > 1)
  <div class="center">
    <ul class="pagination">
      {{ $presenter->render() }}
    </ul>
  </div>
@endif