import {Tabs} from "expo-router";
import React from "react";
import {useColorScheme} from "react-native";

import {HapticTab} from "@/components/HapticTab";
import {IconSymbol} from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import {Colors as colors} from "@/components/design/colors";

export default function DashboardLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: colors.TextColor.LignMainColor,
				tabBarInactiveTintColor: isDark ? "#8F8F8F" : "#4A6572",
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarBackground: () => <TabBarBackground colorScheme={colorScheme} />,
				tabBarLabelStyle: {
					fontSize: 14,
					color: isDark ? "#FFFFFF" : undefined,
				},
				tabBarStyle: {
					height: 85,
					paddingTop: 15,
					borderTopColor: isDark ? "#262626" : undefined,
					borderTopWidth: isDark ? 0 : undefined,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => (
						<IconSymbol name="house.fill" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="collections"
				options={{
					title: "Collections",
					tabBarIcon: ({ color }) => (
						<IconSymbol name="folder.fill" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="search"
				options={{
					title: "Search",
					tabBarIcon: ({ color }) => (
						<IconSymbol name={"search.fill"} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="recall"
				options={{
					title: "Recall",
					tabBarIcon: ({ color }) => (
						<IconSymbol name="aperture.fill" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color }) => (
						<IconSymbol name="person.fill" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="collection"
				options={{
					href: null
				}}
			/>
			<Tabs.Screen
				name="pages/[id]"
				options={{
					href: null
				}}
			/>
		</Tabs>
	);
}
