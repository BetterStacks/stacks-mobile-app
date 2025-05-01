import {Tabs} from "expo-router";
import React from "react";

import {HapticTab} from "@/components/HapticTab";
import {IconSymbol} from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import {Colors as colors} from "@/components/design/colors";
import {useColorScheme} from "@/hooks/useColorScheme";

export default function DashboardLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: colors.TextColor.LignMainColor,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				tabBarLabelStyle: {
					fontSize: 14,
				},
				tabBarStyle: {
					height: 85,
					paddingTop: 15,
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
				name="ai"
				options={{
					title: "Stacks AI",
					tabBarIcon: ({ color }) => (
						<IconSymbol name="sparkles" color={color} />
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
				name="collections"
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
