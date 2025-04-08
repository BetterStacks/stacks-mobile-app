import { Identity } from "./Identity";

export type User = {
  name: string;
  id: string;
  email: string;
  profile_image_url: string | null;
  provider: string;
  phone: string;
  token: string;
  companion_share_link: string | null;
  unconfirmed_email: string;
  is_notification_enabled: boolean;
  confirmation_token: string;
  identities: Identity[];
  unique_identity_id: string;
  spouse: {
    id: string;
  };
};
