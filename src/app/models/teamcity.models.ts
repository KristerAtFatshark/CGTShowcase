export interface TeamCityBuild {
  id: number;
  number: string;
  status: string;
  statusText: string;
  finishDate?: string;
  buildTypeId: string;
  branchName?: string;
  defaultBranch?: boolean;
  label?: string;
}

export interface TeamCityBuildResponse {
  build?: TeamCityBuildDetails[];
  count?: number;
}

export interface TeamCityBuildDetails {
  id: number;
  number: string;
  status: string;
  statusText: string;
  finishDate?: string;
  finishOnAgentDate?: string;
  buildTypeId: string;
  branchName?: string;
  defaultBranch?: boolean;
}
