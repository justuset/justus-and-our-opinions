// Every route is rendered to HTML at build time (adapter-static needs this).
export const prerender = true;
// '/' → dist/index.html (not dist/index/index.html).
export const trailingSlash = 'never';
