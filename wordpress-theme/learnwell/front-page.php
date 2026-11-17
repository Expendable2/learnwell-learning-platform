<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$course_search   = isset( $_GET['course_search'] ) && is_string( $_GET['course_search'] ) ? sanitize_text_field( wp_unslash( $_GET['course_search'] ) ) : '';
$course_category = isset( $_GET['course_category'] ) && is_string( $_GET['course_category'] ) ? sanitize_title( wp_unslash( $_GET['course_category'] ) ) : '';
$course_query    = null;
$course_terms    = taxonomy_exists( 'course_category' )
	? get_terms( array( 'taxonomy' => 'course_category', 'hide_empty' => false ) )
	: array();

if ( post_type_exists( 'lp_course' ) ) {
	$query_args = array(
		'post_type'      => 'lp_course',
		'post_status'    => 'publish',
		'posts_per_page' => 8,
		's'              => $course_search,
	);
	if ( $course_category && taxonomy_exists( 'course_category' ) ) {
		$query_args['tax_query'] = array(
			array(
				'taxonomy' => 'course_category',
				'field'    => 'slug',
				'terms'    => $course_category,
			),
		);
	}
	$course_query = new WP_Query( $query_args );
}

get_header();
?>
<main id="top">
	<section class="hero">
		<div class="hero-copy">
			<div class="eyebrow"><span class="eyebrow-line"></span><?php esc_html_e( 'LEARNING THAT MOVES YOU', 'learnwell' ); ?></div>
			<h1><?php esc_html_e( 'Make your next', 'learnwell' ); ?><br><?php esc_html_e( 'move a', 'learnwell' ); ?> <span><?php esc_html_e( 'smart one.', 'learnwell' ); ?></span></h1>
			<p class="hero-description"><?php esc_html_e( 'Build real-world skills, learn from people who do the work, and take your next step with confidence.', 'learnwell' ); ?></p>
			<div class="hero-actions">
				<a class="button button-primary" href="#courses"><?php esc_html_e( 'Find your next course', 'learnwell' ); ?> <span aria-hidden="true">&rarr;</span></a>
				<a class="play-link" href="#how-it-works"><span class="play-link-icon" aria-hidden="true">&#9654;</span><?php esc_html_e( 'See how it works', 'learnwell' ); ?></a>
			</div>
			<div class="hero-proof">
				<div class="avatar-stack" aria-hidden="true"><span>AM</span><span>JK</span><span>RL</span><span>+</span></div>
				<div><strong><?php esc_html_e( 'A community of curious minds', 'learnwell' ); ?></strong><small><?php esc_html_e( 'Learning something new every day', 'learnwell' ); ?></small></div>
			</div>
		</div>
		<div class="hero-art" aria-label="<?php esc_attr_e( 'Learners sharing ideas around a laptop', 'learnwell' ); ?>">
			<img class="hero-photo" src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&amp;fit=crop&amp;w=1200&amp;q=90" alt="<?php esc_attr_e( 'Learners sharing ideas around a laptop', 'learnwell' ); ?>">
			<div class="art-shape art-shape-one"></div>
			<div class="art-shape art-shape-two"></div>
			<div class="floating-card certificate-card"><span class="certificate-icon" aria-hidden="true">&#10003;</span><span><strong><?php esc_html_e( 'New skills, made official', 'learnwell' ); ?></strong><small><?php esc_html_e( 'Celebrate your progress', 'learnwell' ); ?></small></span></div>
			<div class="floating-card progress-card">
				<div class="progress-card-top"><span class="progress-dot"></span><span><?php esc_html_e( 'YOUR LEARNING', 'learnwell' ); ?></span></div>
				<strong><?php esc_html_e( 'One step at a time.', 'learnwell' ); ?></strong>
				<div class="progress-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
				<small><?php esc_html_e( 'Make progress at your own pace', 'learnwell' ); ?></small>
			</div>
			<span class="art-caption"><?php esc_html_e( 'A little progress adds up.', 'learnwell' ); ?></span>
		</div>
		<div class="hero-bottom-note"><strong>01</strong> / 03 <span class="note-line"></span><?php esc_html_e( 'GROW AT YOUR OWN PACE', 'learnwell' ); ?></div>
	</section>

	<section class="trust-strip" aria-label="<?php esc_attr_e( 'Learning benefits', 'learnwell' ); ?>">
		<p><?php esc_html_e( 'Good things happen when you keep learning.', 'learnwell' ); ?></p>
		<div><strong><?php esc_html_e( 'Practical', 'learnwell' ); ?></strong><span><?php esc_html_e( 'skills for real work', 'learnwell' ); ?></span></div>
		<div><strong><?php esc_html_e( 'Flexible', 'learnwell' ); ?></strong><span><?php esc_html_e( 'learn at your own pace', 'learnwell' ); ?></span></div>
		<div><strong><?php esc_html_e( 'Yours', 'learnwell' ); ?></strong><span><?php esc_html_e( 'progress you can track', 'learnwell' ); ?></span></div>
	</section>

	<section class="courses-section section-wrap" id="courses">
		<div class="section-heading">
			<div><div class="eyebrow"><span class="eyebrow-line"></span><?php esc_html_e( 'YOUR NEXT BIG THING', 'learnwell' ); ?></div><h2><?php esc_html_e( 'Skills worth', 'learnwell' ); ?><br><?php esc_html_e( 'showing up for.', 'learnwell' ); ?></h2></div>
			<div class="section-intro"><p><?php esc_html_e( 'Practical courses, thoughtful teachers, and a community rooting for your progress.', 'learnwell' ); ?></p><a href="<?php echo esc_url( learnwell_course_archive_url() ); ?>"><?php esc_html_e( 'Browse all courses', 'learnwell' ); ?> <span aria-hidden="true">&rarr;</span></a></div>
		</div>
		<?php if ( ! post_type_exists( 'lp_course' ) ) : ?>
			<div class="learnpress-notice">
				<?php esc_html_e( 'Install and activate LearnPress to show courses here. After activation, add courses in your WordPress dashboard and they will appear automatically.', 'learnwell' ); ?>
			</div>
		<?php else : ?>
			<form class="course-tools" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
				<div class="course-filter">
					<label class="screen-reader-text" for="course-category"><?php esc_html_e( 'Filter courses by category', 'learnwell' ); ?></label>
					<select id="course-category" name="course_category">
						<option value=""><?php esc_html_e( 'All courses', 'learnwell' ); ?></option>
						<?php if ( ! is_wp_error( $course_terms ) ) : ?>
							<?php foreach ( $course_terms as $term ) : ?>
								<option value="<?php echo esc_attr( $term->slug ); ?>" <?php selected( $course_category, $term->slug ); ?>><?php echo esc_html( $term->name ); ?></option>
							<?php endforeach; ?>
						<?php endif; ?>
					</select>
					<label class="screen-reader-text" for="course-search"><?php esc_html_e( 'Search courses', 'learnwell' ); ?></label>
					<input id="course-search" type="search" name="course_search" value="<?php echo esc_attr( $course_search ); ?>" placeholder="<?php esc_attr_e( 'What do you want to learn?', 'learnwell' ); ?>">
					<button type="submit"><?php esc_html_e( 'Search', 'learnwell' ); ?></button>
				</div>
			</form>
			<div class="results-label"><span><?php esc_html_e( 'EXPLORE LEARNWELL', 'learnwell' ); ?></span><span><?php echo esc_html( sprintf( _n( '%s COURSE', '%s COURSES', (int) $course_query->found_posts, 'learnwell' ), number_format_i18n( $course_query->found_posts ) ) ); ?></span></div>
			<?php if ( $course_query->have_posts() ) : ?>
				<div class="course-grid">
					<?php
					while ( $course_query->have_posts() ) :
						$course_query->the_post();
						$terms = taxonomy_exists( 'course_category' ) ? get_the_terms( get_the_ID(), 'course_category' ) : false;
						$category_name = ( $terms && ! is_wp_error( $terms ) ) ? $terms[0]->name : __( 'Course', 'learnwell' );
						?>
						<article <?php post_class( 'course-card' ); ?>>
							<a class="course-image" href="<?php the_permalink(); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'View course: %s', 'learnwell' ), get_the_title() ) ); ?>">
								<?php if ( has_post_thumbnail() ) : ?>
									<?php the_post_thumbnail( 'large', array( 'loading' => 'lazy' ) ); ?>
								<?php else : ?>
									<img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&amp;fit=crop&amp;w=900&amp;q=85" alt="" loading="lazy">
								<?php endif; ?>
								<span class="course-level"><?php echo esc_html( $category_name ); ?></span>
							</a>
							<div class="course-content">
								<div class="course-organization"><?php echo esc_html( get_the_author() ); ?></div>
								<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
								<div class="course-description"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 18 ) ); ?></div>
								<div class="course-footer"><span><?php echo esc_html( $category_name ); ?></span><a href="<?php the_permalink(); ?>"><?php esc_html_e( 'View course', 'learnwell' ); ?> <span aria-hidden="true">&rarr;</span></a></div>
							</div>
						</article>
					<?php endwhile; ?>
				</div>
				<div class="browse-bottom"><span><?php esc_html_e( 'Choose a course and learn at your own pace.', 'learnwell' ); ?></span><a class="button button-outline" href="<?php echo esc_url( learnwell_course_archive_url() ); ?>"><?php esc_html_e( 'Explore all courses', 'learnwell' ); ?> <span aria-hidden="true">&rarr;</span></a></div>
			<?php else : ?>
				<div class="empty-state"><strong><?php esc_html_e( 'No courses found just yet.', 'learnwell' ); ?></strong><span><?php esc_html_e( 'Try a different search or check back soon.', 'learnwell' ); ?></span></div>
			<?php endif; ?>
			<?php wp_reset_postdata(); ?>
		<?php endif; ?>
	</section>

	<section class="how-section" id="how-it-works">
		<div class="how-visual">
			<img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&amp;fit=crop&amp;w=1000&amp;q=85" alt="<?php esc_attr_e( 'A learner working through an online lesson', 'learnwell' ); ?>" loading="lazy">
			<div class="learning-sticker"><span><?php esc_html_e( 'LEARN A LITTLE.', 'learnwell' ); ?><br><b><?php esc_html_e( 'GROW A LOT.', 'learnwell' ); ?></b></span></div>
			<div class="completion-note"><span class="completion-check" aria-hidden="true">&#10003;</span><span><strong><?php esc_html_e( 'Look what you did.', 'learnwell' ); ?></strong><small><?php esc_html_e( 'Every lesson counts', 'learnwell' ); ?></small></span></div>
		</div>
		<div class="how-copy">
			<div class="eyebrow"><span class="eyebrow-line"></span><?php esc_html_e( 'SMALL STEPS. BIG MOMENTUM.', 'learnwell' ); ?></div>
			<h2><?php esc_html_e( 'Learn on your terms.', 'learnwell' ); ?><br><span><?php esc_html_e( 'Grow for real.', 'learnwell' ); ?></span></h2>
			<p class="how-lede"><?php esc_html_e( 'A new skill should fit your life, not the other way around. Make progress in the pockets of time you already have.', 'learnwell' ); ?></p>
			<div class="steps">
				<div class="step"><span>01</span><div><strong><?php esc_html_e( 'Pick a direction', 'learnwell' ); ?></strong><p><?php esc_html_e( 'Choose a skill, a goal, or simply something you are curious about.', 'learnwell' ); ?></p></div></div>
				<div class="step"><span>02</span><div><strong><?php esc_html_e( 'Learn from the doers', 'learnwell' ); ?></strong><p><?php esc_html_e( 'Get practical guidance from instructors who know the work inside out.', 'learnwell' ); ?></p></div></div>
				<div class="step"><span>03</span><div><strong><?php esc_html_e( 'Make it yours', 'learnwell' ); ?></strong><p><?php esc_html_e( 'Practice as you go, celebrate the wins, and keep moving forward.', 'learnwell' ); ?></p></div></div>
			</div>
			<a class="button button-primary" href="#courses"><?php esc_html_e( 'Find a course to get started', 'learnwell' ); ?> <span aria-hidden="true">&rarr;</span></a>
		</div>
	</section>

	<section class="team-banner" id="for-teams">
		<div class="team-decoration" aria-hidden="true">LW</div>
		<div><span class="eyebrow"><?php esc_html_e( 'FOR TEAMS WITH BIG IDEAS', 'learnwell' ); ?></span><h2><?php esc_html_e( 'Make learning part', 'learnwell' ); ?><br><?php esc_html_e( 'of how you work.', 'learnwell' ); ?></h2></div>
		<p><?php esc_html_e( 'Give your people space to grow with flexible learning built around the skills your team needs next.', 'learnwell' ); ?></p>
		<a class="button button-light" href="<?php echo esc_url( home_url( '/#courses' ) ); ?>"><?php esc_html_e( 'Explore courses', 'learnwell' ); ?> <span aria-hidden="true">&rarr;</span></a>
	</section>

	<section class="closing-cta">
		<div class="eyebrow"><span class="eyebrow-line"></span><?php esc_html_e( 'THE FUTURE IS A SKILL AWAY', 'learnwell' ); ?></div>
		<h2><?php esc_html_e( 'Curiosity looks good', 'learnwell' ); ?><br><?php esc_html_e( 'on', 'learnwell' ); ?> <span><?php esc_html_e( 'you.', 'learnwell' ); ?></span></h2>
		<p><?php esc_html_e( 'Wherever you are headed, take the next step with Learnwell.', 'learnwell' ); ?></p>
		<a class="button button-primary" href="#courses"><?php esc_html_e( 'Start learning', 'learnwell' ); ?> <span aria-hidden="true">&rarr;</span></a>
	</section>
</main>
<?php
get_footer();
