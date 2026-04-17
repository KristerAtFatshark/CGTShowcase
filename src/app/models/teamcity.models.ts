export interface TeamCityBuild {
  id: number;
  number: string;
  status: string;
  statusText: string;
  finishDate?: string;
  buildTypeId: string;
  branchName?: string;
  defaultBranch?: boolean;
}

export interface TeamCityBuildResponse {
  build?: TeamCityBuild[];
  count?: number;
}

export interface TeamCityBuildDetails {
  id: number;
  number: string;
  status: string;
  statusText: string;
  finishDate?: string;
  buildTypeId: string;
  branchName?: string;
  defaultBranch?: boolean;
}
