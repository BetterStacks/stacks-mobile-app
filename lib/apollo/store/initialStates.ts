import {User} from "@/lib/types/User";

export const UserInfoInitialState: User = {
  name: "",
  identities: [],
  unique_identity_id: "",
  id: "",
  email: "",
  profile_image_url: "",
  provider: "",
  token: "",
  phone: "",
  companion_share_link: "",
  confirmation_token: "",
  is_notification_enabled: false,
  unconfirmed_email: "",
  spouse: {
    id: "",
  },
};
export const BottomEdgeDisabledInitialState = false;
export const UserTokenInitialState = "";
export const IsNewLinkModalShownInitialState = {
  isShown: false,
  linkText: "",
  isShared: false,
};
export const IsDeleteAccountModalShownInitialState = {
  isShown: false,
  linkText: "",
  isShared: false,
};
export const DeleteModalInfoInitialState = {
  isVisible: false,
  linkId: "",
};
export const AddNotesModalInfoInitialState = {
  isVisible: false,
  linkId: "",
  notes: "",
  linkTitle: "",
};

export const CollectionsModalInitialState = {
  isVisible: false,
  linkId: "",
  collectionsList: [],
};
export const ShareModalInitialState = {
  isVisible: false,
  linkId: "",
};

export const SuccessModalInitialState = {
  isVisible: false,
};

export const ReminderModalInitialState = {
  isVisible: false,
  linkId: "",
};

export const GooglePhotoUrlInitialState = null;

export const SharedLinkTextInitialState = null;
export const NeedRefreshInitialState = false;
