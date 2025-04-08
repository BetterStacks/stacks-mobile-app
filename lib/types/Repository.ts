export type RepositoryMember = {
  id: string;
  name: string;
  is_invite_pending: boolean;
  profile_image_url: string;
  email: string;
  phone: string;
};

export interface Repository {
  user: {
    id: string;
  };
  id: string;
  name: string;
  repository_type: string;
  repository_member_limit: number;
  members: RepositoryMember[];
}
