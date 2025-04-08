import { User } from "./User";

export type UserInfo = {
  __typename: string;
  token: string;
  user: User;
};
