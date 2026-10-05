<!-- AdSlot: the bottom ad placeholder (NYT sandbox S4b), from the platform CSS in the page source: at least 280px tall,
     the secondary background, top and bottom borders, a 10px uppercase "Advertisement" label, and a skip link.
     A dashed 300 × 250 box stands in for the ad. -->
<div id="bottom-wrapper" class="ad-wrapper">
  <p class="ad-label">Advertisement</p>
  <a class="skip-ad" href="#after-bottom">Skip advertisement</a>
  <div class="ad-box" aria-hidden="true">300 × 250</div>
  <div id="after-bottom"></div>
</div>

<style>
  .ad-wrapper {
    position: relative;
    min-height: 280px;
    margin: 16px auto 32px;
    padding: 12px 0 30px;
    border-top: 1px solid var(--shell-border);
    border-bottom: 1px solid var(--shell-border);
    background: var(--shell-bg-secondary);
    text-align: center;
  }
  @media (min-width: 740px) {
    .ad-wrapper { margin: 32px auto 48px; }
  }
  .ad-label {
    margin: 0 0 9px;
    color: var(--shell-muted);
    font: 500 0.625rem / 1 var(--shell-font-label);
    letter-spacing: 0.05rem;
    text-transform: uppercase;
  }
  .ad-box {
    display: grid;
    place-items: center;
    width: 300px;
    height: 250px;
    margin: 0 auto;
    border: 1px dashed var(--shell-muted);
    color: var(--shell-muted);
    font: 0.75rem var(--shell-font-label);
  }
  .skip-ad { position: absolute; left: -9999px; }
  .skip-ad:focus {
    top: 5px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px;
    background: var(--shell-bg);
    font: 0.6875rem var(--shell-font-label);
  }
</style>
