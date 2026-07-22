import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'en' | 'af';

const MESSAGES: Record<Lang, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.schedule': 'Schedule',
    'nav.djs': 'DJs',
    'nav.events': 'Events',
    'nav.gallery': 'Gallery',
    'nav.chat': 'Chat',
    'nav.about': 'About',
    'nav.support': 'Support',
    'nav.contact': 'Contact',
    'nav.submit': 'Submit',
    'nav.signin': 'Sign in',
    'nav.admin': 'Admin',
    'nav.logout': 'Logout',
    'nav.menu': 'Menu',

    // Player
    'player.listenNow': 'Listen Now',
    'player.pause': 'Pause',
    'player.play': 'Play',
    'player.volume': 'Volume',
    'player.listeners': 'listeners',
    'player.kbps': 'kbps',
    'player.live': 'LIVE',
    'player.streaming': 'Streaming 256kbps AAC+',

    // Home
    'home.tagline': 'PsyTech Fusion Radio',
    'home.subtitle': 'Transcend the Vibration',
    'home.listenLive': 'Listen Live',
    'home.nowPlaying': 'Now Playing',
    'home.listeningNow': 'listening now',
    'home.featuredShows': 'Featured Shows',
    'home.recentlyPlayed': 'Recently Played',
    'home.viewSchedule': 'View Full Schedule',
    'home.submitYourShow': 'Submit Your Show',

    // Schedule
    'schedule.title': 'Weekly Schedule',
    'schedule.today': 'Today',
    'schedule.live': 'LIVE',
    'schedule.noShows': 'No shows scheduled',
    'schedule.allTimes': 'All times in SAST',

    // DJs
    'djs.title': 'Our DJs',
    'djs.bio': 'Bio',
    'djs.shows': 'Shows',
    'djs.genres': 'Genres',

    // Events
    'events.title': 'Events',
    'events.upcoming': 'Upcoming',
    'events.past': 'Past',
    'events.days': 'd',
    'events.hours': 'h',
    'events.mins': 'm',
    'events.secs': 's',
    'events.countdown': 'Countdown',

    // Gallery
    'gallery.title': 'Gallery',
    'gallery.all': 'All',
    'gallery.events': 'Events',
    'gallery.studio': 'Studio',
    'gallery.community': 'Community',
    'gallery.art': 'Art',
    'gallery.noImages': 'No images found in this category.',
    'gallery.showAll': 'Show all images →',
    'gallery.viewImage': 'View:',

    // Blog
    'blog.title': 'Blog & News',
    'blog.readMore': 'Read More',
    'blog.minRead': 'min read',
    'blog.latestPosts': 'Latest Posts',
    'blog.categories': 'Categories',
    'blog.all': 'All',
    'blog.announcements': 'Announcements',
    'blog.community': 'Community',
    'blog.tech': 'Tech',
    'blog.music': 'Music',

    // Podcast
    'podcast.title': 'On Demand',
    'podcast.subtitle': 'Catch up on past shows and exclusive mixes',
    'podcast.latest': 'Latest Episodes',
    'podcast.popular': 'Most Popular',
    'podcast.duration': 'Duration',
    'podcast.episode': 'Episode',
    'podcast.listen': 'Listen',
    'podcast.download': 'Download',
    'podcast.allShows': 'All Shows',
    'podcast.noEpisodes': 'No episodes available yet.',

    // Support
    'support.title': 'Support Lekkerkuier',
    'support.subtitle': 'We are a community-powered, independent radio station. Every contribution helps keep the music playing 24/7 — server costs, licensing, and growing our reach.',
    'support.streaming': 'Streaming',
    'support.listenerFunded': 'Listener Funded',
    'support.goodVibes': 'Good Vibes',
    'support.noAds': 'Corporate Ads',
    'support.chooseLevel': 'Choose Your Support Level',
    'support.perMonth': '/mo',
    'support.selected': 'Selected ✓',
    'support.donateCard': 'Donate with Card',
    'support.paypal': 'PayPal',
    'support.crypto': 'Crypto',
    'support.comingSoon': 'payments coming soon — stay tuned!',
    'support.secure': 'Secure payment processing. We will never share your info.',
    'support.thankYou': 'thank you',
    'support.closingMessage': 'for being part of Lekkerkuier.',
    'support.otherWays': 'Other Ways to Support',
    'support.eternalGratitude': 'Our eternal gratitude',
    'support.nameOnSite': 'Name on website',

    // About
    'about.title': 'About Lekkerkuier',
    'about.story': 'Our Story',
    'about.mission': 'Our Mission',
    'about.values': 'Our Values',
    'about.timeline': 'Timeline',
    'about.faq': 'Frequently Asked Questions',
    'about.stats': 'Station Stats',

    // Contact
    'contact.title': 'Contact Us',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'contact.sending': 'Sending...',
    'contact.sent': 'Message sent! We will get back to you soon.',
    'contact.sendAnother': 'Send another',

    // Chat
    'chat.title': 'Listener Chat',
    'chat.yourName': 'Your Name',
    'chat.typeMessage': 'Type a message...',
    'chat.send': 'Send',
    'chat.songRequest': 'Song Request',
    'chat.noMessages': 'No messages yet. Start the conversation!',

    // Footer
    'footer.brandDesc': "Mzansi's 24/7 PsyTech Fusion radio. Transcend the Vibration. Broadcasting psytrance, industrial, and electronic music to the world.",
    'footer.liveNow': 'Live now',
    'footer.quickLinks': 'Quick Links',
    'footer.connect': 'Connect',
    'footer.copyright': 'Lekker Kuier Psy Radio. All rights reserved.',
    'footer.madeIn': 'Made with 💜 in Mzansi',

    // Auth
    'auth.login': 'Login',
    'auth.token': 'Operator Token',
    'auth.enterToken': 'Enter your operator token',
    'auth.submit': 'Submit',
    'auth.error': 'Invalid token',

    // General
    'general.loading': 'Loading...',
    'general.error': 'Something went wrong.',
    'general.retry': 'Try Again',
    'general.backToHome': 'Back to Home',
    'general.skipToContent': 'Skip to main content',
    'general.refresh': 'Refresh Page',

    // Theme
    'theme.psytech': 'PsyTech',
    'theme.cosmic': 'Cosmic',
    'theme.industrial': 'Industrial',

    // Search
    'search.placeholder': 'Search blog, podcasts, events...',
    'search.noResults': 'No results found for',
    'search.typeMore': 'Type at least 2 characters to search...',
    'search.navigateHint': 'Press ↑↓ to navigate, Enter to open, Esc to close',

    // History
    'history.title': 'Track History',
    'history.nowPlaying': 'Now Playing',
    'history.allTracks': 'All Tracks',
  },

  af: {
    // Nav
    'nav.home': 'Tuis',
    'nav.schedule': 'Program',
    'nav.djs': 'DJs',
    'nav.events': 'Gebeure',
    'nav.gallery': 'Gallery',
    'nav.chat': 'Gesels',
    'nav.about': 'Oor Ons',
    'nav.support': 'Ondersteun',
    'nav.contact': 'Kontak',
    'nav.submit': 'Dien In',
    'nav.signin': 'Teken In',
    'nav.admin': 'Admin',
    'nav.logout': 'Teken Uit',
    'nav.menu': 'Spyskaart',

    // Player
    'player.listenNow': 'Luister Nou',
    'player.pause': 'Stop',
    'player.play': 'Speel',
    'player.volume': 'Volume',
    'player.listeners': 'luisteraars',
    'player.kbps': 'kbps',
    'player.live': 'LEWENDIG',
    'player.streaming': 'Stroom 256kbps AAC+',

    // Home
    'home.tagline': 'PsyTech Fusion Radio',
    'home.subtitle': 'Oorstyg die Vibrasie',
    'home.listenLive': 'Luister Lewendig',
    'home.nowPlaying': 'Speel Nou',
    'home.listeningNow': 'luister nou',
    'home.featuredShows': 'Uitgeligte Programme',
    'home.recentlyPlayed': 'Onlangs Gespeel',
    'home.viewSchedule': 'Bekyk Volledige Program',
    'home.submitYourShow': 'Dien Jou Program In',

    // Schedule
    'schedule.title': 'Weeklikse Program',
    'schedule.today': 'Vandag',
    'schedule.live': 'LEWENDIG',
    'schedule.noShows': 'Geen programme geskeduleer',
    'schedule.allTimes': 'Alle tye in SAST',

    // DJs
    'djs.title': 'Ons DJs',
    'djs.bio': 'Bio',
    'djs.shows': 'Programme',
    'djs.genres': 'Genres',

    // Events
    'events.title': 'Gebeure',
    'events.upcoming': 'Komende',
    'events.past': 'Verlede',
    'events.days': 'd',
    'events.hours': 'u',
    'events.mins': 'm',
    'events.secs': 's',
    'events.countdown': 'Aftelling',

    // Gallery
    'gallery.title': 'Gallery',
    'gallery.all': 'Alles',
    'gallery.events': 'Gebeure',
    'gallery.studio': 'Ateljee',
    'gallery.community': 'Gemeenskap',
    'gallery.art': 'Kuns',
    'gallery.noImages': 'Geen prente in hierdie kategorie.',
    'gallery.showAll': 'Wys alle prente →',
    'gallery.viewImage': 'Bekyk:',

    // Blog
    'blog.title': 'Blog & Nuus',
    'blog.readMore': 'Lees Meer',
    'blog.minRead': 'min lees',
    'blog.latestPosts': 'Jongste Plasings',
    'blog.categories': 'Kategorieë',
    'blog.all': 'Alles',
    'blog.announcements': 'Aankondigings',
    'blog.community': 'Gemeenskap',
    'blog.tech': 'Tegnologie',
    'blog.music': 'Musiek',

    // Podcast
    'podcast.title': 'Op Aanvraag',
    'podcast.subtitle': 'Haal vorige programme en eksklusiewe mengsels in',
    'podcast.latest': 'Jongste Episodes',
    'podcast.popular': 'Gewildste',
    'podcast.duration': 'Duur',
    'podcast.episode': 'Episode',
    'podcast.listen': 'Luister',
    'podcast.download': 'Aflaai',
    'podcast.allShows': 'Alle Programme',
    'podcast.noEpisodes': 'Nog geen episodes beskikbaar.',

    // Support
    'support.title': 'Ondersteun Lekkerkuier',
    'support.subtitle': 'Ons is \'n gemeenskap-gedrewe, onafhanklike radiostasie. Elke bydrae help om die musiek 24/7 aan die gang te hou — bedienerkoste, lisensiëring, en groei.',
    'support.streaming': 'Stroom',
    'support.listenerFunded': 'Luisteraar Befonds',
    'support.goodVibes': 'Goeie Vibes',
    'support.noAds': 'Korporatiewe Advertensies',
    'support.chooseLevel': 'Kies Jou Ondersteuningsvlak',
    'support.perMonth': '/maand',
    'support.selected': 'Gekies ✓',
    'support.donateCard': 'Skenk met Kaart',
    'support.paypal': 'PayPal',
    'support.crypto': 'Kripto',
    'support.comingSoon': 'betalings kom binnekort — bly ingeskakel!',
    'support.secure': 'Veilige betalingsverwerking. Ons sal nooit jou inligting deel nie.',
    'support.thankYou': 'dankie',
    'support.closingMessage': 'dat jy deel is van Lekkerkuier.',
    'support.otherWays': 'Ander Maniere om te Ondersteun',
    'support.eternalGratitude': 'Ons ewige dankbaarheid',
    'support.nameOnSite': 'Naam op webwerf',

    // About
    'about.title': 'Oor Lekkerkuier',
    'about.story': 'Ons Storie',
    'about.mission': 'Ons Missie',
    'about.values': 'Ons Waardes',
    'about.timeline': 'Tydlyn',
    'about.faq': 'Gereelde Vrae',
    'about.stats': 'Stasie Statistieke',

    // Contact
    'contact.title': 'Kontak Ons',
    'contact.name': 'Naam',
    'contact.email': 'E-pos',
    'contact.message': 'Boodskap',
    'contact.send': 'Stuur Boodskap',
    'contact.sending': 'Stuur...',
    'contact.sent': 'Boodskap gestuur! Ons sal binnekort terugkom.',
    'contact.sendAnother': 'Stuur nog een',

    // Chat
    'chat.title': 'Luisteraar Gesels',
    'chat.yourName': 'Jou Naam',
    'chat.typeMessage': 'Tik \'n boodskap...',
    'chat.send': 'Stuur',
    'chat.songRequest': 'Liedjie Versoek',
    'chat.noMessages': 'Nog geen boodskappe. Begin die gesprek!',

    // Footer
    'footer.brandDesc': 'Mzansi se 24/7 PsyTech Fusion radio. Oorstyg die Vibrasie. Uitsaai van psigtrance, industriële, en elektroniese musiek na die wêreld.',
    'footer.liveNow': 'Lewendig nou',
    'footer.quickLinks': 'Vinnige Skakels',
    'footer.connect': 'Kontak',
    'footer.copyright': 'Lekker Kuier Psy Radio. Alle regte voorbehou.',
    'footer.madeIn': 'Gemaak met 💜 in Mzansi',

    // Auth
    'auth.login': 'Teken In',
    'auth.token': 'Operateur Token',
    'auth.enterToken': 'Voer jou operateur token in',
    'auth.submit': 'Dien In',
    'auth.error': 'Ongeldige token',

    // General
    'general.loading': 'Laai...',
    'general.error': 'Iets het verkeerd geloop.',
    'general.retry': 'Probeer Weer',
    'general.backToHome': 'Terug na Tuis',
    'general.skipToContent': 'Spring na hoofinhoud',
    'general.refresh': 'Verfris Bladsy',

    // Theme
    'theme.psytech': 'PsyTech',
    'theme.cosmic': 'Kosmies',
    'theme.industrial': 'Industrieel',

    // Search
    'search.placeholder': 'Soek blog, podcasts, gebeure...',
    'search.noResults': 'Geen resultate vir',
    'search.typeMore': 'Tik ten minste 2 karakters om te soek...',
    'search.navigateHint': 'Druk ↑↓ om te navigeer, Enter om oop te maak, Esc om toe te maak',

    // History
    'history.title': 'Snit Geskiedenis',
    'history.nowPlaying': 'Speel Nou',
    'history.allTracks': 'Alle Snitte',
  },
};

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('lk-lang');
  if (stored === 'en' || stored === 'af') return stored;
  const navLang = navigator.language?.slice(0, 2);
  if (navLang === 'af') return 'af';
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('lk-lang', l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string): string => {
      return MESSAGES[lang]?.[key] ?? MESSAGES['en']?.[key] ?? key;
    },
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export { MESSAGES };
