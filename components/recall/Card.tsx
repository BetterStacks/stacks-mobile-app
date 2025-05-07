import {StyleSheet, useWindowDimensions, ViewToken} from 'react-native';
import React from 'react';
import Animated, {
	interpolate,
	runOnJS,
	SharedValue,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {Link} from '@/lib/types/Link';
import {CardLink} from '@/components/cardLink/CardLink';

type Props = {
	newData: Link[];
	setNewData: React.Dispatch<React.SetStateAction<Link[]>>;
	maxVisibleItems: number;
	item: Link;
	index: number;
	dataLength: number;
	animatedValue: SharedValue<number>;
	currentIndex: number;
	setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
};

const Card = ({
				  newData,
				  setNewData,
				  maxVisibleItems,
				  item,
				  index,
				  dataLength,
				  animatedValue,
				  currentIndex,
				  setCurrentIndex,
			  }: Props) => {
	const {width} = useWindowDimensions();
	const translateX = useSharedValue(0);
	const direction = useSharedValue(0);
	const viewableItems = useSharedValue<ViewToken[]>([{
		item,
		key: item.id.toString(),
		index,
		isViewable: true,
	}]);

	const pan = Gesture.Pan()
		.onUpdate(e => {
			// e.translationX is the distance of the swipe
			// e.translationX is positive if the swipe is to the right
			// isSwipeRight is true if the swipe is to the right
			const isSwipeRight = e.translationX > 0;

			// direction 1 is right, -1 is left
			direction.value = isSwipeRight ? 1 : -1;

			// If the current index is the same as the index of the card
			if (currentIndex === index) {
				translateX.value = e.translationX;
				animatedValue.value = interpolate(
					Math.abs(e.translationX),
					[0, width],
					[index, index + 1],
				);
			}
		})
		.onEnd(e => {
			if (currentIndex === index) {
				// If the swipe distance is greater than 150 or the swipe velocity is greater than 1000
				// go to the next card
				if (Math.abs(e.translationX) > 150 || Math.abs(e.velocityX) > 1000) {
					translateX.value = withTiming(width * direction.value, {}, () => {
						runOnJS(setCurrentIndex)(currentIndex + 1);
					});
					animatedValue.value = withTiming(currentIndex + 1);
					// If the swipe distance is less than 150 or the swipe velocity is less than 1000
					// go back to the original position
				} else {
					translateX.value = withTiming(0, {duration: 500});
					animatedValue.value = withTiming(currentIndex, {duration: 500});
				}
			}
		});

	const animatedStyle = useAnimatedStyle(() => {
		const currentItem = index === currentIndex;

		const translateY = interpolate(
			animatedValue.value,
			[index - 1, index],
			[-30, 0],
		);

		const scale = interpolate(
			animatedValue.value,
			[index - 1, index],
			[0.9, 1],
		);

		const rotateZ = interpolate(
			Math.abs(translateX.value),
			[0, width],
			[0, 20],
		);

		const opacity = interpolate(
			animatedValue.value + maxVisibleItems,
			[index, index + 1],
			[0, 1],
		);

		return {
			transform: [
				{translateY: currentItem ? 0 : translateY},
				{scale: currentItem ? 1 : scale},
				{translateX: translateX.value},
				{
					rotateZ: currentItem ? `${direction.value * rotateZ}deg` : '0deg',
				},
			],
			opacity: index < currentIndex + maxVisibleItems ? 1 : opacity,
			zIndex: dataLength - index,
		};
	});

	return (
		<GestureDetector gesture={pan}>
			<Animated.View style={[styles.container, animatedStyle]}>
				<CardLink 
					link={item} 
					viewableItems={viewableItems}
					showBorder={false}
				/>
			</Animated.View>
		</GestureDetector>
	);
};

export default Card;

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		width: 360,
		height: 'auto',
		borderRadius: 28,
	},
});