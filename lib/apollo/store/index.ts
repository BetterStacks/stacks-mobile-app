import { makeVar } from "@apollo/client";
import {
  BottomEdgeDisabledInitialState,
  AddNotesModalInfoInitialState,
  IsNewLinkModalShownInitialState,
  IsDeleteAccountModalShownInitialState,
  UserInfoInitialState,
  DeleteModalInfoInitialState,
  CollectionsModalInitialState,
  ShareModalInitialState,
  SuccessModalInitialState,
  UserTokenInitialState,
  ReminderModalInitialState,
  GooglePhotoUrlInitialState,
  SharedLinkTextInitialState,
  NeedRefreshInitialState,
} from "./initialStates";
import { SuccessModalMessage } from "./types";

export const userTokenVar = makeVar(UserTokenInitialState);
export const userInfoVar = makeVar(UserInfoInitialState);
export const bottomEdgeDisabledVar = makeVar(BottomEdgeDisabledInitialState);
export const isNewLinkModalShownVar = makeVar(IsNewLinkModalShownInitialState);
export const isDeleteAccountModalShownVar = makeVar(IsDeleteAccountModalShownInitialState);
export const addNotesModalInfo = makeVar(AddNotesModalInfoInitialState);
export const deleteModalInfoVar = makeVar(DeleteModalInfoInitialState);
export const collectionsModalInfoVar = makeVar(CollectionsModalInitialState);
export const shareModalInfoVar = makeVar(ShareModalInitialState);
export const isSuccessModalVisibleVar = makeVar<boolean>(false);
export const successModalMessageVar = makeVar<SuccessModalMessage>(null);
export const isReminderModalVisibleVar = makeVar(ReminderModalInitialState);
export const googlePhotoUrl = makeVar<null | string>(
  GooglePhotoUrlInitialState,
);
export const sharedLinkTextVar = makeVar<null | string>(
  SharedLinkTextInitialState,
);
export const isNeedRefreshVar = makeVar<boolean>(NeedRefreshInitialState);
