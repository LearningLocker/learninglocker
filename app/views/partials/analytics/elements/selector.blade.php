<div class="row">
	<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/analytics">
	<div class="col-xs-6 col-sm-2">
		<div class="explore-option @if( $selected == 'verbs' ) active @endif">
			<span class="red-icon"><i class="icon icon-cloud"></i></span>
			Verbs
		</div>
	</div>
	</a>
	<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/analytics/badges">
	<div class="col-xs-6 col-sm-2">
		<div class="explore-option @if( $selected == 'badges' ) active @endif">
			<span class="red-icon"><i class="icon icon-shield"></i></span>
			Badges
		</div>
	</div>
	</a>
	<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/analytics/participation">
	<div class="col-xs-6 col-sm-2">
		<div class="explore-option @if( $selected == 'participation' ) active @endif">
			<span class="red-icon"><i class="icon icon-group"></i></span>
			Participation
		</div>
	</div>
	</a>
	<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/analytics/courses">
	<div class="col-xs-6 col-sm-2">
		<div class="explore-option @if( $selected == 'courses' ) active @endif">
			<span class="red-icon"><i class="icon icon-puzzle-piece"></i></span>
			Courses
		</div>
	</div>
	</a>
	<div class="col-xs-6 col-sm-2">
		<div class="explore-option disable @if( $selected == 'scores' ) active @endif">
			<span class="red-icon"><i class="icon icon-bar-chart"></i></span>
			Scores
		</div>
	</div>
	<div class="col-xs-6 col-sm-2">
		<div class="explore-option disable @if( $selected == 'articles' ) active @endif">
			<span class="red-icon"><i class="icon icon-file-alt"></i></span>
			Articles
		</div>
	</div>
</div>
<hr>
<!--
<div class="selector">
	<div class="row">
		<div class="col-xs-12 col-sm-3">
			Course:
			<select class="form-control">
				<option>All</option>
				<option>Course one</option>
				<option>Course one</option>
			</select>
		</div>
		<div class="col-xs-12 col-sm-3">
			Badge:
			<select class="form-control">
				<option>All</option>
				<option>Badge two</option>
				<option>Badge three</option>
			</select>
		</div>
		<div class="col-xs-12 col-sm-2">
			Platform:
			<select class="form-control">
				<option>All</option>
				<option>One</option>
				<option>Two</option>
			</select>
		</div>
		<div class="col-xs-12 col-sm-2">
			Learner:
			<select class="form-control">
				<option>All</option>
				<option>Learner two</option>
				<option>Learner three</option>
			</select>
		</div>
		<div class="col-xs-12 col-sm-2">
			<p></p>
			<button class="btn btn-primary btn-block">Submit</button>
		</div>
	</div>
</div>
-->