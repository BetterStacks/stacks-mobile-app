import { styles } from "@/components/dashboard/HomeScreenStyles";
import { QUERY_USER } from "@/lib/api/graphql/queries";
import { Image, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useQuery } from "@apollo/client";

export const UserAvatar = ({ imageUrl }: { imageUrl?: string | null }) => {
  const { data: userData } = useQuery(QUERY_USER);

  const profileImageUrl = userData?.user?.profile_image_url || imageUrl;

  if (profileImageUrl) {
    return (
      <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
    );
  }

  return (
    <View style={styles.avatarFallback}>
      <AntDesign name="user" size={20} color="#FFFFFF" />
    </View>
  );
};
