import { notFound } from 'next/navigation';
import { getPosts, tagSlug, getPageByRoute } from '@/lib/content';
import { BlogIndex } from '@/templates/Blog';

export const dynamicParams = false;

// Tag archives (about 45 on the source, e.g. /blog/tags/luxury-wellness-retreat) are derived from the posts' tags.
function allTags() {
  const map = new Map();
  for (const p of getPosts()) for (const t of p.tags) map.set(tagSlug(t), t);
  return map;
}

export function generateStaticParams() {
  return [...allTags().keys()].map((tag) => ({ tag }));
}

export async function generateMetadata({ params }) {
  const { tag } = await params;
  const name = allTags().get(tag);
  return name ? { title: `${name} | Alive Luxury Wellness Retreats`, alternates: { canonical: `/blog/tags/${tag}` } } : {};
}

export default async function TagPage({ params }) {
  const { tag } = await params;
  const name = allTags().get(tag);
  if (!name) notFound();
  return <BlogIndex page={getPageByRoute('/blog')} tag={{ slug: tag, name }} />;
}
