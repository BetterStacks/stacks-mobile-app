import React, { useState } from 'react';
import { Image, StyleSheet, Dimensions, View, FlatList, TouchableOpacity } from 'react-native';
import { Text as ThemedText } from 'react-native';
import { Text as ThemedView } from 'react-native';

const { width } = Dimensions.get('window');

type SlideItem = {
  id: string;
  image: any;
  title: string;
  description: string;
};

const slides: SlideItem[] = [
  {
    id: '1',
    image: require('@/assets/images/slide1.png'),
    title: 'Welcome to MyApp',
    description: 'A powerful app with amazing features that will help you be more productive.',
  },
  {
    id: '2',
    image: require('@/assets/images/slide2.png'),
    title: 'Manage Your Tasks',
    description: 'Stay organized with our intuitive task management system.',
  },
  {
    id: '3',
    image: require('@/assets/images/slide3.png'),
    title: 'Connect with Others',
    description: 'Collaborate with friends and colleagues seamlessly.',
  },
];

export const OnboardingSlides = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const renderItem = ({ item }: { item: SlideItem }) => (
    <View style={styles.slideContainer}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <ThemedView style={styles.textContainer}>
        <ThemedText style={styles.title}>{item.title}</ThemedText>
        <ThemedText style={styles.description}>{item.description}</ThemedText>
      </ThemedView>
    </View>
  );

  const goToNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const goToPrevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(slides.length - 1);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.slidesContainer}>
        <TouchableOpacity style={styles.navButton} onPress={goToPrevSlide}>
          <ThemedText style={styles.navButtonText}>←</ThemedText>
        </TouchableOpacity>
        
        <Image 
          source={slides[currentIndex].image} 
          style={styles.image} 
          resizeMode="contain" 
        />
        
        <TouchableOpacity style={styles.navButton} onPress={goToNextSlide}>
          <ThemedText style={styles.navButtonText}>→</ThemedText>
        </TouchableOpacity>
      </View>
      
      <ThemedView style={styles.textContainer}>
        <ThemedText style={styles.title}>
          {slides[currentIndex].title}
        </ThemedText>
        <ThemedText style={styles.description}>
          {slides[currentIndex].description}
        </ThemedText>
      </ThemedView>
      
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => setCurrentIndex(index)}
            style={[
              styles.dot,
              { backgroundColor: index === currentIndex ? '#2196F3' : '#CCCCCC' },
            ]}
          />
        ))}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slidesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  slideContainer: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
  },
  textContainer: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  }
}); 