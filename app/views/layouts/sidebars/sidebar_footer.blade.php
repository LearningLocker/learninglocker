
  <!-- footer -->
  <div id="footer">
    Powered by
    <a href="http://learninglocker.net" target='_blank'>Learning Locker</a>
    <?php
      $installed_version = file_get_contents(base_path().'/VERSION');
      try {
        $latest_version = file_get_contents(
          'https://raw.githubusercontent.com/LearningLocker/learninglocker/master/VERSION'
        );
      } catch (Exception $ex) {
        $latest_version = null;
      }
    ?>
    <a href="https://github.com/LearningLocker/learninglocker/releases/tag/v{{ $installed_version }}">Version {{ $installed_version }}</a>
    <a href="https://github.com/LearningLocker/learninglocker/releases/latest">
      @if ($latest_version === null)
        Github Releases
      @elseif ($latest_version !== $installed_version)
        You can upgrade to {{ $latest_version }}
      @else
        You have the latest version
      @endif
    </a>
  </div>
