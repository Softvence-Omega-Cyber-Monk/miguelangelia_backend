type TWorkspace = {
  id: string;
  name: string;
};

type TPowerBiToken = {
  userId: string;
  access_token: string;
  refresh_token: string;
  workspaces: TWorkspace[]; // properly typed instead of object[]
  expires_in: number; // absolute timestamp in milliseconds
};
export { TWorkspace, TPowerBiToken };