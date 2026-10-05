<!-- ShareTools: the comment button and share row under the story (NYT sandbox S4b). Layout replica only: the buttons
     do nothing. Measured: the comment button is the text column's width (350 on a 390 phone, 600 from the tablet tier),
     36px tall, 13px uppercase sans with 0.65px tracking. Colors are diatour dark (shell.css), not the shipped blue. -->
<script>
  let { comments = 0 } = $props();
</script>

<div class="share-tools" data-testid="share-tools" role="toolbar" aria-label="Share, save and comments">
  <div class="comment-row">
    <button type="button" class="comment-button" id="comment-button-bigBottom">Read {comments} comments</button>
  </div>
  <ul class="share-tools-list" data-testid="share-tools-menu">
    <li><button type="button" class="pill">Share full article</button></li>
    <li><button type="button" class="pill" aria-label="More sharing options">Share</button></li>
    <li><button type="button" class="pill" aria-label="Save article for reading later">Save</button></li>
    <li><button type="button" class="pill" aria-label="Read {comments} comments">{comments}</button></li>
  </ul>
</div>

<style>
  .comment-row,
  .share-tools-list {
    box-sizing: border-box;
    width: calc(100% - 2 * var(--shell-gutter));
    max-width: var(--shell-col);
  }
  .comment-row { margin: 24px auto 0; }
  .comment-button {
    width: 100%;
    padding: 5px 0;
    border: 1px solid var(--shell-button-border);
    border-radius: 3px;
    background: var(--shell-button);
    color: var(--shell-button-text);
    font: 600 13px / 24px var(--shell-font-label);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background-color 0.6s ease;
  }
  .comment-button:hover,
  .comment-button:focus-visible { background: var(--shell-button-hover); }
  .share-tools-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 24px auto 32px;
    padding: 0;
    list-style: none;
  }
  .pill {
    padding: 6px 10px;
    border: 1px solid var(--shell-border);
    border-radius: 30px;
    background: var(--shell-surface);
    color: var(--shell-ink);
    font: 500 12px / 16px var(--shell-font-label);
    text-transform: uppercase;
    cursor: pointer;
  }
  .pill:hover { background: var(--shell-bg-secondary); }
  @media (prefers-reduced-motion: reduce) {
    .comment-button { transition: none; }
  }
</style>
