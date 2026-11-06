import type { Translations } from '../types';

export const upgrade: Translations['upgrade'] = {
  tiers: { high: 'Worth it first', low: 'Little return' },
  card: { title: 'Upgrades worth considering on your bike', intro: 'Calculated from the wear of your bike, your measurements and your symptoms. These are parameters, not products: the order shows what pays off first. Nothing is sold here.', empty: 'Nothing to flag for your bike right now.', range: 'Suggested range: {range}', source: 'Source: {source}' },
  prompt: { heading: 'UPGRADES THAT PAY OFF FIRST (PARAMETERS, NOT PRODUCTS)', intro: 'Calculated from the wear of the bike, the measurements and the symptoms of the rider. Weigh the products against these parameters; do not replace them with a brand preference.', hidden: 'Left out: it would reveal the body or the bike of the rider.' },
  items: {
    chainWorn: { title: 'Replace the worn chain first', body: 'The chain has reached its wear limit. Replace it before any upgrade; if you wait, the cassette and the chainrings wear out with it.' },
    padsWorn: { title: 'Check the brake pads and rotors first', body: 'The brakes have reached their check interval. Pads with less than 0.5 mm of friction material must be replaced, and a rotor must not be thinner than its marked minimum.' },
    tyreWidth: { title: 'Tyre width 28 to 32 mm', body: 'On a road bike, wider supple tyres of 28 to 32 mm at a lower pressure roll faster on real asphalt and give more grip and comfort.' },
    pressure: { title: 'Set the pressure with a model', body: 'Compute the pressure from the weight of the rider and the bike, the tyre width and the surface, and run slightly below the point where the bike starts to vibrate. It is free and saves watts.' },
    tubeless: { title: 'Tubeless or TPU tubes', body: 'Tubeless tyres or light TPU tubes instead of heavy butyl tubes save 7 to 10 W and 150 to 200 g of rotating weight, and resist punctures better. Sealant needs topping up.' },
    handlebarWidth: { title: 'Narrower handlebar', body: 'Your handlebar is wider than your shoulders. Match it to the acromion width, 1:1, rounded to 380, 400, 420 or 440 mm; between two sizes take the narrower one. It relieves the wrists and the ulnar nerve.' },
    leverAngle: { title: 'Turn the levers inward 8 to 15 degrees', body: 'Turning the levers slightly inward keeps the wrists straight, which helps with numb hands and neck and shoulder strain.' },
    leverReach: { title: 'Adjust the lever reach', body: 'If your fingers have to stretch to the brake lever, set the lever closer to the bar with the reach adjustment, so you can brake with a relaxed hand.' },
    archInsoles: { title: 'Anatomical insoles with arch support', body: 'Insoles with arch support keep the foot and the knee in line and remove hot spots under the foot. Useful for knee pain in the pedal stroke.' },
    anatomicalSaddle: { title: 'Saddle with a cutout and the right width', body: 'A saddle with a cutout that fits the width of your sit bones takes pressure off soft tissue and helps with saddle sores and an aching lower back.' },
    crankLength: { title: 'Shorter cranks, 160 to 165 mm', body: 'A crank of 172.5 mm or longer can be too long for the rider and close the hip angle at the top of the stroke. Shorter cranks of 160 to 165 mm help; raise the saddle by the same difference.' },
    ceramic: { title: 'Ceramic bearings: low return', body: 'They save well under 1 W in total and need cleaning more often. Spend on tyres and fit first.' },
    ospw: { title: 'Oversized pulley wheels: low return', body: 'They save about 1 W and only in extreme cross-chain gears, and they can add shifting flex. Not worth it for most riders.' },
    electronicMisfit: { title: 'Electronic shifting does not fix a bad fit', body: 'While you have pain from the position, crisper shifting saves no watts: an ill-fitting frame or setup limits the power by far more. Fix the fit first.' },
    deepWheels: { title: 'Very deep wheels for a beginner: low return', body: 'Rims of 65 mm and more are vulnerable to crosswind, which makes less experienced riders brake and feel unstable on descents.' },
  },
};
