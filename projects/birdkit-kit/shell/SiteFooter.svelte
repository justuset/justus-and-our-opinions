<!-- SiteFooter: the platform footer (NYT sandbox S4b). Measured: full width with 45px bottom padding and 11px type on
     phones; 3% side padding from 1024px; a 1200px max width from the desktop tier; a rule on top (--color-stroke-tertiary).
     The links are placeholders that go back to the story. The copyright line labels the page as a demo. -->
<script>
  let { name = 'Our Opinions' } = $props();
  const links = ['About', 'Contact Us', 'Accessibility', 'Privacy Policy', 'Terms of Service', 'Site Map', 'Help'];
</script>

<footer class="site-footer">
  <nav class="footer-nav" aria-label="Site information">
    <ul class="copyright"><li><a href="#site-content">© 2026 {name} · demo</a></li></ul>
    <ul class="links">
      {#each links as link (link)}<li><a href="#site-content">{link}</a></li>{/each}
    </ul>
  </nav>
</footer>

<style>
  .site-footer { padding: 0 0 45px; font-size: 0.6875rem; text-align: center; }
  @media (min-width: 1024px) {
    .site-footer { padding: 0 3% 45px; }
  }
  @media (min-width: 1150px) {
    .site-footer { max-width: var(--shell-page-max); margin: 0 auto; }
  }
  .footer-nav { margin: 0 0 35px; padding-top: 9px; border-top: 1px solid var(--shell-rule); }
  ul { margin: 0 0 15px; padding: 0; list-style: none; }
  @media (min-width: 600px) {
    ul { display: inline-block; }
  }
  li { display: inline-block; padding: 0 10px; line-height: 1.8182; /* 20px at 11px */ }
  a { padding: 10px 0; color: var(--shell-muted); font-family: var(--shell-font-label); text-decoration: none; white-space: nowrap; }
  a:hover { text-decoration: underline; }
</style>
