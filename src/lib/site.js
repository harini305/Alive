// Business details exactly as published on the source site (see docs/source-audit/06 §12).
// Several phone numbers are in use on the original site; each is kept in the context where it appeared.
export const SITE_URL = 'https://www.aliveluxuryretreats.com';
export const SITE_NAME = 'Alive Luxury Wellness Retreats';
export const TAGLINE = 'Private Luxury Exclusive Wellness and Mental Health Retreats Since 2009';

export const CONTACT = {
  email: 'bookings@aliveluxuryretreats.com',
  whatsappDisplay: '+62 813 592 5588', // header, footer, contact, book-call
  whatsappUrl: 'https://wa.me/628135925588',
  whatsappApi: 'https://api.whatsapp.com/send?phone=628135925588', // mobile quick-action bar
  callDisplay: '+62 813 592 5588', // /contact "CALL"
  callTel: 'tel:+628135925588',
  usDisplay: '+1 478 551 6454', // mobile quick-call, /get-a-quote, /pdf
  usTel: 'tel:+14785516454',
  mobileMail: 'mailto:bookings@aliveluxuryretreats.com?subject=Enquiry%20-%20Mobile',
  chatbotUrl: 'https://chat.ultimo-bots.com/176638179094366195899sjCmx', // external chat linked from /get-a-quote, /pdf, /wellness-retreat-australia
};

export const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/alive_wellnessretreats/', icon: '40898a93cfff4578b1779073137eb1b4.png' },
  { label: 'Facebook', href: 'https://www.facebook.com/aliveluxurywellnessretreats', icon: 'aebe5b6fd55f471a936c72ff2c8289d7.png' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/alive-luxury-wellness-retreats', icon: 'fcfebdfae12a44f993a94aeed8e2e66b.png' },
  { label: 'YouTube', href: 'https://www.youtube.com/channel/UCfnrrv4waBTQyOoWaPhaF9A', icon: 'a1fed5f687844a6e8f42e017f71dfcb4.png' },
];

export const ASSETS = {
  logo: '45f076_391386b1baea4a2393479050eeba3d1b~mv2.png',
  logoSmall: 'e365b3_de73b7f0e0fe4007a03817dd9c643d35~mv2.webp',
  logoWhite: '45f076_671c6c50de194fdcabae846ecf5cf8c8~mv2.png',
  sunburst: '45f076_e6de9dc340c34caca4cc3ba047357a57~mv2.png',
  diagram: '45f076_a0f28835621d43be97d0cde5cfc68767~mv2.png',
  skye: '45f076_dc6642574b3b46b691ab9dc93b7455d5~mv2.png',
  reviewsBanner: '45f076_f1ed0ffea40e4191965f9d092aed7c40~mv2.png',
  videoPoster: '11062b_a46161176ae344308f9dd3e1d7e4bf3ef000.jpg',
  video360: '/video/11062b_a46161176ae344308f9dd3e1d7e4bf3e-720p.mp4',
  videoSpain: '/video/45f076_fd17dae1af254648b6b5415d3d53e10f-720p.mp4',
  videoSpainPoster: '45f076_fd17dae1af254648b6b5415d3d53e10ff000.jpg',
};

// Images that section components place themselves; generic layouts skip them.
export const SHARED_IMAGES = new Set([ASSETS.sunburst, ASSETS.diagram, ASSETS.skye, ASSETS.reviewsBanner, ASSETS.videoPoster, ASSETS.logoWhite, ASSETS.logo]);

// Testimonial cards: the review text exists only inside these images (alt = attribution).
export const TESTIMONIAL_IMAGES = {
  '45f076_54d11676ebaa42c0ae8b2c80008f8b1e~mv2.webp': "Emma, 50's Doctor, Burn Out Retreat",
  '45f076_cccba05d09dc4e6ab260cd1f9f851891~mv2.jpg': 'James, 69, Equity Investor, Private Retreat, Zurich, Switzerland',
  '45f076_40d6050a104d40cf9e2dff8c1d4beaae~mv2.webp': "Patrick, 60's, De Stress Couples Retreat",
  '45f076_36fa9597d65240998da5c76292e316cd~mv2.jpg': 'Natalia, 41, Creative Director, Emotional Healing, New York City, USA',
  '45f076_8c59f35ddcf6420290795542d6acf81f~mv2.jpg': 'Amali, 42, Marketing Director, Detox Retreat, London, UK',
  '45f076_e57508d465524aa68bedd50d41ee0b7b~mv2.jpg': 'Michael, 51, Business Owner, Weight Loss Retreat, Toronto, Canada',
  '45f076_04a9af8421a8456491ac5c08e2a8c4fc~mv2.webp': "Ayman, 50's, Investment Banker, Stress Retreat",
  '45f076_319507ecf88b4584b8cbb25915e8cfed~mv2.jpg': 'Isabella, 47, Interior Designer, Spa Retreat, Milan, Italy',
  '45f076_7ef7b1a150294c70ba3ede4895ce26f4~mv2.webp': "Shane, 40's, Architect, Health Retreat",
  '45f076_27dd5fed7f634f3e8a2b3a498587f84a~mv2.webp': "Meg, Mining Executive, 40's, Burn Out Retreat",
  '45f076_e0cfcc42f86643518d560d20e79ac7c0~mv2.webp': 'Alive Luxury Wellness Retreats Agent Review',
};

