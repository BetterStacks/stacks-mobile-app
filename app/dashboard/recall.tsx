import React from "react";
import {StyleSheet, Text, useColorScheme, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Bell, Brain, Clock, Sparkles} from "lucide-react-native";

export default function RecallScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <SafeAreaView style={isDark ? styles.container_dark : styles.container} edges={['top']}>
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <View style={isDark ? styles.iconBackground_dark : styles.iconBackground}>
            <Brain size={28} color={isDark ? "#8EACB7" : "#1C4A5A"} />
          </View>
        </View>
        
        <Text style={isDark ? styles.title_dark : styles.title}>Recall</Text>
        
        <View style={isDark ? styles.comingSoonBadge_dark : styles.comingSoonBadge}>
          <Sparkles size={14} color={isDark ? "#8EACB7" : "#1C4A5A"} />
          <Text style={isDark ? styles.comingSoonText_dark : styles.comingSoonText}>Coming Soon</Text>
        </View>
        
        <Text style={isDark ? styles.description_dark : styles.description}>
          Recall will help you remember and revisit your saved content at the perfect time, using AI to bring back what matters most to you.
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={isDark ? styles.featureItem_dark : styles.featureItem}>
            <Clock size={24} color={isDark ? "#8EACB7" : "#4D8BA3"} />
            <Text style={isDark ? styles.featureText_dark : styles.featureText}>Timely reminders of important content</Text>
          </View>
          
          <View style={isDark ? styles.featureItem_dark : styles.featureItem}>
            <Brain size={24} color={isDark ? "#8EACB7" : "#4D8BA3"} />
            <Text style={isDark ? styles.featureText_dark : styles.featureText}>AI-powered content suggestions</Text>
          </View>
          
          <View style={isDark ? styles.featureItem_dark : styles.featureItem}>
            <Bell size={24} color={isDark ? "#8EACB7" : "#4D8BA3"} />
            <Text style={isDark ? styles.featureText_dark : styles.featureText}>Smart notifications for saved links</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container_dark: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 30,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconBackground: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F5F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconBackground_dark: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#262626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1C4A5A',
    marginBottom: 8,
  },
  title_dark: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(77, 139, 163, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  comingSoonBadge_dark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(142, 172, 183, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  comingSoonText: {
    color: '#1C4A5A',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 6,
  },
  comingSoonText_dark: {
    color: '#8EACB7',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 6,
  },
  description: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  description_dark: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: '#A0B3BC',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureItem_dark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171717',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#262626',
  },
  featureText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  featureText_dark: {
    marginLeft: 16,
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
});
