import React, {useEffect, useRef, useState} from "react";
import {
	Dimensions,
	Image,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text as ThemedText,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native";
import {router} from "expo-router";
import TokenCheck from "@/components/TokenCheck";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoAdvanceTimer = useRef<NodeJS.Timeout | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const slides = [
    {
      id: "1",
      image: require("@/assets/images/slide1.png"),
      title: "All your resources at one place",
      description:
        "With Stacks, you can easily save web pages, articles, images, and videos from any device, and access them anytime, anywhere.",
    },
    {
      id: "2",
      image: require("@/assets/images/slide2.png"),
      title: "Chat with your resources",
      description:
        "Stacks helps you stay on top of your bookmarks with intelligent search, smart suggestions, and powerful filtering tools.",
    },
    {
      id: "3",
      image: require("@/assets/images/slide3.png"),
      title: "Collaborate with your team",
      description:
        "Invite your team to share bookmarks, create collections, and leave comments for easy collaboration on projects, research, and more.",
    },
  ];

  // Auto advance slides every 4 seconds
  useEffect(() => {
    startAutoAdvance();
    return () => stopAutoAdvance();
  }, [currentSlide]);

  const startAutoAdvance = () => {
    stopAutoAdvance();
    autoAdvanceTimer.current = setTimeout(() => {
      const nextIndex =
        currentSlide + 1 >= slides.length ? 0 : currentSlide + 1;

      // For auto-advance, we want to directly set the next slide without sequential restrictions
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });

      setCurrentSlide(nextIndex);
    }, 4000);
  };

  const stopAutoAdvance = () => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  };

  const goToSlide = (index: number) => {
    // For manual navigation (when user taps on dots)
    // Only allow sequential navigation (one slide at a time)
    let nextIndex = index;

    // If auto cycling to first slide OR normal sequential navigation
    if (
      (currentSlide === slides.length - 1 && index === 0) ||
      Math.abs(index - currentSlide) <= 1
    ) {
      // Allow direct navigation in these cases
      nextIndex = index;
    } else if (index > currentSlide) {
      nextIndex = currentSlide + 1;
    } else if (index < currentSlide) {
      nextIndex = currentSlide - 1;
    }

    // Handle wraparound cases
    if (nextIndex >= slides.length) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = slides.length - 1;
    }

    scrollViewRef.current?.scrollTo({
      x: nextIndex * width,
      animated: true,
    });

    setCurrentSlide(nextIndex);

    // Reset auto-advance timer whenever user manually navigates
    stopAutoAdvance();
    startAutoAdvance();
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);

    if (newIndex !== currentSlide) {
      // Only allow moving to adjacent slides
      if (Math.abs(newIndex - currentSlide) > 1) {
        // If attempting to skip slides, force sequential movement
        if (newIndex > currentSlide) {
          scrollViewRef.current?.scrollTo({
            x: (currentSlide + 1) * width,
            animated: true,
          });
          setCurrentSlide(currentSlide + 1);
        } else {
          scrollViewRef.current?.scrollTo({
            x: (currentSlide - 1) * width,
            animated: true,
          });
          setCurrentSlide(currentSlide - 1);
        }
      } else {
        setCurrentSlide(newIndex);
      }
    }
  };

  const handleLogin = () => {
    router.push("/signin");
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <View style={isDark ? styles.container_dark : styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#0A0A0A" : "#FFFFFF"} />

      {/* CHECK FOR THE PRESENCE OF TOKEN */}
      <TokenCheck />

      <View style={styles.slidesContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          contentContainerStyle={styles.scrollViewContent}
        >
          {slides.map((slide) => (
            <View key={slide.id} style={styles.slide}>
              <View style={styles.slideContent}>
                <View style={styles.imageContainer}>
                  <Image
                    source={slide.image}
                    style={styles.slideImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.slideTextContainer}>
                  <ThemedText style={isDark ? styles.slideTitle_dark : styles.slideTitle}>
                    {slide.title}
                  </ThemedText>
                  <ThemedText style={isDark ? styles.slideDescription_dark : styles.slideDescription}>
                    {slide.description}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToSlide(index)}
              style={[
                styles.dot,
                index === currentSlide 
                  ? (isDark ? styles.activeDot_dark : styles.activeDot) 
                  : (isDark ? styles.inactiveDot_dark : styles.inactiveDot),
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={isDark ? styles.loginButton_dark : styles.loginButton} 
          onPress={handleLogin}
        >
          <ThemedText style={isDark ? styles.loginButtonText_dark : styles.loginButtonText}>Login</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={isDark ? styles.signupButton_dark : styles.signupButton} 
          onPress={handleSignup}
        >
          <ThemedText style={styles.signupButtonText}>Signup</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container_dark: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  slidesContainer: {
    flex: 1,
    justifyContent: "center",
  },
  scrollViewContent: {
    // No additional styles needed here
  },
  slide: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
  },
  slideContent: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  slideImage: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 20,
  },
  slideTextContainer: {
    alignItems: "center",
    padding: 20,
    width: "100%",
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#000000",
  },
  slideTitle_dark: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#FFFFFF",
  },
  slideDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    opacity: 0.8,
    color: "#333333",
  },
  slideDescription_dark: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    opacity: 0.8,
    color: "#8EACB7",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#325C6A",
    width: 20,
  },
  activeDot_dark: {
    backgroundColor: "#4793E0",
    width: 20,
  },
  inactiveDot: {
    backgroundColor: "#E0E0E0",
  },
  inactiveDot_dark: {
    backgroundColor: "#262626",
  },
  actionsContainer: {
    paddingHorizontal: 36,
    paddingBottom: 40,
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  loginButton_dark: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#262626",
  },
  loginButtonText: {
    fontWeight: "600",
    fontSize: 16,
    color: "#000000",
  },
  loginButtonText_dark: {
    fontWeight: "600",
    fontSize: 16,
    color: "#FFFFFF",
  },
  signupButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#325C6A",
  },
  signupButton_dark: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C4A5A",
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