export const PDFS = {
  packages: { href: '/pdf/45f076_06493ce8553948f98cac62a0ed3f1976.pdf', label: 'Wellness Retreat Packages (Bali & Mexico)' },
  packagesAlt: { href: '/pdf/45f076_74b3a68d8d3d437d85a4127462bf274f.pdf', label: 'Wellness Retreat Packages (alternate edition)' },
  vip: { href: '/pdf/45f076_9998735b68d44d1785ab41cf10418fce.pdf', label: 'VIP Private Retreat Brochure' },
};

// YouTube embeds (06 §9)
export const YOUTUBE = {
  '/private-luxury-vip-burnout-retreats': { id: 'UHYvy3JdlM0', title: 'Alive Luxury Private Retreats For Burn Out' },
  '/vip-one-on-one-private-retreats': { id: 'wfAKukd6e08', title: 'Alive Wellness Retreats | Holistic | Life Changing | Luxury' },
  '/weight-loss-retreat': { id: 'wfAKukd6e08', title: 'Alive Wellness Retreats | Holistic | Life Changing | Luxury' },
  '/wellness-and-emotional-wellbeing-retreat': { id: 'wfAKukd6e08', title: 'Alive Wellness Retreats | Holistic | Life Changing | Luxury' },
  '/wellness-retreat-australia': { id: 'wfAKukd6e08', title: 'Alive Wellness Retreats | Holistic | Life Changing | Luxury' },
};

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about-luxury-health-wellness-retreat', children: [
    { label: 'About Alive', href: '/about-luxury-health-wellness-retreat' },
    { label: 'FAQ', href: '/faq-pricing' },
    { label: 'Alive News', href: '/blog' },
  ] },
  { label: 'Program Focus', children: [
    { label: '360 Holistic Wellness', href: '/wellness-retreat-programs' },
    { label: 'Detox', href: '/detox-cleanse-retreat' },
    { label: 'Burn Out Retreats', href: '/de-stress-burn-out-retreat' },
    { label: 'Mental Health Retreats', href: '/luxury-mental-health-retreat' },
    { label: 'Anxiety Retreat', href: '/anxiety-retreat' },
    { label: 'Depression Retreat', href: '/depression-retreat' },
    { label: 'Grief Retreat', href: '/retreat-for-grief-loss-recovery' },
    { label: 'Trauma Retreat', href: '/trauma-ptsd-recovery-retreat-program' },
  ] },
  { label: 'Luxury Accommodation', children: [
    { label: 'Luxury Bali Retreat', href: '/bali' },
    { label: 'Luxury Mexico Retreat', href: '/mexico-wellness-retreat' },
  ] },
  { label: 'PDF Packages', href: '/download' },
  { label: 'Contact Us', href: '/contact', children: [
    { label: 'Contact Alive', href: '/contact' },
    { label: 'Speak To A Retreat Advisor', href: '/book-call' },
    { label: 'Chat Here', href: '/instant-pricing-packages-chat' },
    { label: 'Call', href: CONTACT.callTel },
    { label: 'Whatsapp', href: CONTACT.whatsappUrl, external: true },
    { label: 'Book A Discovery Call', href: '/book-call' },
  ] },
  { label: 'Request A Quote', href: '/get-a-quote' },
];

export const FOOTER_NAV = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about-luxury-health-wellness-retreat' },
  { label: 'FAQ', href: '/faq-pricing' },
  { label: 'Alive News', href: '/blog' },
  { label: 'PDF Packages', href: '/download' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Speak To A Retreat Advisor', href: '/book-call' },
  { label: 'Chat Here', href: '/instant-pricing-packages-chat' },
  { label: 'Request A Quote', href: '/get-a-quote' },
];

export const BOOKING_SERVICES = [
  { slug: 'speak-with-your-client-manager', name: 'Speak With Your Client Manager', duration: '45 min', minutes: 45, tagline: 'Book A Call At A Time That Suits', calendar: '/booking-calendar/speak-with-your-client-manager' },
  { slug: 'interview', name: 'Interview', duration: '1 hr', minutes: 60, tagline: null, calendar: null },
  { slug: 'heidi-pre-retreat-program-manager-call', name: 'Heidi - Pre Retreat Program Manager Call', duration: '1 hr 30 min', minutes: 90, tagline: 'Private holistic overview call with your Program Director to design your ultimate 1:1 program & team', calendar: null },
  { slug: 'pre-retreat-health-assessment', name: 'Pre-Retreat Health Assessment', duration: '1 hr 30 min', minutes: 90, tagline: 'Comprehensive Pre-Retreat Health Assessment', calendar: null },
];
