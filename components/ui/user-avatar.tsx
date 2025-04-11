import { styles } from "@/components/dashboard/HomeScreenStyles";
import { QUERY_USER } from "@/lib/api/graphql/queries";
import { Image, View, TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useQuery } from "@apollo/client";
import { useRouter } from "expo-router";

export const UserAvatar = ({ imageUrl, onPress }: { imageUrl?: string | null, onPress?: () => void }) => {
  const { data: userData } = useQuery(QUERY_USER);
  const router = useRouter();
  
  const profileImageUrl = userData?.user?.profile_image_url || imageUrl;
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/dashboard/profile');
    }
  };

  if (profileImageUrl) {
    return (
      <TouchableOpacity onPress={handlePress}>
        <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.avatarFallback}>
        <AntDesign name="user" size={20} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
};
