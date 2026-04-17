export interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    description: string | null;
    status: { name: string };
    issuetype: {
      name: string;
      iconUrl: string;
    };
    priority?: {
      name: string;
      iconUrl?: string;
    };
    duedate: string | null;
  };
}

export interface JiraSearchResponse {
  issues: JiraIssue[];
  filterName?: string;
  nextPageToken?: string;
  isLast?: boolean;
}

export interface JiraFilterResponse {
  name?: string;
  jql: string;
}
