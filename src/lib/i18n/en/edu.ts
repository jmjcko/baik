import type { Translations } from '../types';

export const edu: Translations['edu'] = {
  title: 'bAIkedu academy',
  intro: 'Short, practical articles from the bAIk knowledge base. Read one in about two minutes, then open the tool it belongs to.',
  filtersLabel: 'Topics',
  all: 'All',
  tags: { bikefit: '#bikefit', care: '#maintenance', gear: '#gear', nutrition: '#nutrition', tyres: '#tyres-and-pressure' },
  searchLabel: 'Search the articles',
  searchPlaceholder: 'Search by keyword',
  readTime: '{min} min read',
  read: 'Read article',
  back: 'Back to the articles',
  empty: 'No article matches. Try another word or choose All.',
  count: '{n} articles',
  keyFacts: 'Key facts',
  sourceLabel: 'Knowledge base',
  sourceVideo: 'Source: YouTube – {channel}: {title} (time {time})',
  general: 'General information, not a substitute for medical advice or coaching.',
  openTool: { care: 'Open bAIkcare' },
  articles: {
    'bike-weight': {
      title: 'The myth of the bike weight',
      teaser: 'Why one or two extra kilograms on the frame mean almost nothing in the real world.',
      points: [
        'The weight of a bike is overrated because it is easy to read on a scale.',
        'Away from steep climbs a few extra kilograms change the time of a ride very little. The kilometres you ride and the aerodynamics matter far more.',
        'Compliant tyres and a good riding position return more for the money than lighter components.',
      ],
    },
    'm-check': {
      title: 'The 5-minute M-Check',
      teaser: 'A simple look over the bike before a ride, with no tools.',
      points: [
        'Follow the line of the letter M: front wheel and hub, headset and cockpit, bottom bracket and cranks, seatpost and saddle, rear wheel and derailleur.',
        'Look for play in the bearings, the state of the tyres, the tightness of the stem and seatpost bolts, and the wear of the chain.',
      ],
      source: 'bAIkcare knowledge base v1.1.0, the M-Check protocol.',
    },
    'numb-hands': {
      title: 'Numb hands and nerve flossing',
      teaser: 'How to ease the pressure on the ulnar and the median nerve, on the bike and off it.',
      points: [
        'Numbness in the little finger and the half of the ring finger next to it points to the ulnar nerve, in the thumb, index and middle finger to the median nerve.',
        'Usual causes: handlebars that are too wide (the wrists turn out), a long reach, or a saddle that tilts down.',
        'Nerve flossing: a gentle alternating movement of the arms and the head slides the nerve in its sheath and restores circulation, without aggressive stretching.',
      ],
      note: 'If the numbness stays or comes back, ask a doctor or a physiotherapist.',
      source: 'bAIkfit knowledge base v1.4.0.',
    },
    cleats: {
      title: 'Shoes, arch support and cleat position',
      teaser: 'Why to replace the factory insoles and move the cleats towards the heel.',
      points: [
        'Factory insoles are only there to try the shoe on in the shop and give no arch support.',
        'Buying a longer shoe to get more width moves the cleat off the joints, too far forward.',
        'A cleat further back, between the first and the fifth metatarsal, eases the calves, steadies the ankle and brings in the glutes and the hamstrings.',
      ],
    },
    fuelling: {
      title: 'Fuelling on the bike',
      teaser: 'The 30 minute rule and how to avoid the energy crash known as the bonk.',
      points: [
        'Eat and drink from the first half hour of a ride; once you feel hungry the body is already losing glycogen.',
        'A suggested ratio of the whole day for a rider building up: about 60 per cent carbohydrates, 20 per cent protein and 20 per cent fat.',
      ],
      note: 'This is general information. Ask a doctor or a dietitian about your own needs.',
    },
    'tyre-science': {
      title: 'The science of tyre pressure and width',
      teaser: 'Why a wider tyre is not faster by itself, and how to tame the vibrations.',
      points: [
        'In the lab a wider tyre at the same pressure rolls easier, but on the road you ride a lower pressure: at the same squash and comfort the rolling resistance is about the same.',
        'An over-inflated tyre bounces on bumps and loses watts to vibrations (impedance). A wider tyre lets you run a lower pressure without a pinch flat.',
        'Rule of 105: the rim should be about 5 per cent wider than the tyre you measured on it, to keep the air flow attached.',
      ],
      source: 'bAIkcare knowledge base v1.1.0, section 5a.',
    },
  },
};
