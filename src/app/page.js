import Link from 'next/link';
import Img from '@/components/Img';
import SplitText from '@/components/SplitText';
import RenderSections from '@/sections/Render';
import { getPage } from '@/lib/content';
import { buildSections } from '@/lib/sections';
import { pageMetadata, JsonLd } from '@/lib/seo';
import { heroParts } from '@/sections/Hero';
import { CtaLink } from '@/sections/Rich';
import { Arrow } from '@/components/Icons';
import s from './home.module.css';

export function generateMetadata() {
  return pageMetadata(getPage('home'));
}

export default function Home() {
  const page = getPage('home');
  const [hero, ...rest] = buildSections(page);
  const { eyebrow, title, subs, links } = heroParts(hero.blocks);
  const heroImg = hero.blocks.find((b) => b.t === 'img');
  // the ocean photograph from the reflective strip doubles as the hero's secondary frame
  const statement = rest.find((x) => x.type === 'statement');
  const second = statement?.blocks.find((b) => b.t === 'img');

  return (
    <>
      <JsonLd page={page} />
      <section className={s.hero} data-hero>
        <div className={s.wash} aria-hidden="true" />
        <div className={`container ${s.grid}`}>
          <div className={s.copy}>
            <SplitText as="h1" mode="hero" className={s.title} text={title} />
            <p className={s.sub} data-hero-in>{subs[0]?.text}</p>
            <div className={s.ctas} data-hero-in>
              {links.map((l, i) => <CtaLink key={i} link={l} route="/" className="btn-dark" />)}
              <Link href="/book-call" className="link-arrow">Speak To A Retreat Advisor<Arrow className="" /></Link>
            </div>
          </div>
          <div className={s.frames}>
            {/* LCP image: never clipped/hidden before hydration, only a gentle scale settle */}
            <figure className={`media ${s.arch}`} data-anim="settle">
              <Img file={heroImg.file} alt="Alive private pool villa with retreat staff" priority sizes="(min-width: 900px) min(40vw, 520px), 82vw" position="50% 55%" />
            </figure>
            {second && (
              <figure className={`media ${s.small}`} data-anim="settle">
                <Img file={second.file} alt={second.alt} loading="eager" sizes="(min-width: 900px) 240px, 46vw" />
              </figure>
            )}
          </div>
        </div>
      </section>
      <RenderSections sections={rest} route="/" />
    </>
  );
}
