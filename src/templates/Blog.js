import Link from 'next/link';
import Img from '@/components/Img';
import SplitText from '@/components/SplitText';
import { getPosts, postTags, tagSlug } from '@/lib/content';
import { PostCard } from '@/sections/Groups';
import { Text, SmartLink } from '@/sections/Rich';
import { splitChecks } from '@/lib/sections';
import { BookingCard } from '@/sections/Blocks';
import { Arrow } from '@/components/Icons';
import s from './Blog.module.css';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null);

export function BlogIndex({ page, tag }) {
  const posts = getPosts().filter((p) => !tag || p.tags.some((t) => tagSlug(t) === tag.slug));
  const [lead, ...rest] = posts;
  return (
    <>
      <section className={s.indexHero}>
        <div className="container">
          <SplitText as="h1" mode="hero" className={s.indexTitle} text={tag ? tag.name : 'Alive News'} />
          <p className={s.indexLead} data-hero-in>{tag ? `${posts.length} post${posts.length === 1 ? '' : 's'}` : page.description}</p>
        </div>
      </section>
      <section className="section-sm surface-ivory">
        <div className="container">
          {lead && (
            <Link href={lead.route} className={s.feature} data-anim="fade-up">
              <div className={`media ${s.featureMedia}`} data-anim="clip">
                {lead.cover && <Img file={lead.cover} alt="" sizes="(min-width: 900px) 60vw, 100vw" priority />}
              </div>
              <div className={s.featureText}>
                <p className={s.meta}>{fmt(lead.datePublished)}{lead.author ? ` · ${lead.author}` : ''}</p>
                <h2 className={s.featureTitle}>{lead.title}</h2>
                {lead.excerpt && <p>{lead.excerpt}</p>}
                <span className="link-arrow">Read the article<Arrow className="" /></span>
              </div>
            </Link>
          )}
          <div className={s.grid}>
            {rest.map((p) => <PostCard key={p.route} post={p} />)}
          </div>
          {tag && <p className={s.back}><Link href="/blog" className="link-arrow">All Posts<Arrow className="" /></Link></p>}
        </div>
      </section>
    </>
  );
}

/** Blog article: header, cover, then the captured body (images placed at their source position). */
export function Post({ page }) {
  const all = getPosts();
  const meta = all.find((p) => p.route === page.route) || {};
  const tags = postTags(page);
  // body = everything after the header block up to "Tags:"
  const blocks = page.sections.flatMap((s) => s.blocks);
  const h1 = blocks.findIndex((b) => b.t === 'h' && b.level === 1);
  let body = blocks.slice(h1 + 1);
  const readIdx = body.findIndex((b) => b.t === 'p' && /min read$/.test(b.text));
  const readTime = readIdx >= 0 ? body[readIdx].text : null;
  body = body.filter((b, i) => !(i <= readIdx + 1 && b.t === 'p' && (/min read$/.test(b.text) || /^Updated:/.test(b.text) || /^[A-Z][a-z]{2} \d{1,2}(, \d{4})?$/.test(b.text))));
  const stop = body.findIndex((b) => (b.t === 'p' && b.text === 'Tags:') || (b.t === 'h' && b.text === 'Recent Posts'));
  if (stop >= 0) body = body.slice(0, stop);
  body = body.filter((b) => b.t !== 'field' && !(b.t === 'img' && b.file === meta.cover));
  const related = all.filter((p) => p.route !== page.route).slice(0, 3);
  const firstPara = body.findIndex((b) => b.t === 'p');
  // a drop cap only reads well on a substantial opening paragraph
  const dropcapAt = firstPara >= 0 && body[firstPara].text.length > 200 ? firstPara : -1;

  return (
    <>
      <article className={s.article}>
        <header className={`container ${s.postWidth} ${s.postHead}`}>
          <p className={s.crumbs} data-hero-in><Link href="/blog">Alive News</Link><span aria-hidden="true"> / </span>{fmt(meta.datePublished)}</p>
          <SplitText as="h1" mode="hero" className={s.postTitle} text={page.h1[0]} />
          <p className={s.byline} data-hero-in>
            {meta.author && <span>By {meta.author}</span>}
            {readTime && <span>{readTime}</span>}
            {meta.dateModified && <span>Updated {fmt(meta.dateModified)}</span>}
          </p>
        </header>
        {meta.cover && (
          <div className={`container ${s.postWidth}`}>
            <figure className={`media ${s.cover}`} data-anim="clip">
              <Img file={meta.cover} alt={page.h1[0]} priority sizes="(min-width: 1200px) 1200px, 100vw" />
            </figure>
          </div>
        )}
        <div className={`container ${s.postWidth} ${s.postBody}`}>
          <div className={`prose ${s.prose}`}>
            {body.map((b, i) => {
              if (b.t === 'img') return <figure key={i} className={`media ${s.inlineImg}`} data-anim="clip"><Img file={b.file} alt={b.alt} sizes="(min-width: 900px) 760px, 100vw" /></figure>;
              if (b.t === 'h') { const Tag = b.level <= 2 ? 'h2' : 'h3'; return <Tag key={i} className={Tag === 'h2' ? s.h2 : s.h3}><Text text={b.text} links={b.links} /></Tag>; }
              if (b.t === 'li') return <ul key={i} className="dotlist"><li><Text text={b.text} links={b.links} /></li></ul>;
              if (b.t === 'link') return <p key={i}><SmartLink href={b.href || '/blog'} className="text-link">{b.text}</SmartLink></p>;
              if (b.t !== 'p') return null;
              const checks = splitChecks(b.text);
              if (checks && checks.length > 1) return <ul key={i} className="checklist">{checks.map((c, j) => <li key={j}>{c}</li>)}</ul>;
              const short = b.text.length < 48 && !/[,;]$/.test(b.text);
              return <p key={i} className={`${i === dropcapAt ? s.dropcap : ''} ${short ? s.beat : ''}`}><Text text={b.text} links={b.links} /></p>;
            })}
            {tags.length > 0 && (
              <footer className={s.tags}>
                <h2 className={s.asideTitle}>Tags</h2>
                <ul>{tags.map((t) => <li key={t}><Link href={`/blog/tags/${tagSlug(t)}`}>{t}</Link></li>)}</ul>
              </footer>
            )}
          </div>
          <aside className={s.aside}>
            <div className={`${s.asideSticky} ${s.asideCard}`}>
              <h2 className="sr-only">Speak with the Alive team</h2>
              <BookingCard compact />
            </div>
          </aside>
        </div>
      </article>
      <section className="section surface-sand">
        <div className="container">
          <div className={s.relatedHead}>
            <h2 className="h2">Recent Posts</h2>
            <Link href="/blog" className="link-arrow">See All<Arrow className="" /></Link>
          </div>
          <div className={s.grid}>{related.map((p) => <PostCard key={p.route} post={p} />)}</div>
        </div>
      </section>
    </>
  );
}
