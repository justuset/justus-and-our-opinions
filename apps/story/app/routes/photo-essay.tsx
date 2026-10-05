// /photo-essay: the photo-essay template rebuilt with the reference page's React components.
// The words come from the Svelte template's doc (projects/photo-essay/content/doc.json), converted to the platform's
// block shape on the server. The page is fully rendered HTML before any JavaScript runs; JS only turns on the scroller.
import { data } from 'react-router';
import type { Route } from './+types/photo-essay';
import doc from '../../../../projects/photo-essay/content/doc.json';
import { docProblems, fromBirdkitDoc, type BirdkitDoc } from '~/article/fromBirdkitDoc';
import { HeaderBasic } from '~/components/article/HeaderBasic';
import { Body } from '~/components/article/Body';
import { withErrorBoundary } from '~/components/article/withErrorBoundary';
import { Shell } from '~/components/shell/Shell';
import '~/article/article.css';

const Header = withErrorBoundary(HeaderBasic);

export function loader() {
  // Error boundaries don't run on the server, so a bad doc is stopped here, before render.
  const problems = docProblems(doc as BirdkitDoc);
  if (problems.length) throw data(problems.join('\n'), { status: 500 });
  return { article: fromBirdkitDoc(doc as BirdkitDoc) };
}

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  const h = loaderData?.article.header;
  return [
    { title: `${h?.seoHeadline ?? 'Photo essay'} · Our Opinions (demo)` },
    { name: 'description', content: h?.summary ?? '' },
  ];
}

export default function PhotoEssay({ loaderData: { article } }: Route.ComponentProps) {
  return (
    <Shell inverse={article.theme !== 'opinion'}>
      <article id="story" className={`g-theme-${article.theme}`} data-slug={article.slug}>
        <Header {...article.header} />
        <Body blocks={article.body} />
      </article>
    </Shell>
  );
}
