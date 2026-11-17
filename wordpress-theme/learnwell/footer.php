<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
	<footer class="site-footer">
		<div class="footer-main">
			<div class="footer-brand-col">
				<a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>">
					<span class="brand-mark">l<span>.</span></span>
					<span><?php bloginfo( 'name' ); ?></span>
				</a>
				<p><?php esc_html_e( 'A little learning can take you anywhere.', 'learnwell' ); ?></p>
			</div>
			<div class="footer-column">
				<strong><?php esc_html_e( 'Explore', 'learnwell' ); ?></strong>
				<a href="<?php echo esc_url( home_url( '/#courses' ) ); ?>"><?php esc_html_e( 'All courses', 'learnwell' ); ?></a>
				<a href="<?php echo esc_url( home_url( '/#how-it-works' ) ); ?>"><?php esc_html_e( 'Our approach', 'learnwell' ); ?></a>
			</div>
			<div class="footer-column">
				<strong><?php esc_html_e( 'Learnwell', 'learnwell' ); ?></strong>
				<a href="<?php echo esc_url( home_url( '/#for-teams' ) ); ?>"><?php esc_html_e( 'For teams', 'learnwell' ); ?></a>
				<a href="<?php echo esc_url( learnwell_teaching_url() ); ?>"><?php esc_html_e( 'Become an instructor', 'learnwell' ); ?></a>
			</div>
			<div class="footer-column">
				<strong><?php esc_html_e( 'Say hello', 'learnwell' ); ?></strong>
				<a href="mailto:hello@learnwell.example"><?php esc_html_e( 'Contact', 'learnwell' ); ?></a>
				<a href="<?php echo esc_url( wp_login_url() ); ?>"><?php esc_html_e( 'Help center', 'learnwell' ); ?></a>
			</div>
		</div>
		<div class="footer-bottom">
			<span>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?></span>
			<div>
				<?php if ( get_privacy_policy_url() ) : ?>
					<a href="<?php echo esc_url( get_privacy_policy_url() ); ?>"><?php esc_html_e( 'Privacy', 'learnwell' ); ?></a>
				<?php endif; ?>
				<a href="<?php echo esc_url( home_url( '/#top' ) ); ?>"><?php esc_html_e( 'Back to top', 'learnwell' ); ?></a>
			</div>
			<span><?php esc_html_e( 'Made for your next chapter', 'learnwell' ); ?> <span class="footer-heart" aria-hidden="true">&hearts;</span></span>
		</div>
	</footer>
</div>
<?php wp_footer(); ?>
</body>
</html>
