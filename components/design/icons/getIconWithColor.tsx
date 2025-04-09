import { SvgProps } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

import ArrowIcon from "@/assets/svg/ArrowIcon.svg";
import EyeOnIcon from "@/assets/svg/EyeOnIcon.svg";
import Line from "@/assets/svg/Line.svg";
import ProfileIcon from "@/assets/svg/ProfileIcon.svg";
import InboxIcon from "@/assets/svg/InboxIcon.svg";
import CollectionsActive from "@/assets/svg/CollectionsActive.svg";
import HomeActive from "@/assets/svg/HomeActive.svg";
import InboxActive from "@/assets/svg/InboxActive.svg";
import SearchIcon from "@/assets/svg/SearchIcon.svg";
import PlusIcon from "@/assets/svg/PlusIcon.svg";
import ClockIcon from "@/assets/svg/ClockIcon.svg";
import Browser from "@/assets/svg/Browser.svg";
import AllLinksIcon from "@/assets/svg/AllLinksIcon.svg";
import ArticlesIcon from "@/assets/svg/ArticlesIcon.svg";
import PlacesIcon from "@/assets/svg/PlacesIcon.svg";
import ProductsIcon from "@/assets/svg/ProductsIcon.svg";
import JobsIcon from "@/assets/svg/JobsIcon.svg";
import DocumentsIcon from "@/assets/svg/DocumentsIcon.svg";
import BooksIcon from "@/assets/svg/BooksIcon.svg";
import MediaIcon from "@/assets/svg/MediaIcon.svg";
import ProfilesIcon from "@/assets/svg/ProfilesIcon.svg";
import StocksIcon from "@/assets/svg/StocksIcon.svg";
import OthersIcon from "@/assets/svg/OthersIcon.svg";
import GridType from "@/assets/svg/GridType.svg";
import ListType from "@/assets/svg/ListType.svg";
import Filters from "@/assets/svg/Filters.svg";
import LinkChainIcon from "@/assets/svg/LinkChainIcon.svg";
import Details from "@/assets/svg/Details.svg";
import RemindCardIcon from "@/assets/svg/RemindCardIcon.svg";
import RepositoryCardIcon from "@/assets/svg/RepositoryCardIcon.svg";
import EditCardIcon from "@/assets/svg/EditCardIcon.svg";
import CollectionsCardIcon from "@/assets/svg/CollectionsCardIcon.svg";
import DeleteCardIcon from "@/assets/svg/DeleteCardIcon.svg";
import OpenLink from "@/assets/svg/OpenLink.svg";
import SmallDivider from "@/assets/svg/SmallDivider.svg";
import CloseModal from "@/assets/svg/CloseModal.svg";
import SavedLinkIcon from "@/assets/svg/SavedLinkIcon.svg";
import AfterSaveClockIcon from "@/assets/svg/AfterSaveClockIcon.svg";
import AfterSaveShareIcon from "@/assets/svg/AfterSaveShareIcon.svg";
import SearchIconInput from "@/assets/svg/SearchIconInput.svg";
import InboxPeople from "@/assets/svg/InboxPeople.svg";
import RepoInput from "@/assets/svg/RepoInput.svg";
import WhitePlusIcon from "@/assets/svg/WhitePlusIcon.svg";
import SuccessIcon from "@/assets/svg/SuccessIcon.svg";
import GreenStar from "@/assets/svg/GreenStar.svg";
import GreyCircle from "@/assets/svg/GreyCircle.svg";
import PinkStar from "@/assets/svg/PinkStar.svg";
import VioletStar from "@/assets/svg/VioletStar.svg";
import WhiteCircle from "@/assets/svg/WhiteCircle.svg";
import WhiteStar from "@/assets/svg/WhiteStar.svg";
import ShareIcon from "@/assets/svg/ShareIcon.svg";
import SocialSettings from "@/assets/svg/SocialSettings.svg";
import AccountSettings from "@/assets/svg/AccountSettings.svg";
import RepositoriesSettings from "@/assets/svg/RepositoriesSettings.svg";
import SettingsSettings from "@/assets/svg/SettingsSettings.svg";
import PasswordSettings from "@/assets/svg/PasswordSettings.svg";
import DangerSettings from "@/assets/svg/DangerSettings.svg";
import DangerSettingsButton from "@/assets/svg/DangerSettingsButton.svg";
import FaqSettings from "@/assets/svg/FaqSettings.svg";
import RateSettings from "@/assets/svg/RateSettings.svg";
import ShevronSettings from "@/assets/svg/ShevronSettings.svg";
import EditPhotoIcon from "@/assets/svg/EditPhotoIcon.svg";
import WarningIcon from "@/assets/svg/WarningIcon.svg";
import SearchFaqIcon from "@/assets/svg/SearchFaqIcon.svg";
import ArrowRepositories from "@/assets/svg/ArrowRepositories.svg";
import AddMemberIcon from "@/assets/svg/AddMemberIcon.svg";
import TrashIcon from "@/assets/svg/TrashIcon.svg";
import ChevronLessMore from "@/assets/svg/ChevronLessMore.svg";
import Hourglass from "@/assets/svg/Hourglass.svg";
import Logout from "@/assets/svg/Logout.svg";
import PlacesSelectorIcon from "@/assets/svg/PlacesSelectorIcon.svg";

