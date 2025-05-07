import {Pressable, StyleSheet, Text, useColorScheme, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import Card from '@/components/recall/Card';
import {SystemBars} from 'react-native-edge-to-edge';
import {useQuery} from "@apollo/client";
import {QUERY_RECALL_LINKS} from "@/lib/api/graphql/queries";
import {Link} from '@/lib/types/Link';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {Colors} from "@/components/design/colors";

export default function RecallScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [currentIndex, setCurrentIndex] = useState(0);
    const [completedLinks, setCompletedLinks] = useState(0);
    const animatedValue = useSharedValue(0);
    const MAX = 5;

    // Text animation values
    const textOpacityAnim = useSharedValue(0);
    const textTranslateYAnim = useSharedValue(50);
    
    // Button animation values
    const buttonOpacityAnim = useSharedValue(0);
    const buttonTranslateYAnim = useSharedValue(50);

    const { data: recallLinks, loading: recallLinksLoading, refetch: refetchRecallLinks } = useQuery(
        QUERY_RECALL_LINKS,
        {
            variables: {
                perPage: 10,
                page: 1,
            },
            fetchPolicy: "network-only",
            nextFetchPolicy: "cache-first",
        },
    );

    const linksData: Link[] = recallLinks?.recall_links || [];
    
    const handleRefetch = async () => {
        try {
            // Reset animations
            textOpacityAnim.value = 0;
            textTranslateYAnim.value = 50;
            buttonOpacityAnim.value = 0;
            buttonTranslateYAnim.value = 50;
            
            await refetchRecallLinks();
            // Reset the current index to show the cards from the beginning
            setCurrentIndex(0);
            // Keep track of completed links for the message
            setCompletedLinks(prev => prev + linksData.length);
        } catch (error) {
            console.error("Error refetching links:", error);
        }
    };

    const noMoreCards = linksData.length > 0 && currentIndex >= linksData.length;
    
    // Start animations when there are no more cards
    useEffect(() => {
        if (noMoreCards) {
            // Text animation - shorter duration
            textOpacityAnim.value = withTiming(0.9, {
                duration: 400,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            });
            
            textTranslateYAnim.value = withTiming(0, {
                duration: 400,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            });
            
            // Button animation - longer duration
            buttonOpacityAnim.value = withTiming(1, {
                duration: 600,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            });
            
            buttonTranslateYAnim.value = withTiming(0, {
                duration: 600,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            });
        }
    }, [noMoreCards]);
    
    // Animated styles for the text
    const animatedTextStyle = useAnimatedStyle(() => {
        return {
            opacity: textOpacityAnim.value,
            transform: [{ translateY: textTranslateYAnim.value }]
        };
    });
    
    // Animated styles for the button
    const animatedButtonStyle = useAnimatedStyle(() => {
        return {
            opacity: buttonOpacityAnim.value,
            transform: [{ translateY: buttonTranslateYAnim.value }]
        };
    });

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <SafeAreaView style={isDark ? styles.container__dark : styles.container}>
                {/* If you're not using react-native-edge-to-edge, you can remove SystemBars */}
                <SystemBars style={isDark ? 'dark' : 'light'} />
                <View style={styles.header}>
                    <Text style={isDark ? styles.title__dark : styles.title}>Resurface forgotten links</Text>
                    <Text style={isDark ? styles.subtitle__dark : styles.subtitle}>Glide through a series of links, revisit the favorites, and gently let go of the rest.</Text>
                </View>

                <View style={styles.cardContainer}>
                    {noMoreCards ? (
                        <View style={styles.noCardsContainer}>
                            <Animated.Text style={[isDark ? styles.noCardsText__dark : styles.noCardsText, animatedTextStyle]}>
                                You've recalled {linksData.length + completedLinks} links
                            </Animated.Text>
                            <Animated.View style={animatedButtonStyle}>
                                <Pressable 
                                    style={isDark ? styles.refetchButton__dark : styles.refetchButton} 
                                    onPress={handleRefetch}
                                >
                                    <MaterialIcons name="refresh" size={24} color={isDark ? '#fff' : "#1a1a1a"} />
                                </Pressable>
                            </Animated.View>
                        </View>
                    ) : (
                        linksData.map((item: Link, index: number) => {
                            if (index > currentIndex + MAX || index < currentIndex) {
                                return null;
                            }
                            return (
                                <Card
                                    maxVisibleItems={MAX}
                                    item={item}
                                    index={index}
                                    dataLength={linksData.length}
                                    animatedValue={animatedValue}
                                    currentIndex={currentIndex}
                                    setCurrentIndex={setCurrentIndex}
                                    key={index}
                                    colorScheme={colorScheme}
                                />
                            );
                        })
                    )}
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    container__dark: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    header: {
        marginTop: 48
    },
    title: {
        textAlign: 'center',
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.TextColor.MainBlackColor,
        marginBottom: 8,
    },
    title__dark: {
        textAlign: 'center',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 16,
        color: Colors.TextColor.MainBlackColor,
        lineHeight: 24,
        letterSpacing: 0.25,
    },
    subtitle__dark: {
        textAlign: 'center',
        fontSize: 16,
        color: '#ffffff',
        lineHeight: 24,
        letterSpacing: 0.25,
        opacity: 0.60,
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noCardsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    noCardsText: {
        color: Colors.TextColor.MainBlackColor,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 16,
        textAlign: 'center'
    },
    noCardsText__dark: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 16,
        textAlign: 'center'
    },
    refetchButton: {
        backgroundColor: '#E5E5E5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: '#D4D4D4',
    },
    refetchButton__dark: {
        backgroundColor: '#171717',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: '#262626',
    }
});
