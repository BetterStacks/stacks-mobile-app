// This file is a fallback for using MaterialIcons on Android and web.

import IoniIcons from '@expo/vector-icons/Ionicons';
import {SymbolWeight} from 'expo-symbols';
import React from 'react';
import {OpaqueColorValue, StyleProp, TextStyle, ViewStyle} from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
	// See Feather icons here: https://icons.expo.fyi
	// See SF Symbols in the SF Symbols app on Mac.
	'house.fill': 'home',
	'folder.fill': 'folder',
	'search.fill': 'search',
	'aperture.fill': 'aperture',
	'notifications.fill': 'notifications',
	'person.fill': 'person',
	'chevron.left.forwardslash.chevron.right': 'code',
	'chevron.right': 'chevron-forward',
	'sparkles': 'sparkles',
} as Partial<
	Record<
		string,
		React.ComponentProps<typeof IoniIcons>['name']
	>
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
   name,
   size = 24,
   color,
   style,
}: {
	name: IconSymbolName;
	size?: number;
	color: string | OpaqueColorValue;
	style?: StyleProp<ViewStyle | TextStyle>;
	weight?: SymbolWeight;
}) {
	return <IoniIcons color={color} size={size} name={MAPPING[name]} style={style as TextStyle} />;
}
