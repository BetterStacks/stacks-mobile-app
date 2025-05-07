import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';
import Card from '@/components/recall/Card';
import {SystemBars} from 'react-native-edge-to-edge';
import {useQuery} from "@apollo/client";
import {QUERY_RECALL_LINKS} from "@/lib/api/graphql/queries";
import {Link} from '@/lib/types/Link';

export default function RecallScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const animatedValue = useSharedValue(0);
    const MAX = 5;

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

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <SafeAreaView style={styles.container}>
                {/* If you're not using react-native-edge-to-edge, you can remove SystemBars */}
                <SystemBars style={'light'} />
                <View style={styles.cardContainer}>
                    {linksData.map((item: Link, index: number) => {
                        if (index > currentIndex + MAX || index < currentIndex) {
                            return null;
                        }
                        return (
                            <Card
                                newData={linksData}
                                setNewData={() => {}} 
                                maxVisibleItems={MAX}
                                item={item}
                                index={index}
                                dataLength={linksData.length}
                                animatedValue={animatedValue}
                                currentIndex={currentIndex}
                                setCurrentIndex={setCurrentIndex}
                                key={index}
                            />
                        );
                    })}
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111111',
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
