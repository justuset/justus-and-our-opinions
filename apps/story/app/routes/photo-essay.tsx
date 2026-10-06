// /photo-essay: the photo essay in the reference page's React components.
// The words come from projects/photo-essay/content/doc.json, converted to the platform's
// block shape on the server. The page is fully rendered HTML before any JavaScript runs; JS only turns on the scroller.
import { data } from 'react-router';
import type { Route } from './+types/photo-essay';
import doc from '../../../../projects/photo-essay/content/doc.json';
import { docProblems, fromDoc, type StoryDoc } from '~/article/fromDoc';
import { HeaderBasic } from '~/components/article/HeaderBasic';
import { Body } from '~/components/article/Body';
import { withErrorBoundary } from '~/components/article/withErrorBoundary';
import { ArticleBottom, Shell } from '~/components/shell/Shell';
import '~/article/article.css';

const Header = withErrorBoundary(HeaderBasic);

export function loader() {
  // Error boundaries don't run on the server, so a bad doc is stopped here, before render.
  const problems = docProblems(doc as StoryDoc);
  if (problems.length) throw data(problems.join('\n'), { status: 500 });
  return { article: fromDoc(doc as StoryDoc) };
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
    // An article page, so the masthead is fixed (a Birdkit page's floats). The share tools, recirculation and bottom
    // ad close the article itself, as on the reference.
    <Shell inverse={article.theme !== 'opinion'} fixedMasthead>
      <article id="story" className={`g-theme-${article.theme}`} data-slug={article.slug}>
        <Header {...article.header} />
        <Body blocks={article.body} />
        <ArticleBottom date={article.header.timestampBlock.text} />
      </article>
    </Shell>
  );
}
