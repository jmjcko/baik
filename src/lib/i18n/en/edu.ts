import type { Translations } from '../types';

export const edu: Translations['edu'] = {
  title: 'bAIkedu academy',
  intro: 'Short, practical tips from the bAIk knowledge base. Read one in about two minutes, then open the tool it belongs to.',
  filtersLabel: 'Topics',
  all: 'All',
  tags: { bikefit: '#bikefit', care: '#maintenance', gear: '#gear', nutrition: '#nutrition', tyres: '#tyres-and-pressure' },
  searchLabel: 'Search the tips',
  searchPlaceholder: 'Search by keyword',
  readTime: '{min} min read',
  read: 'Read the tip',
  back: 'Back to the tips',
  empty: 'No tip matches. Try another word or choose All.',
  count: '{n} tips',
  keyFacts: 'Key facts',
  sourceLabel: 'Knowledge base',
  sourcesTitle: 'Watch the source',
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
    'shifting-technique-drivetrain-care': {
      title: 'Proper gear shifting technique and drivetrain care',
      teaser: 'Learn to use your shifters, ease the pedal pressure while you shift, and avoid the damaging chain angles of cross-chaining.',
      points: [
        'The right shifter moves the rear cassette (fine adjustment), the left shifter moves the front chainring (big jumps in gearing).',
        'Keep a steady cadence of about 80 to 95 rpm by matching the gear to the terrain.',
        'Anticipate a climb and shift down about 20 metres before it starts, so you never shift under full load.',
        'Ease the pressure on the pedals for a moment while you shift, for a smooth and quiet chain.',
        'Avoid cross-chaining (big chainring with the biggest sprocket, or small with the smallest): it wears the expensive drivetrain parts.',
      ],
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
    'how-to-choose-bike-type-guide': {
      title: 'How to choose the right type of bike (a beginner guide)',
      teaser: 'A short guide to road, gravel and mountain bikes, to help you find the one that suits your riding.',
      points: [
        'Road bikes split into Race (an aggressive, long and low position for experienced riders) and Endurance (a more comfortable, shorter and higher position for long rides).',
        'Gravel bikes combine road drop handlebars with wide tyres, a more stable geometry and lighter gearing, for the road and for the trail.',
        'Mountain bikes have flat handlebars and suspension for control on rough terrain; the upright position and the tread of the tyres add drag on tarmac.',
      ],
    },
    'pedalling-technique-myths-efficiency': {
      title: 'Pedalling technique myths: why "pedalling in circles" does not pay off',
      teaser: 'What the research says about pulling the pedal up, and how the professionals really pedal.',
      points: [
        'The gross metabolic efficiency of a rider does not differ much between beginners and professionals.',
        'Actively pulling the pedal up ("pedalling in circles") makes the muscle contract for longer and lowers the overall energy efficiency.',
        'Professional riders produce their peak power by pushing down early and firmly, roughly when the crank points at three o\'clock, and by unloading the pedal on the way up.',
        'The efficiency of your pedalling improves naturally with the kilometres you ride and with training at different cadences.',
      ],
    },
    'bike-theft-prevention-locking-tricks': {
      title: 'How to secure your bike against thieves and not fall for their tricks',
      teaser: 'The usual tricks of bike thieves and a calm way of locking, without needless worry.',
      points: [
        'Thieves lock their own lock through your bike or loosen street signs from the ground, to make you leave the bike where it is overnight.',
        'Good security stretches the time needed to beat the lock past 3 to 5 minutes and puts off most opportunist thieves.',
        'For all-day parking use a folding lock together with a heavy U-lock, in a well lit place.',
        'Register the serial number of the frame and photos of the bike in a database such as Bike Index or Project 529.',
      ],
    },
    'bike-radar-lights-comparison-2025': {
      title: 'Bike radar lights 2025: a comparison of 6 models and what to look for',
      teaser: 'A short comparison of bike radars by detection range, brightness, battery life and safety details.',
      points: [
        'Bike radars warn you of approaching vehicles from a distance of up to about 160 metres.',
        'The Coospo model stands out for value and a battery life of up to 26 hours.',
        'Weigh the weight against the battery: the lightest in the test, the iGPSPORT SR Mini (49 g), suits short rides (about 7 hours), while the Ravemen has the strongest light (80 lumens).',
        'Use the safety lanyard, so that the light is not lost if its mount comes loose on a rough road.',
      ],
    },
  },
};
