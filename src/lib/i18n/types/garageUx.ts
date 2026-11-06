/** The words of the "Edit bike" dialog (Epic 54). */
export interface BikeEditTexts {
  button: string;
  rowAction: string;
  rowActionFor: string;
  title: string;
  intro: string;
  basics: string;
  identity: string;
  save: string;
  cancel: string;
  failed: string;
  setupTitle: string;
  setupHint: string;
  setupButton: string;
}

/** The words of the Connections tab of the garage (Epic 54): the state of each service and the pointer from the Wear tab. */
export interface ConnectionsTexts {
  title: string;
  intro: string;
  summary: string;
  summaryNone: string;
  states: { checking: string; guest: string; unavailable: string; disconnected: string; connected: string; paired: string; keySaved: string };
  pointer: string;
  pointerButton: string;
}
