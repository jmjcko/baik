import type { Translations } from '../types';

export const miniTests: Translations['miniTests'] = {
  title: 'Two quick mobility tests',
  intro: 'Optional. Each takes about a minute and lets bAIk adjust your target position to your body.',
  optional: 'optional',
  clear: 'Clear my answer',
  hamstring: {
    title: 'Hamstring flexibility (straight leg raise)',
    steps: [
      'Lie on your back on the floor with both legs straight.',
      'Ask someone to lift one straight leg, or lift it yourself with a towel around the foot, until your knee starts to bend or your pelvis tilts.',
      'Estimate the angle between the raised leg and the floor, or measure it with a phone level.',
    ],
    question: 'How high does your straight leg go?',
    options: {
      low: { title: 'Below 60°', hint: 'Short hamstrings.', effect: 'We target a handlebar stack {stack} mm higher (a smaller drop) so that your lower back does not round, and we never suggest lowering the handlebars.' },
      medium: { title: '60° to 75°', hint: 'Average flexibility.', effect: 'Your target position does not change.' },
      high: { title: 'Above 75°', hint: 'Flexible hamstrings.', effect: 'Your target position does not change.' },
    },
    diagramLabel: 'Side view of a rider lying on the back with one straight leg raised; marks at 60° and 75° from the resting leg.',
    diagramCaption: 'The rider lies on the back. The blue leg is raised straight; the red mark is 60°, the green mark is 75°.',
  },
  release: {
    title: 'Hand release test (core balance)',
    steps: [
      'Sit on your bike on a trainer or against a wall, in your usual riding position.',
      'Lift your palms about 2 cm above the handlebars and hold them there for 3 seconds, in the tempo of riding.',
      'Notice whether you fall forward onto the bars or keep your position with your core.',
    ],
    question: 'What happens when your hands leave the bars?',
    options: {
      slumping: { title: 'I fall forward', hint: 'Your hands carry part of your torso.', effect: 'We move the target saddle position {setback} mm back so that your pelvis carries your torso, and we never suggest lowering the handlebars.' },
      stable: { title: 'I hold the position', hint: 'Your core carries your torso.', effect: 'Your target position does not change.' },
    },
    diagramLabel: 'Side view of a rider on a bike with the hands lifted 2 cm above the handlebars; a dashed line shows the torso falling forward.',
    diagramCaption: 'The hands hover 2 cm above the bars for 3 seconds. The dashed red line is the torso that falls forward.',
  },
};