import HomeLucideIcon from "@/assets/svg/lucide/home.svg";
import CollectionsLucideIcon from "@/assets/svg/lucide/collection.svg";
import AiLucideIcon from "@/assets/svg/lucide/ai.svg";
import RecallLucideIcon from "@/assets/svg/lucide/recall.svg";
import InboxLucideIcon from "@/assets/svg/lucide/inbox.svg";
import { EIconName } from "@/components/design/icons/_models";
// import { EyeOffIcon } from "/@assets/svg/EyeOffIcon.svg";

const IconsMap: Record<EIconName | string, typeof ArrowIcon> = {
  [EIconName.Arrow]: ArrowIcon,
  // [EIconName.EyeOff]: EyeOffIcon,
  [EIconName.Line]: Line,
  [EIconName.EyeOn]: EyeOnIcon,
  // [EIconName.Home]: HomeIcon,
  [EIconName.Inbox]: InboxIcon,
  // [EIconName.Collections]: CollectionsIcon,
  [EIconName.Profile]: ProfileIcon,
  [EIconName.HomeActive]: HomeActive,
  [EIconName.CollectionsActive]: CollectionsActive,
  [EIconName.InboxActive]: InboxActive,
  [EIconName.Search]: SearchIcon,
  [EIconName.PlusIcon]: PlusIcon,
  [EIconName.ClockIcon]: ClockIcon,
  [EIconName.AllLinksIcon]: AllLinksIcon,
  [EIconName.ArticlesIcon]: ArticlesIcon,
  [EIconName.PlacesIcon]: PlacesIcon,
  [EIconName.ProductsIcon]: ProductsIcon,
  [EIconName.JobsIcon]: JobsIcon,
  [EIconName.DocumentsIcon]: DocumentsIcon,
  [EIconName.BooksIcon]: BooksIcon,
  [EIconName.MediaIcon]: MediaIcon,
  [EIconName.ProfilesIcon]: ProfilesIcon,
  [EIconName.StocksIcon]: StocksIcon,
  [EIconName.OthersIcon]: OthersIcon,
  [EIconName.GridType]: GridType,
  [EIconName.ListType]: ListType,
  [EIconName.Filters]: Filters,
  [EIconName.LinkChainIcon]: LinkChainIcon,
  [EIconName.Details]: Details,
  [EIconName.OpenLink]: OpenLink,

  [EIconName.RemindCardIcon]: RemindCardIcon,
  [EIconName.RepositoryCardIcon]: RepositoryCardIcon,
  [EIconName.EditCardIcon]: EditCardIcon,
  [EIconName.CollectionsCardIcon]: CollectionsCardIcon,
  [EIconName.DeleteCardIcon]: DeleteCardIcon,
  [EIconName.SmallDivider]: SmallDivider,
  [EIconName.CloseModal]: CloseModal,
  [EIconName.SavedLinkIcon]: SavedLinkIcon,
  [EIconName.AfterSaveClockIcon]: AfterSaveClockIcon,
  [EIconName.AfterSaveShareIcon]: AfterSaveShareIcon,
  [EIconName.SearchIconInput]: SearchIconInput,
  [EIconName.InboxPeople]: InboxPeople,
  [EIconName.RepoInput]: RepoInput,
  [EIconName.WhitePlusIcon]: WhitePlusIcon,
  [EIconName.SuccessIcon]: SuccessIcon,

  [EIconName.GreenStar]: GreenStar,
  [EIconName.GreyCircle]: GreyCircle,
  [EIconName.PinkStar]: PinkStar,
  [EIconName.VioletStar]: VioletStar,
  [EIconName.WhiteCircle]: WhiteCircle,
  [EIconName.WhiteStar]: WhiteStar,

  [EIconName.SocialSettings]: SocialSettings,
  [EIconName.AccountSettings]: AccountSettings,
  [EIconName.RepositoriesSettings]: RepositoriesSettings,
  [EIconName.SettingsSettings]: SettingsSettings,
  [EIconName.PasswordSettings]: PasswordSettings,
  [EIconName.DangerSettings]: DangerSettings,
  [EIconName.DangerSettingsButton]: DangerSettingsButton,
  [EIconName.FaqSettings]: FaqSettings,
  [EIconName.RateSettings]: RateSettings,
  [EIconName.ShevronSettings]: ShevronSettings,
  [EIconName.EditPhotoIcon]: EditPhotoIcon,
  [EIconName.WarningIcon]: WarningIcon,
  [EIconName.SearchFaqIcon]: SearchFaqIcon,
  [EIconName.ArrowRepositories]: ArrowRepositories,
  [EIconName.AddMemberIcon]: AddMemberIcon,
  [EIconName.TrashIcon]: TrashIcon,
  [EIconName.ChevronLessMore]: ChevronLessMore,
  [EIconName.Hourglass]: Hourglass,
  [EIconName.Logout]: Logout,
  [EIconName.PlacesSelectorIcon]: PlacesSelectorIcon,
  [EIconName.Browser]: Browser,
  [EIconName.ShareIcon]: ShareIcon,

  // Lucide icons
  [EIconName.Home]: HomeLucideIcon,
  [EIconName.Collections]: CollectionsLucideIcon,
  [EIconName.AiLucideIcon]: AiLucideIcon,
  [EIconName.RecallLucideIcon]: RecallLucideIcon,
  [EIconName.InboxLucideIcon]: InboxLucideIcon,
};

export const getIconWithColor = (
  iconName: EIconName,
  style?: StyleProp<ViewStyle>,
  color?: string,
  props?: SvgProps,
) => {
  const Icon = IconsMap[iconName];

  return <Icon color={color} {...props} style={style} />;
};
