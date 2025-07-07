export interface UserAuthPayload {
  id: string;
  email: string;
  name?: string;
  groups?: string[];
}
