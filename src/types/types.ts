


export type MOAStatus =
  | 'APPROVED: Signed by President'
  | 'APPROVED: On-going notarization'
  | 'APPROVED: No notarization needed'
  | 'PROCESSING: Awaiting signature of the MOA draft by HTE partner'
  | 'PROCESSING: MOA draft sent to Legal Office for Review'
  | 'PROCESSING: MOA draft and opinion of legal office sent to VPAA/OP for approval'
  | 'EXPIRED: No renewal done'
  | 'EXPIRING: Two months before expiration';

  export type IndustryType =
  | 'Telecom'
  | 'Food'
  | 'Services'
  | 'Technology'
  | 'Finance'
  | 'Healthcare'
  | 'Education'
  | 'Manufacturing'
  | 'Retail'
  | 'Construction'
  | 'Other';

  export type College =
  | 'COA'
  | 'CAS'
  | 'CBA'
  | 'CC'
  | 'CICS'
  | 'CCrim'
  | 'CEd'
  | 'CEA'
  | 'CMedtech'
  | 'CMidw'
  | 'CMus'
  |  'CN'
  |  'CPT';
