import type { ConsentTexts } from '../types/consent';

export const consent: ConsentTexts = {
  purposes: {
    health_storage: {
      title: 'Store my data in my account',
      body: 'bAIk stores your measurements and the symptoms you report (health data) in your account, so that you can use them on every device. Only you can see them.',
      data: ['Body measurements and weight', 'Symptoms you report', 'Your bikes and riding style', 'Service books of your bikes: service log, rides, reminders (not the frame number, the insurance number or the photo)'],
    },
    ai_processing: {
      title: 'Let the AI service use my data',
      body: 'Some functions send your data to an AI service (Google Gemini) to write an explanation. The rules of the app always run; the AI only adds the explanation.',
      data: ['Height, inseam, torso, arm and shoulder width, weight', 'Flexibility, riding style and the symptoms you report', 'The bike you are checking and its geometry, or your answers in the bike finder', 'Not sent: your name, e-mail, location or rides'],
    },
    strava: {
      title: 'Connect Strava',
      body: 'bAIk reads the summaries of your rides from Strava to fill in the wear of your bike. Your Strava login is stored encrypted in your account and you can disconnect at any time.',
      data: ['Strava profile id', 'Summaries of rides: date, distance, climb, bike', 'No route, map or heart rate is stored'],
    },
    intervals: {
      title: 'Connect Intervals.icu',
      body: 'bAIk reads the summaries of your rides from Intervals.icu to fill in the wear of your bike. When you are signed in, your key is stored encrypted in your account so the rides load on every device (and later without the app open); without an account it stays in this browser. You can delete it at any time.',
      data: ['Your Intervals.icu key (encrypted in your account when you are signed in, otherwise only in this browser)', 'Summaries of rides: date, distance, climb, bike'],
    },
    analytics: {
      title: 'Help improve bAIk with usage statistics',
      body: 'Optional. Counts which steps are used so that unused or confusing steps can be fixed. Nothing is measured at the moment; this switch will apply when it is.',
      data: ['Which steps of the app you open', 'No measurements, no symptoms'],
    },
  },
  prompt: {
    dataTitle: 'What this covers',
    allow: 'I agree',
    decline: 'Not now',
    privacyLink: 'Read how your data is used',
    needed: 'This function needs your agreement. You can give it here or later in your profile.',
  },
  audit: {
    title: 'Use the AI service for this check?',
    allow: 'Agree and use AI',
    decline: 'Check with rules only',
    declinedNote: 'This check used the rules of the app only. You can agree to the AI explanation in your profile at any time.',
  },
  finder: { title: 'Use the AI service to suggest bikes?' },
  section: {
    title: 'Consents',
    intro: 'You decide what bAIk may do with your data. You can change every decision here at any time; withdrawing is as easy as agreeing.',
    stateGranted: 'Agreed',
    stateDeclined: 'Not agreed',
    stateUnknown: 'Not asked yet',
    give: 'Agree',
    withdraw: 'Withdraw',
    withdrawHealthNote: 'New changes are no longer saved to your account. What is already stored stays there until you delete it in "Your data rights" below.',
    privacyLink: 'Privacy',
  },
  privacy: {
    title: 'Privacy',
    subtitle: 'What bAIk does with your data, in plain words.',
    draftNote: 'Draft text for a legal review. It describes how the app works today; it is not legal advice.',
    updated: 'Version 1, 9 November 2026',
    back: 'Back to the app',
    controllerHeading: 'Who is responsible',
    controllerLine: 'The controller of your data is {name}.',
    contactLine: 'Contact for questions and requests: {contact}',
    contactMissing: 'Contact for questions and requests: to be filled in before the public launch.',
    sections: [
      {
        heading: 'Without an account',
        paragraphs: ['If you do not sign in, your measurements, bikes and rides stay in this browser. bAIk does not receive them. Clearing the data of this site removes them.'],
      },
      {
        heading: 'With an account',
        paragraphs: [
          'If you sign in, bAIk stores your measurements and the symptoms you report in your account, so you can use them on every device. Symptoms are health data, therefore bAIk asks for your explicit consent first (GDPR, Articles 6(1)(a) and 9(2)(a)). Only you can read your rows; this is enforced by the database.',
          'The service book of each bike (service log, rides, reminders) is stored in the account too, so it shows on every device. The frame number, the insurance number and the photo of a bike never leave this browser.',
          'You can withdraw the consent at any time in your profile. You can also download everything that is stored, delete the stored data, or delete the account with everything in it.',
        ],
      },
      {
        heading: 'AI service',
        paragraphs: [
          'Two functions (the pre-purchase check and the bike finder) can send your measurements, weight, flexibility, riding style and reported symptoms to Google Gemini, so that it can write an explanation. This happens only after your consent. Your name, e-mail, location and rides are not sent. bAIk does not store or log what is sent; Google handles it under its own terms for the Gemini API.',
          'The pre-purchase check also works without the AI service: the rules of the app then produce the result on their own.',
        ],
      },
      {
        heading: 'Strava and Intervals.icu',
        paragraphs: [
          'If you connect them, bAIk reads summaries of your rides (date, distance, climb, bike) to fill in the wear of your bike. The Strava login and, when you are signed in, the Intervals.icu key are stored encrypted in your account (only the server of the app can read them). Without an account the Intervals.icu key stays in this browser. Disconnect at any time and the key is deleted.',
        ],
      },
      {
        heading: 'Usage statistics',
        paragraphs: ['bAIk does not measure your use at the moment. If it does in the future, it will be optional and off until you agree.'],
      },
      {
        heading: 'Who else handles data',
        paragraphs: ['The provider of the database and sign in, the provider that hosts the app, Google (AI service, sign in with Google) and Strava or Intervals.icu if you connect them.'],
      },
      {
        heading: 'How long',
        paragraphs: ['Until you delete it. Deleting your account removes your stored data, your connections and the record of your consents.'],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'You can ask for access, correction, deletion, restriction and portability, and object to processing. Most of this you can do yourself in your profile. You can also complain to the Czech Office for Personal Data Protection (uoou.gov.cz).',
        ],
      },
      {
        heading: 'Not medical advice',
        paragraphs: ['bAIk gives general information about the setup of a bike. It does not diagnose or treat. If you have pain or numbness that does not go away, talk to a doctor or physiotherapist.'],
      },
    ],
  },
};
