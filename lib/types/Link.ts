import {Collection} from "./Collection";
import {User} from "./User";

type Annotation = {
  created_at: string;
  id: string;
  selected_text: string;
  annotation_comments: {
    comment: string;
    id: string;
    author: {
      email: string;
      id: string;
      image_url: string;
      name: string;
    };
  }[];
  author: {
    email: string;
    id: string;
    image_url: string;
    name: string;
  };
};

type UserRepository = {
  id: string;
  name: string;
  repository_type: string;
};

export type Link = {
  id: string;
  target_url: string;
  description: string;
  title: string;
  image_url: string;
  latitude: number | null;
  longitude: number | null;
  created_at: Date;
  favicon_url: string;
  notes: string;
  tags: string[];
  views: string;
  stacks: string[];
  broken: boolean;
  sharing_preference: string[];
  annotations?: Annotation[];
  user: User;
  is_user_page: boolean;
  user_page: {
    id: string;
  }
  is_quick_note: boolean;
  is_voice_note: boolean;
  collections: Collection[];
  user_repositories: UserRepository[];
  link_content?: string;
};
