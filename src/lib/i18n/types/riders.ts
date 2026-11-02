/** The riders of the account (Epic 43): the people whose bikes the rider keeps in one account. */
export interface RidersTexts {
  /** The name of the first rider, who has none of their own. */
  me: string;
  title: string;
  intro: string;
  active: string;
  makeActive: string;
  rename: string;
  remove: string;
  confirmRemove: string;
  cancel: string;
  save: string;
  nameLabel: string;
  namePlaceholder: string;
  nameInvalid: string;
  bikeNameLabel: string;
  bikeNamePlaceholder: string;
  add: string;
  create: string;
  full: string;
  failed: string;
  /** The bikes of a rider: "Bikes: {list}". */
  bikesOf: string;
  noBikes: string;
  /** Said where the rider cannot be removed or switched to. */
  lastRider: string;
  noBikeHint: string;
  takeoverLabel: string;
  addHint: string;
  /** A note about the body data of another person. */
  consent: string;
  /** The label of the rider of a bike (a drop-down on the bike card). */
  riderOfBike: string;
  /** The rider switch of the sidebar. */
  switchLabel: string;
  /** The line over the wizard, the report and the studio: whose numbers they are. */
  forLine: string;
  /** The export of the profile page: which riders go into the file. */
  exportPick: string;
  exportNone: string;
}
