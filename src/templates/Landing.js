import Hero from '@/sections/Hero';
import RenderSections from '@/sections/Render';
import { buildSections, heroImage } from '@/lib/sections';
import { ASSETS } from '@/lib/site';
import { media } from '@/lib/media';

// Hand-checked crops for hero photographs whose subject sits off-centre.
const HERO_POSITION = {
  '45f076_021ce983ed004822823c9afdf5ca31e5~mv2.jpg': '50% 60%',
};

/** Program, destination and market pages: full-bleed photographic hero + typed sections. */
export default function Landing({ page }) {
  const sections = buildSections(page);
  const [hero, ...rest] = sections[0]?.type === 'hero' ? sections : [null, ...sections];
  const img = heroImage(page, hero);
  const spainVideo = page.route === '/spain-europe';
  return (
    <>
      {hero && (
        <Hero
          blocks={hero.blocks}
          image={img}
          route={page.route}
          position={img ? HERO_POSITION[img.file] : undefined}
          video={spainVideo ? ASSETS.videoSpain : undefined}
          poster={spainVideo ? media(ASSETS.videoSpainPoster)?.src : undefined}
        />
      )}
      <RenderSections sections={rest} route={page.route} />
    </>
  );
}
