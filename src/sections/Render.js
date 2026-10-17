import Editorial from './Editorial';
import { Usp, Statement, Cta, Video, Focus, LeadBand, Callback, System, Levels, Gallery, BookingSection, Support } from './Blocks';
import { Pillars, Cards, Team, Reviews, BlogStrip } from './Groups';

const MAP = {
  editorial: Editorial,
  usp: Usp,
  statement: Statement,
  cta: Cta,
  video: Video,
  focus: Focus,
  leadForm: LeadBand,
  callback: Callback,
  system: System,
  pillars: Pillars,
  cards: Cards,
  team: Team,
  levels: Levels,
  reviews: Reviews,
  blogStrip: BlogStrip,
  support: Support,
  gallery: Gallery,
  bookingCard: BookingSection,
};

export default function RenderSections({ sections, route, startIndex = 0 }) {
  let editorialCount = startIndex;
  return sections.map((sec, i) => {
    const C = MAP[sec.type] || Editorial;
    const idx = sec.type === 'editorial' || sec.type === 'cards' ? editorialCount++ : i;
    return <C key={`${sec.id}-${i}`} section={sec} route={route} index={idx} />;
  });
}
