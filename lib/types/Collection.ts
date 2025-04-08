export type Collection = {
  cover_image_url: string | null;
  created_at: Date;
  description: string | null;
  id: string;
  emoji: string;
  links_count: number;
  title: string;
  share_preference: string;
  slug: string;
  __typename: string;
  pinned?: boolean;
  public_visible?: boolean;
  shared_link?: string;
  public_profile_collection_link?: string;
  visual_order?: number;
  parent_id?: string;
  name?: string;
  repositories?: {
    id: string;
    name: string;
    repository_member_limit: number;
    repository_type: string;
  }[];
};
