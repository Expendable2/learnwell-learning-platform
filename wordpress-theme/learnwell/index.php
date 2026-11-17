<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
get_header();
?>
<main id="top">
	<?php if ( have_posts() ) : ?>
		<?php while ( have_posts() ) : the_post(); ?>
			<article <?php post_class( 'entry-content' ); ?>>
				<h1 class="entry-title"><?php the_title(); ?></h1>
				<?php if ( has_post_thumbnail() ) : ?>
					<div><?php the_post_thumbnail( 'large' ); ?></div>
				<?php endif; ?>
				<div><?php the_content(); ?></div>
			</article>
		<?php endwhile; ?>
		<div class="pagination"><?php the_posts_pagination(); ?></div>
	<?php else : ?>
		<div class="entry-content"><h1 class="entry-title"><?php esc_html_e( 'Nothing found', 'learnwell' ); ?></h1><p><?php esc_html_e( 'There is no content to display yet.', 'learnwell' ); ?></p></div>
	<?php endif; ?>
</main>
<?php
get_footer();
