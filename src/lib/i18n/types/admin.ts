/** Texts of the catalog admin page (English primary, Czech secondary): the queue of shared bikes, the owner's upload and the catalog. */
export interface AdminTexts {
  navLabel: string;
  title: string;
  subtitle: string;
  checking: string;
  denied: string;
  loadError: string;
  reload: string;
  tabs: { queue: string; upload: string; catalog: string };
  queue: {
    title: string;
    empty: string;
    group: string;
    agreeing: string;
    submittedBy: string;
    anonymous: string;
    duplicatesTitle: string;
    noDuplicates: string;
    merge: string;
    approve: string;
    reject: string;
    noteLabel: string;
    rejectNoteLabel: string;
    working: string;
    failed: string;
  };
  duplicate: { sameKey: string; similarName: string; sameNumbers: string; inSeed: string; inCatalog: string };
  upload: {
    title: string;
    hint: string;
    dropTitle: string;
    dropOr: string;
    dropChoose: string;
    dropHint: string;
    removeFile: string;
    nameLabel: string;
    namePlaceholder: string;
    read: string;
    reading: string;
    checkTitle: string;
    checkHint: string;
    sizesFound: string;
    skipped: string;
    columns: { size: string; stack: string; reach: string; seatAngle: string; stem: string; handlebar: string; crank: string; status: string };
    include: string;
    statusNew: string;
    statusReplaces: string;
    statusSeed: string;
    notStated: string;
    invalid: string;
    noteLabel: string;
    save: string;
    saved: string;
    partlySaved: string;
    discard: string;
    errors: { forbidden: string; invalid_input: string; not_configured: string; rate_limited: string; unavailable: string; unreadable: string };
  };
  catalog: {
    title: string;
    empty: string;
    ownerBadge: string;
    communityBadge: string;
    delete: string;
    confirmDelete: string;
    cancel: string;
  };
}
