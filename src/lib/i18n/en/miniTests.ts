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
    diagramLabel: 'Illustration of a rider lying on the back with one straight leg raised; the angle marks show below 60° as low flexibility, 60° to 75° as medium and above 75° as high.',
    diagramCaption: 'The rider lies on the back and raises one straight leg. Below 60° is low flexibility, 60° to 75° is medium, above 75° is high.',
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
    diagramLabel: 'Illustration of a rider on a bike on a trainer with the hands released 2 cm above the handlebars; arrows show the forces on the saddle and the pedals and the engaged core.',
    diagramCaption: 'The hands hover 2 cm above the bars while the core holds the torso. The arrows show the weight on the saddle and on the pedals.',
  },
};
