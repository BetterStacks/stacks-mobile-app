import {
  bottomEdgeDisabledVar,
  addNotesModalInfo,
  isNewLinkModalShownVar,
  isDeleteAccountModalShownVar,
  userInfoVar,
  userTokenVar,
  deleteModalInfoVar,
  collectionsModalInfoVar,
  shareModalInfoVar,
  isSuccessModalVisibleVar,
  isReminderModalVisibleVar,
  googlePhotoUrl,
  sharedLinkTextVar,
  isNeedRefreshVar,
  successModalMessageVar,
} from ".";
import { SuccessModalMessage } from "./types";
import {Collection} from "@/lib/types/Collection";
import {User} from "@/lib/types/User";

export const setUserInfo = (user: User) => userInfoVar(user);

export const setDisabledBottomEdge = (isDisabled: boolean) =>
  bottomEdgeDisabledVar(isDisabled);

export const setUserToken = (token: string) => userTokenVar(token);

export const setIsNewLinkModalShown = (
  isShown: boolean,
  linkText: string = "",
  isShared: boolean = false,
) => {
  isNewLinkModalShownVar({ isShown, linkText, isShared });
};

export const setIsDeleteAccountModalShown = (
  isShown: boolean,
  linkText: string = "",
  isShared: boolean = false,
) => {
  isDeleteAccountModalShownVar({ isShown, linkText, isShared });
};

export const setAddNotesModalInfo = (
  isVisible: boolean,
  linkId: string,
  notes: string,
  linkTitle: string,
) => {
  addNotesModalInfo({
    isVisible,
    linkId,
    notes,
    linkTitle,
  });
};

export const setDeleteModalInfo = (isVisible: boolean, linkId: string) => {
  deleteModalInfoVar({
    isVisible,
    linkId,
  });
};

export const setCollectionModalInfo = (
  isVisible: boolean,
  linkId: string,
  collectionsList: Collection[] | null,
) => {
  collectionsModalInfoVar({
    isVisible,
    linkId, // @ts-ignore
    collectionsList,
  });
};

export const setShareModalInfo = (isVisible: boolean, linkId: string) => {
  shareModalInfoVar({
    isVisible,
    linkId,
  });
};

export const setIsSuccessModalVisible = (isVisible: boolean) => {
  isSuccessModalVisibleVar(isVisible);
};

export const setIsReminderModalVisible = (
  isVisible: boolean,
  linkId: string,
) => {
  isReminderModalVisibleVar({
    isVisible,
    linkId,
  });
};

export const setGooglePhotoUrl = (url: string) => {
  googlePhotoUrl(url);
};

export const setSharedLinkText = (url: string | null) => {
  sharedLinkTextVar(url);
};

export const setIsNeedRefresh = (isNeedRefresh: boolean) => {
  isNeedRefreshVar(isNeedRefresh);
};

export const setSuccessModalMessage = (message: SuccessModalMessage) => {
  successModalMessageVar(message);
};

export const resetSuccessModal = () => {
  setSuccessModalMessage(null);
  setIsSuccessModalVisible(false);
};
