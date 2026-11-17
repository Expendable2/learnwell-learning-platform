<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div class="site-shell">
	<div class="announcement">
		<span class="announcement-pill"><?php esc_html_e( 'NEW', 'learnwell' ); ?></span>
		<span><?php esc_html_e( 'Big goals deserve a little momentum.', 'learnwell' ); ?> <strong><?php esc_html_e( 'Start a new skill today.', 'learnwell' ); ?></strong></span>
	</div>
	<header class="site-header">
		<div class="header-inner">
			<a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php esc_attr_e( 'Learnwell home', 'learnwell' ); ?>">
				<span class="brand-mark">l<span>.</span></span>
				<span><?php bloginfo( 'name' ); ?></span>
			</a>
			<nav id="primary-navigation" class="main-nav" aria-label="<?php esc_attr_e( 'Main navigation', 'learnwell' ); ?>">
				<?php
				wp_nav_menu(
					array(
						'theme_location' => 'primary',
						'container'      => false,
						'menu_class'     => 'primary-menu',
						'fallback_cb'    => 'learnwell_primary_menu_fallback',
					)
				);
				?>
			</nav>
			<div class="header-actions">
				<?php if ( is_user_logged_in() ) : ?>
					<a class="text-button sign-in" href="<?php echo esc_url( home_url( '/profile/' ) ); ?>"><?php esc_html_e( 'My learning', 'learnwell' ); ?></a>
					<a class="button button-dark header-cta" href="<?php echo esc_url( wp_logout_url( home_url( '/' ) ) ); ?>"><?php esc_html_e( 'Sign out', 'learnwell' ); ?></a>
				<?php else : ?>
					<a class="text-button sign-in" href="<?php echo esc_url( wp_login_url( home_url( '/' ) ) ); ?>"><?php esc_html_e( 'Log in', 'learnwell' ); ?></a>
					<a class="button button-dark header-cta" href="<?php echo esc_url( wp_registration_url() ); ?>"><?php esc_html_e( 'Get started', 'learnwell' ); ?> <span aria-hidden="true">&rarr;</span></a>
				<?php endif; ?>
			</div>
			<button class="mobile-menu" type="button" aria-controls="primary-navigation" aria-expanded="false">
				<span class="screen-reader-text"><?php esc_html_e( 'Toggle navigation', 'learnwell' ); ?></span>
				<span aria-hidden="true">&#9776;</span>
			</button>
		</div>
	</header>
