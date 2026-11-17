<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function learnwell_theme_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-logo', array( 'height' => 80, 'width' => 240, 'flex-height' => true, 'flex-width' => true ) );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	register_nav_menus(
		array(
			'primary' => __( 'Primary menu', 'learnwell' ),
			'footer'  => __( 'Footer menu', 'learnwell' ),
		)
	);
}
add_action( 'after_setup_theme', 'learnwell_theme_setup' );

function learnwell_primary_menu_fallback() {
	?>
	<a href="<?php echo esc_url( home_url( '/#courses' ) ); ?>"><?php esc_html_e( 'Explore', 'learnwell' ); ?></a>
	<a href="<?php echo esc_url( home_url( '/#how-it-works' ) ); ?>"><?php esc_html_e( 'How it works', 'learnwell' ); ?></a>
	<a href="<?php echo esc_url( home_url( '/#for-teams' ) ); ?>"><?php esc_html_e( 'For teams', 'learnwell' ); ?></a>
	<a href="<?php echo esc_url( learnwell_teaching_url() ); ?>"><?php esc_html_e( 'Teach', 'learnwell' ); ?></a>
	<?php
}

function learnwell_enqueue_assets() {
	$theme = wp_get_theme();
	wp_enqueue_style(
		'learnwell-fonts',
		'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap',
		array(),
		null
	);
	wp_enqueue_style( 'learnwell-style', get_stylesheet_uri(), array( 'learnwell-fonts' ), $theme->get( 'Version' ) );
	wp_enqueue_script( 'learnwell-navigation', get_template_directory_uri() . '/assets/js/navigation.js', array(), $theme->get( 'Version' ), true );
}
add_action( 'wp_enqueue_scripts', 'learnwell_enqueue_assets' );

function learnwell_course_archive_url() {
	$archive = get_post_type_archive_link( 'lp_course' );
	return $archive ? $archive : home_url( '/#courses' );
}

function learnwell_teaching_url() {
	$course_editor = admin_url( 'post-new.php?post_type=lp_course' );
	if ( current_user_can( 'edit_posts' ) ) {
		return $course_editor;
	}
	return wp_login_url( $course_editor );
}
