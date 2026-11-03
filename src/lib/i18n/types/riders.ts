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
  /** The label of the rider on a bike card, and of the bikes on a rider card. */
  bikesLabel: string;
  /** The way the first bike of a new rider is chosen. */
  bikeModeLabel: string;
  bikeModeExisting: string;
  bikeModeNew: string;
  chooseBike: string;
  chooseBikePlaceholder: string;
  /** An entry of the list of bikes: "{bike}, now: {rider}". */
  bikeNow: string;
  /** The rider who would be left without a bike: "{name} will have no bike. ..." */
  leavesWithout: string;
  /** The drop-down on a bike of a rider, and on the rider card. */
  giveToRider: string;
  moreActions: string;
  newBike: string;
  addBikeAction: string;
  /** The words next to the status of a rider with no bike. */
  noBikeStatus: string;
  /** The quiet "more actions" heading is not used; this names the group of dangerous actions for screen readers. */
  dangerZone: string;
  /** The bar over the fitting screens and the two questions that protect the settings of a bike (Epic 44). */
  fittingBar: string;
  fittingBarChange: string;
  gateTitle: string;
  gateBodySolo: string;
  gateBodyRider: string;
  gateContinue: string;
  gateSwitch: string;
  gateCancel: string;
  kindTitle: string;
  kindBody: string;
  kindConfirm: string;
  kindCancel: string;
}
