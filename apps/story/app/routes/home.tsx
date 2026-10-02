import type { Route } from './+types/home';

export function meta(): Route.MetaDescriptors {
  return [
    { title: 'Our Opinions · Story app (demo)' },
    {
      name: 'description',
      content: 'Phase 2 scaffold of the React story app. Demo content for a front-end study project.',
    },
  ];
}

// Runs on the server for the first request (and as a data fetch on client navigations). Its result is serialized
// into the HTML, so the page below renders fully on the server. "View source" shows this timestamp already in place.
export function loader() {
  return { renderedAt: new Date().toISOString() };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main>
      <p>Our Opinions</p>
      <h1>Story app</h1>
      <p>
        Phase 2 scaffold (chunk 00). This page was rendered on the server at{' '}
        <time dateTime={loaderData.renderedAt}>{loaderData.renderedAt}</time>, then hydrated by React.
      </p>
      <p>Demo content for a front-end study project.</p>
    </main>
  );
}
