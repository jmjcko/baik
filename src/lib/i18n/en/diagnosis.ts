import type { Translations } from '../types';

/** Texts follow docs/knowledge/baikfit_kb_v1.3.0.md section 6 (decision tree) and 4.1 (pressure relief). */
export const diagnosis: Translations['diagnosis'] = {
  heading: 'What your symptoms usually mean',
  noSymptoms: 'No discomfort reported, great. If something starts to bother you, add it in step 3 of the wizard and we will explain the likely cause.',
  rootCauseLabel: 'Likely cause',
  fixesLabel: 'What to do',
  learnMore: 'Nerve flossing guide',
  items: {
    ulnar: {
      title: 'Numb hands: little and ring finger (ulnar nerve)',
      rootCause: 'Compression of the ulnar nerve from rolled wrists or too much weight on the hands.',
      fixes: [
        'Match the handlebar width to your acromion width (1:1).',
        'Level the saddle (0° to -1.5°).',
        'Reduce the cockpit reach.',
        'Perform ulnar nerve flossing exercises.',
      ],
    },
    median: {
      title: 'Numb hands: thumb, index and middle finger (median nerve)',
      rootCause: 'Compression of the median nerve (carpal tunnel) from road vibration and wrist bending.',
      fixes: [
        'Rotate the shifters and hoods flat to eliminate wrist hyperextension.',
        'Lower the tire pressure (Silca calculator).',
        'Use grippy non-cork bar tape.',
        'Perform median nerve flossing exercises.',
      ],
    },
    anteriorKnee: {
      title: 'Anterior (front, patellar) knee pain',
      rootCause: 'Saddle too low or too far forward, forcing hyper-flexion under load.',
      fixes: ['Raise the saddle height in 3–5 mm increments.', 'Move the saddle setback rearward.'],
    },
    posteriorKnee: {
      title: 'Posterior (back, hamstring) knee pain',
      rootCause: 'Saddle too high or too far back, causing over-extension at 6 o\'clock.',
      fixes: ['Lower the saddle height in 5–10 mm increments.', 'Bring the saddle setback forward.'],
    },
    lowerBack: {
      title: 'Lower back strain and fatigue',
      rootCause: 'Posterior pelvic tilt (slouching) from soft tissue pain or excessive reach and drop.',
      fixes: ['Switch to a saddle with a cutout.', 'Reduce the reach and drop.', 'Engage the core (strength conditioning).'],
    },
    neck: {
      title: 'Neck and trapezius pain',
      rootCause: 'Handlebars too wide (forcing the arms wide) or reach too long (stretching the shoulders).',
      fixes: ['Narrow the handlebars to your acromion width.', 'Shorten the stem by 10–20 mm.'],
    },
    saddlePressure: {
      title: 'Saddle sores and perineal pressure',
      rootCause: 'No pressure relief: a saddle without a central cutout (90%+ of riders need one) or a saddle that is too wide.',
      fixes: [
        'Use a saddle with a central cutout or a deep relief channel.',
        'Keep the saddle width at or below 145 mm.',
        'Keep the saddle level to at most 1.5°–2.0° nose down.',
      ],
    },
  },
};
