import type { Translations } from '../types';

export const workshop: Translations['workshop'] = {
  title: 'Workshop',
  intro: 'Describe what the bike does and the workshop points you to the right check or guide. Take your time: brakes and gears are worth doing right.',
  back: 'Back to the workshop',
  next: 'Next step',
  previous: 'Previous step',
  finish: 'Done',
  stepOf: 'Step {n} of {total}',
  troubleshooter: {
    title: 'What is the bike doing?',
    intro: 'Pick the symptom that fits best.',
    groups: { drivetrain: 'Drivetrain and shifting', brakes: 'Brakes', movement: 'Moving parts' },
    symptoms: {
      chainSkips: {
        label: 'The chain skips or shifts roughly',
        cause: 'Most often a worn chain, a stretched or dry cable, or a derailleur that is out of adjustment.',
        checks: ['Measure the chain wear first: a worn chain skips under load.', 'Look at the cable for rust or a kink and check the shifter and the derailleur for dirt.', 'If the chain is fine, adjust the indexing of the rear derailleur.'],
      },
      chainDrops: {
        label: 'The chain falls off behind the cassette or into the frame',
        cause: 'The limit screws of the rear derailleur are set too wide, or the derailleur hanger is bent.',
        checks: ['Look from behind: the hanger must be straight and the derailleur parallel to the wheel.', 'Set the limit screws so that the chain cannot pass the smallest or the largest sprocket.', 'Check the chain wear as well.'],
      },
      noisyDrive: {
        label: 'The drivetrain is noisy',
        cause: 'A dry or dirty chain, a worn chain, or a derailleur that is slightly out of adjustment.',
        checks: ['Clean and lubricate the chain, then wipe off the excess oil.', 'Check the chain wear.', 'If the noise is only in some gears, fine-tune the indexing.'],
      },
      spongyLever: {
        label: 'The brake lever is soft or goes to the handlebar',
        cause: 'Air in the hydraulic line, or pads and pistons that need service.',
        checks: ['Squeeze the lever with the bike standing: a soft lever that slowly sinks points to air in the line.', 'Look for oil on the hose, the lever and the caliper.', 'Bleeding the brake usually fixes it.'],
      },
      rotorRub: {
        label: 'The disc squeals or rubs against the pads',
        cause: 'A caliper that is not centred, a slightly bent rotor, or a contaminated rotor.',
        checks: ['Spin the wheel and listen where the rub is: one spot means a bent rotor, a steady rub means the caliper.', 'Centre the caliper over the rotor.', 'Wipe the rotor with isopropyl alcohol of 99 % purity if it squeals.'],
      },
      weakBraking: {
        label: 'The braking power is weak',
        cause: 'Worn or contaminated pads, a dirty rotor, or air in the line.',
        checks: ['Check the pad material in node 1 of the M-Check.', 'Look for oil or grease on the rotor and the pads.', 'If the lever is soft as well, bleed the brake.'],
      },
      playLooseness: {
        label: 'Play in the headset or in the hubs',
        cause: 'A loose headset preload or hub bearings that are worn or loose.',
        checks: ['Hold the front brake and rock the bike back and forth: knocking in the headset means play.', 'Grab the wheel at the top and rock it sideways to feel a hub.', 'Go through the matching node of the M-Check.'],
      },
      bottomBracketCreak: {
        label: 'Creaking around the bottom bracket or the pedals',
        cause: 'Loose crank bolts, dry pedal threads or a bottom bracket that needs service.',
        checks: ['Check the crank arms for play and the pedal threads for grease.', 'Go through node 3 of the M-Check.'],
      },
    },
    causeTitle: 'Likely cause',
    checksTitle: 'Look at first',
    nextTitle: 'What to do next',
    wizardNames: { bleed: 'Guide: bleeding hydraulic brakes', derailleur: 'Guide: adjusting the rear derailleur', rotor: 'Guide: centring the caliper and straightening the rotor' },
    openGuide: 'Open the guide',
    openNode: 'Open node {n} of the M-Check',
    goToChain: 'Go to the chain gauge',
  },
  bleed: {
    title: 'Bleeding hydraulic brakes',
    intro: 'A careful job for a quiet hour. If you are not sure at any point, stop and take the bike to a workshop.',
    diagramLabel: 'Brake lever, hose and caliper with the syringe at the caliper and the funnel at the lever',
    fluidRule: 'Always check the text on the reservoir cap or on the lever (Mineral Oil or DOT) before you open anything.',
    fluidQuestion: 'Which fluid does your brake use?',
    fluidExamples: 'Examples of brands only, never a proof: read the cap or the manual.',
    fluids: {
      mineral: { name: 'Mineral oil', brands: 'for example Shimano, Magura, TRP' },
      dot: { name: 'DOT 4 / 5.1 fluid', brands: 'for example SRAM, Hope, Hayes' },
    },
    mixWarning: 'Never mix DOT fluid and mineral oil. The seals are ruined and the brake fails.',
    chosen: 'Your fluid: {fluid}',
    needFluid: 'Choose the fluid to continue.',
    manual: 'Follow the manual of your brake for the exact kit and the amounts. If anything is unclear, go to a workshop.',
    steps: [
      {
        title: '1. Know your fluid',
        body: 'The two fluids look alike and they do not mix.',
        points: ['Read the text on the reservoir cap or on the lever.', 'Use only the fluid and the bleed kit made for that brake.'],
        warning: 'Mixing the fluids destroys the seals.',
      },
      {
        title: '2. Prepare and protect yourself',
        body: 'Brake fluid irritates skin and eyes and it ruins paint.',
        points: ['Put on nitrile gloves and safety glasses.', 'Lay out a cloth, the bleed kit and isopropyl alcohol (IPA 99 %).', 'Hold the bike steady, with the lever level with the caliper.'],
      },
      {
        title: '3. Pads out, piston spacer in',
        body: 'Oil on the pads means no braking power, so the pads leave before the fluid comes.',
        points: ['Take the wheel out and remove the brake pads.', 'Keep the pads far away from the fluid, in a clean place.', 'Put the plastic piston spacer between the pistons of the caliper.'],
        warning: 'Never squeeze the lever when the pads are out and the spacer is not in.',
      },
      {
        title: '4. Fill from the bottom up',
        body: 'The fluid goes in at the caliper and rises to the lever, so the air is pushed out at the top.',
        points: ['Connect the syringe to the caliper and the funnel to the lever.', 'Push the fluid slowly through the line until no more bubbles come out at the funnel.', 'Tap the hose and the lever lightly to free the bubbles.', 'Close the lever, then the caliper, and wipe off every drop.'],
      },
      {
        title: '5. Clean and test',
        body: 'Every trace of fluid must go before the pads go back.',
        points: ['Clean the caliper and the rotor with isopropyl alcohol of 99 % purity.', 'Take out the spacer, fit clean pads and the wheel.', 'Squeeze the lever: it must be firm before you ride. Test on a quiet road first.'],
        warning: 'If the lever is still soft, do not ride. Bleed again or go to a workshop.',
      },
    ],
  },
  derailleur: {
    title: 'Adjusting the rear derailleur',
    intro: 'Four steps from the frame to the cassette. Do them in this order, because each step depends on the one before.',
    diagramLabel: 'Side view of the rear derailleur and the cassette, with the part of the current step marked',
    steps: [
      {
        title: '1. Check the hanger and the cable',
        body: 'A bent hanger or a sticky cable cannot be fixed with any screw.',
        points: ['Look from behind: the hanger is perpendicular to the wheel plane and the derailleur cage hangs straight.', 'The derailleur bolt is tightened to 9 Nm.', 'Release the cable tension for now and check the cable and the housing for rust and kinks.'],
        warning: 'A visibly bent hanger needs a hanger alignment tool or a replacement, not a guess.',
      },
      {
        title: '2. Set the limit screws H and L',
        body: 'The limits keep the chain on the cassette.',
        points: ['H stops the derailleur at the smallest sprocket so that the chain cannot fall off towards the frame.', 'L stops it at the largest sprocket so that the chain cannot drop into the spokes.', 'Turn a screw in small steps and check by pushing the derailleur by hand.'],
        warning: 'The low-limit screw L must always prevent the derailleur from entering the spokes.',
      },
      {
        title: '3. Index the shifting with the barrel adjuster',
        body: 'The barrel adjuster fine-tunes the cable tension.',
        points: ['Reconnect the cable with the shifter in the smallest sprocket and the barrel adjuster almost fully in.', 'Shift up and down through the gears and listen for hesitation.', 'Turn the barrel adjuster a quarter turn at a time and shift again after each turn.'],
      },
      {
        title: '4. Set the B-gap',
        body: 'The B-gap is the distance between the upper guide pulley and the sprocket.',
        points: ['Shift to the largest sprocket and look at the gap between the guide pulley and the sprocket.', 'Turn the B-screw until the gap matches the manual of your derailleur.', 'Shift through all gears once more and finish with a short test ride.'],
      },
    ],
  },
  rotor: {
    title: 'Centring the caliper and straightening the rotor',
    intro: 'Most rubbing is cured by centring the caliper. A bent rotor needs a little more patience.',
    diagramLabel: 'Caliper over the rotor with the pads, the mounting bolts and the lever, with the part of the current step marked',
    steps: [
      {
        title: '1. Loosen the caliper bolts',
        body: 'The caliper has to be free to move sideways.',
        points: ['Spin the wheel and find out whether the rub is steady or in one spot.', 'Loosen the two caliper mounting bolts just enough for the caliper to move by hand.'],
      },
      {
        title: '2. Squeeze the lever and hold it',
        body: 'The pads centre the caliper on the rotor when the lever is pressed.',
        points: ['Squeeze the brake lever firmly and keep holding it.', 'Do not let go until the bolts are tight.'],
      },
      {
        title: '3. Tighten to 6 Nm',
        body: 'Tighten the bolts alternately, a little at a time, while the lever is held.',
        points: ['Tighten both bolts to 6 Nm with a torque wrench.', 'Check the value printed on the caliper or in its manual.', 'Release the lever and spin the wheel.'],
        warning: 'Do not overtighten the bolts: a stripped thread is an expensive repair.',
      },
      {
        title: '4. Straighten a local bend',
        body: 'If one spot still rubs, the rotor is bent there.',
        points: ['Find the spot by spinning the wheel slowly and watching the gap.', 'Fit the rotor truing fork over the rotor at the bend and bend it back very gently.', 'Spin the wheel again and repeat in small moves.', 'If it will not run true, replace the rotor.'],
        warning: 'Wipe the rotor with isopropyl alcohol of 99 % purity afterwards. Never use WD-40 or GT-85 near the brakes.',
      },
    ],
  },
};
