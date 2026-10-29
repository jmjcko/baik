import type { Translations } from '../types';

export const wheels: Translations['wheels'] = {
  title: 'Wheels and tyres',
  intro: 'The tyres are all that connects you to the road. Keep the sealant fresh, the pressure right and know what to do about a flat.',
  back: 'Back to wheels and tyres',
  setup: { label: 'Tyre system', tube: 'Inner tubes', tubeless: 'Tubeless' },
  sealant: {
    title: 'Tubeless sealant',
    dateLabel: 'Sealant topped up on',
    hint: 'Sealant dries into rubber balls over time. Top it up every 3 to 6 months.',
    unknown: 'Enter the day the sealant was last topped up, so that the 3 to 6 months can be counted.',
    fresh: 'The sealant is younger than 3 months. Nothing to do yet.',
    topUp: 'The sealant is 3 to 6 months old: top it up now. The flat repair guide shows how.',
    overdue: 'The sealant is older than 6 months. Top it up at once and check that it has not dried into balls.',
    off: 'Tyres with inner tubes need no sealant.',
    window: 'Top-up window: {from} to {until}',
  },
  pressure: {
    title: 'Tyre pressure',
    intro: 'A guide for your kind of bike and your weight. The limits printed on the tyre and on the rim always win.',
    reference: 'Reference tyre: {tyre}',
    categories: { road: 'road, 28 mm', gravel: 'gravel, 40 mm', mtb: 'mountain bike, 2.4"' },
    range: 'Usual range: {min} to {max} bar',
    yours: 'For {kg} kg: about {bar} bar',
    weightNote: 'The weight comes from your profile. Heavier riders go towards the top of the range, lighter ones towards the bottom.',
    otherWidth: 'For another width, start from the pressure on the sidewall or in the maker\'s table. A wider tyre takes less pressure.',
  },
  wear: {
    title: 'Wear and damage',
    intro: 'Look at both tyres and both rims. Anything below means the part has to be replaced.',
    items: [
      { title: 'Tread', body: 'Look for the tread wear indicators (TWI), the small marks in the tread. When the tread is worn down to them, replace the tyre. Remove embedded flints and glass.' },
      { title: 'Casing and sidewall', body: 'Cracks in the sidewall, cuts down to the casing, bulges or visible threads mean the tyre must be replaced.' },
      { title: 'Rim wear', body: 'On rim brakes, look at the wear indicator groove on the rim wall. If the rim wall feels concave (hollowed), replace the rim at once.' },
      { title: 'Rim tape', body: 'The tape must be centred, flat, whole and cover every spoke hole. The flat repair guide shows how to check it.' },
    ],
  },
  flat: {
    title: 'Flat repair guide',
    intro: 'Five jobs for a puncture, from the roadside to the workshop.',
    open: 'Open the flat repair guide',
    openHint: 'Replace or patch a tube, plug a tubeless tyre, top up the sealant, check the rim tape.',
    pick: 'What do you want to do?',
    backToList: 'Back to the list of jobs',
    scenarios: {
      tube: {
        name: 'Replace the inner tube',
        summary: 'The sure fix on the road: a new tube.',
        diagramLabel: 'Cross-section of a tyre on a rim with the inner tube, the valve and the tyre lever',
        steps: [
          { title: '1. Find the cause', body: 'A new tube goes flat again if the cause is still in the tyre.', points: ['Take the wheel out and let the rest of the air out.', 'Run your fingers carefully along the inside of the tyre and feel for a thorn, glass or wire.', 'Look where the hole in the tube is and check the same place on the tyre.'], warning: 'Run your fingers slowly: glass cuts.' },
          { title: '2. Take the tyre and the tube off', body: 'Make slack first, then lever the bead over the rim.', points: ['Push the bead into the centre channel of the rim all the way round.', 'Hook a tyre lever under the bead and work around the rim. A second lever helps.', 'Pull the tube out and take the valve out of its hole.'] },
          { title: '3. Check the tyre and the rim tape', body: 'Look before you put anything back.', points: ['Check the inside of the tyre again for anything sharp.', 'The rim tape covers every spoke hole and sits in the middle of the rim.', 'If the tyre has a cut down to the casing, replace the tyre.'] },
          { title: '4. Fit the new tube', body: 'Take care that the tube is not caught under the bead.', points: ['Inflate the new tube just enough to give it shape.', 'Put the valve through the hole and press the bead back on by hand, starting at the valve.', 'Make sure the tube is not caught under the bead, then inflate to the pressure from the card.', 'Check that the tyre sits evenly on the rim on both sides.'], warning: 'Do not use tyre levers for the last part of the bead: you may pinch the tube.' },
        ],
      },
      patch: {
        name: 'Patch the inner tube',
        summary: 'Mend a small hole in a tube.',
        diagramLabel: 'An inner tube with a hole and a patch pressed on it',
        steps: [
          { title: '1. Find the hole', body: 'You cannot mend what you cannot find.', points: ['Inflate the tube and hold it close to your ear, or dip it in water, to find the leak.', 'Mark the spot and let the air out.', 'Find what made the hole in the tyre (see the first step of the tube change).'] },
          { title: '2. Prepare the tube', body: 'The patch only sticks on a clean, roughened, dry surface.', points: ['Roughen the tube around the hole with the sandpaper from the kit.', 'Wipe the dust away.', 'Spread a thin layer of glue a little wider than the patch.', 'Wait until the glue is dry to the touch.'], warning: 'A patch will not stick on wet glue or on a dusty tube.' },
          { title: '3. Press on the patch', body: 'Do not touch the sticky side.', points: ['Peel the backing off the patch without touching the sticky side.', 'Press it firmly on the glue, starting from the middle.', 'Keep it pressed for a good while and check the edges for bubbles.'] },
          { title: '4. Put it back and test', body: 'A patched tube is a repair, not a new tube.', points: ['Inflate the tube a little and check that the patch holds.', 'Fit the tube as in the tube change and inflate to the pressure from the card.', 'Check the tyre again after a while and replace the tube soon if the patch lets go.'] },
        ],
      },
      plug: {
        name: 'Plug a tubeless tyre',
        summary: 'Close a puncture in the tread without taking the tyre off.',
        diagramLabel: 'Cross-section of a tubeless tyre with sealant and a plug through the tread',
        steps: [
          { title: '1. Find the hole', body: 'Often the sealant closes a small hole by itself.', points: ['Turn the wheel so that the hole is at the bottom, where the sealant is, and give it a moment.', 'If air still leaks, spray soapy water on the tyre to find the hole.', 'Pull out the thorn or glass with pliers.'], warning: 'A plug is only for a small hole in the tread. A cut in the sidewall needs a new tyre or an inner tube.' },
          { title: '2. Insert the plug', body: 'One smooth push with the insertion tool.', points: ['Thread the plug into the eye of the insertion tool.', 'Push the tool into the hole in one smooth move, leaving the ends of the plug outside.', 'Pull the tool out and leave the plug in the tyre.'] },
          { title: '3. Trim and inflate', body: 'Let the sealant do the rest.', points: ['Cut the ends of the plug off close to the tread.', 'Inflate the tyre to the pressure from the card.', 'Spin the wheel so that the sealant spreads over the plug.'] },
          { title: '4. Check', body: 'A plug must prove itself.', points: ['Spray the plug with soapy water and look for bubbles.', 'Ride carefully at first and check the pressure again.', 'If it keeps leaking, fit an inner tube and replace the tyre at home.'] },
        ],
      },
      sealant: {
        name: 'Top up the sealant',
        summary: 'For a tubeless tyre, every 3 to 6 months.',
        diagramLabel: 'Cross-section of a tubeless tyre with the sealant at the bottom and a bottle at the valve',
        steps: [
          { title: '1. Check the date', body: 'Sealant dries into rubber balls and then it seals nothing.', points: ['Look at the date on the wheels and tyres card: top up every 3 to 6 months.', 'Shake the bottle of sealant well.', 'Use the amount on the bottle for your tyre size.'] },
          { title: '2. Let the air out', body: 'The valve has to be at the top.', points: ['Turn the wheel so that the valve is at the top.', 'Let all the air out and unscrew the valve core with the valve core tool.', 'If the core cannot be removed, break the bead on one side and pour the sealant in.'] },
          { title: '3. Add the sealant', body: 'Pour or squeeze it in through the valve.', points: ['Attach the bottle or the syringe to the valve.', 'Squeeze in the amount from the bottle.', 'If you see old dry balls of latex inside, pull them out.'] },
          { title: '4. Inflate and spread', body: 'The sealant has to coat the whole tyre.', points: ['Refit the valve core and inflate to the pressure from the card.', 'Turn the wheel in all directions so that the sealant coats the inside.', 'Enter today as the new date in the wheels and tyres card.'] },
        ],
      },
      tape: {
        name: 'Check the rim tape',
        summary: 'Tape that has slipped cuts tubes and lets a tubeless tyre leak.',
        diagramLabel: 'Cross-section of a rim with the rim tape and the spoke holes marked',
        steps: [
          { title: '1. Why it matters', body: 'The tape protects the tube or seals the rim.', points: ['The tape covers the spoke holes in the rim.', 'A hole in the tape lets the tube press into a spoke hole and burst, or lets air out of a tubeless tyre.'] },
          { title: '2. Look at the tape', body: 'Take the tyre and the tube off on one side.', points: ['The tape sits in the middle of the rim, lies flat and covers every spoke hole.', 'Look for tears, lifted edges and holes.', 'On a tubeless rim the tape must be airtight.'] },
          { title: '3. Fix or replace', body: 'Do not trust tape that has moved.', points: ['If the tape has slipped, press it back or replace it.', 'Clean the rim bed before you fit new tape.', 'Fit tape of a width that suits your rim.'] },
          { title: '4. Put it all back', body: 'Close the job properly.', points: ['Fit the tube or the tubeless tyre as in the other jobs.', 'Inflate and check that the tyre sits evenly.'] },
        ],
      },
    },
  },
};
