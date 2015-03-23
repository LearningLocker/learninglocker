
  <!-- footer -->
  <div id="footer">
    Powered by
    <a href="http://learninglocker.net" target='_blank'>Learning Locker</a>
    <?php $installed_version = file_get_contents(base_path().'/VERSION'); ?>
    <?php $latest_version = file_get_contents('https://raw.githubusercontent.com/LearningLocker/learninglocker/master/VERSION'); ?>
    <a href="https://github.com/LearningLocker/learninglocker/releases/tag/v{{ $installed_version }}">Version {{ $installed_version }}</a>
    @if ($latest_version !== $installed_version)
      <a href="https://github.com/LearningLocker/learninglocker/releases/latest">You can upgrade to {{ $latest_version }}</a>
    @else
      <a href="https://github.com/LearningLocker/learninglocker/releases/latest">You have the latest version</a>
    @endif
  </div>
