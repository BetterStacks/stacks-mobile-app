import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable, useColorScheme, Platform, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, RefreshCw, Play, Pause } from 'lucide-react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Recorder, type RecordInfo, type RecorderRef } from '@lodev09/expo-recorder';
import { useMutation } from '@apollo/client';
import { MUTATION_ADD_VOICE_NOTE } from '@/lib/api/graphql/mutations';
import * as FileSystem from 'expo-file-system';
import client from "@/lib/apollo/client";
import { Toast } from "toastify-react-native";

type Props = {
  onBack: () => void;
  onClose: () => void;
  onSuccess: (message: { title: string; description: string }) => void;
  selectedCollectionId?: string;
};

const RECORD_BUTTON_SIZE = 60;
const RECORD_BUTTON_BACKGROUND_SIZE = RECORD_BUTTON_SIZE + 16;
const RECORDING_INDICATOR_COLOR = '#d72d66';
const RECORDING_INDICATOR_SCALE = 0.5;

const VoiceNoteView = ({ onBack, onClose, onSuccess }: Props) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [recordingInfo, setRecordingInfo] = useState<RecordInfo | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const recorderRef = useRef<RecorderRef>(null);
  const scale = useSharedValue(1);

  // Set up the upload mutation
  const [addVoiceNote, { loading: isSaving }] = useMutation(MUTATION_ADD_VOICE_NOTE, {
    onCompleted: (data) => {
      console.log("Voice note uploaded successfully:", data);
      
      // First close the modal
      onClose();
      
      // Show success toast
      Toast.success("Voice note saved successfully");
      
      // Also notify parent component
      onSuccess({
        title: "Voice Note Saved",
        description: "Your voice note has been saved successfully",
      });
      
      // Refetch queries to update the UI
      setTimeout(() => {
        client.refetchQueries({
          include: [
            "QUERY_LINKS",
            "QUERY_STACKS",
            "QUERY_DOMAIN_LINKS",
            "QUERY_DOMAIN_LINKS_BY_STACKID",
            "QUERY_STACK_LINKS",
          ],
        });
      }, 500);
    },
    onError: (error) => {
      console.error("Error saving voice note:", error);
      setErrorMessage(`Error saving: ${error.message}`);
      
      // Show error toast
      Toast.error("Failed to save voice note");
      
      Alert.alert(
        "Error Saving Voice Note",
        error.message || "There was a problem saving your voice note"
      );
    },
    context: {
      hasUpload: true, // Flag for Apollo client to handle file uploads
    },
  });

  // Request audio permissions on component mount
  useEffect(() => {
    const getPermissions = async () => {
      try {
        console.log("Requesting audio recording permissions");
        
        const { status } = await Audio.requestPermissionsAsync();
        console.log("Permission status:", status);
        setHasPermission(status === 'granted');
        
        if (status === 'granted') {
          await setupAudio();
        } else {
          console.log("Permission not granted");
          setErrorMessage("Microphone permission denied");
        }
      } catch (err) {
        const error = err as Error;
        console.error("Error requesting permissions:", error);
        setErrorMessage(`Permission error: ${error.message}`);
      }
    };
    
    getPermissions();
    
    // Cleanup function
    return () => {
      if (recorderRef.current) {
        recorderRef.current.resetRecording();
      }
    };
  }, []);
  
  const setupAudio = async () => {
    try {
      // Configure audio mode with updated settings
      if (Platform.OS === 'ios') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        });
      } else {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          shouldDuckAndroid: true,
        });
      }
      console.log("Audio mode configured successfully");
    } catch (err) {
      const error = err as Error;
      console.error("Error setting up audio:", error);
      setErrorMessage(`Audio setup error: ${error.message}`);
    }
  };

  const handleRecordStop = (record?: RecordInfo) => {
    scale.value = withSpring(1, { stiffness: 120, overshootClamping: true });
    setIsRecording(false);
    if (record) {
      console.log("Recording stopped, uri:", record.uri);
      console.log("Recording duration:", record.duration);
      console.log("Recording meterings:", record.meterings ? record.meterings.length : 'none');
      setRecordingInfo(record);
      
      // Check if meterings are coming through
      if (!record.meterings || record.meterings.length === 0) {
        console.warn("No meterings recorded - microphone might not be working properly");
        setErrorMessage("Warning: No audio detected");
      }
    } else {
      console.warn("No recording data returned");
      setErrorMessage("No recording data returned");
    }
  };

  const toggleRecording = async () => {
    if (!hasPermission) {
      console.log("No permission to record");
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Microphone permission is needed to record audio.");
        return;
      }
      setHasPermission(true);
      await setupAudio();
    }

    setErrorMessage(null);
    Haptics.selectionAsync();
    
    if (isRecording) {
      console.log("Stopping recording");
      const record = await recorderRef.current?.stopRecording();
      handleRecordStop(record);
    } else {
      console.log("Starting recording");
      try {
        // Reset previous recording if any
        if (recordingInfo) {
          await recorderRef.current?.resetRecording();
        }
        
        // Set up audio mode again before recording
        await setupAudio();
        
        await recorderRef.current?.startRecording();
        scale.value = withSpring(RECORDING_INDICATOR_SCALE, { stiffness: 120, overshootClamping: true });
        setIsRecording(true);
      } catch (err) {
        const error = err as Error;
        console.error("Error starting recording:", error);
        setErrorMessage(`Recording error: ${error.message}`);
      }
    }
  };

  const resetRecording = async () => {
    if (isRecording) return;

    Haptics.selectionAsync();
    await recorderRef.current?.resetRecording();
    setRecordingInfo(null);
    setErrorMessage(null);
    console.log("Recording reset");
  };

  const togglePlayback = async () => {
    if (isRecording) return;
    if (!recordingInfo) {
      console.log("No recording to play");
      return;
    }

    Haptics.selectionAsync();
    try {
      if (isPlaying) {
        console.log("Stopping playback");
        await recorderRef.current?.stopPlayback();
      } else {
        console.log("Starting playback");
        // Configure audio for playback
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          shouldDuckAndroid: false,
        });
        
        await recorderRef.current?.startPlayback();
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error during playback:", error);
      setErrorMessage(`Playback error: ${error.message}`);
    }
  };

  const handleSave = async () => {
    if (!recordingInfo || !recordingInfo.uri) return;
    
    try {
      setErrorMessage(null);
      
      const uri = recordingInfo.uri;
      
      // Generate a voice note filename with date timestamp
      const now = new Date();
      const dateFormatted = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
      const filename = `voice_note_${dateFormatted}.m4a`;
      
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error("Recording file not found");
      }
      
      console.log("Saving voice note:", filename);
      console.log("URI:", uri);
      
      // Create file object
      const fileObject = {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type: 'audio/m4a',
      };
      
      // Execute the mutation
      await addVoiceNote({
        variables: {
          file: fileObject,
        },
      });
      
    } catch (err) {
      const error = err as Error;
      console.error("Error in handleSave:", error);
      setErrorMessage(`Error saving: ${error.message}`);
      Alert.alert(
        "Error Saving Voice Note",
        error.message || "There was a problem saving your voice note"
      );
    }
  };

  const formatTimer = (time: number, showMilliseconds: boolean = false) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    
    if (showMilliseconds) {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const recordIndicatorStyles = useAnimatedStyle(() => ({
    borderRadius: interpolate(
      scale.value,
      [1, RECORDING_INDICATOR_SCALE],
      [RECORD_BUTTON_SIZE / 2, 4],
      Extrapolation.CLAMP
    ),
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={isDark ? styles.container_dark : styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <Text style={isDark ? styles.headerTitle_dark : styles.headerTitle}>New Voice Note</Text>
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            (!recordingInfo || isSaving) && styles.saveButtonDisabled
          ]} 
          onPress={handleSave}
          disabled={!recordingInfo || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[
              isDark ? styles.saveButtonText_dark : styles.saveButtonText,
              !recordingInfo && styles.saveButtonTextDisabled
            ]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.recorderContainer}>
        <Recorder
          ref={recorderRef}
          tintColor={isDark ? "#6366f1" : "#4f46e5"}
          waveformInactiveColor={isDark ? "#3f3f46" : "#e4e4e7"}
          progressInterval={50}
          timelineColor={isDark ? "#3f3f46" : "#e4e4e7"}
          backgroundColor={isDark ? "#171717" : "#ffffff"}
          progressBackgroundColor={isDark ? "#2d2d2d" : "#f4f4f5"}
          onRecordStop={handleRecordStop}
          onRecordReset={() => {
            scale.value = 1;
            setIsRecording(false);
            setIsPlaying(false);
            setRecordingInfo(null);
            setErrorMessage(null);
          }}
          onPlaybackStart={() => setIsPlaying(true)}
          onPlaybackStop={() => setIsPlaying(false)}
          onPositionChange={(pos: number) => setPosition(pos)}
        />
        
        <View style={styles.timerContainer}>
          <Text style={isDark ? styles.timerText_dark : styles.timerText}>
            {formatTimer(Math.round(position / 100) * 100, true)}
          </Text>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <Text style={styles.recordingText}>Recording</Text>
            </View>
          )}
          {recordingInfo && !isRecording && !isPlaying && (
            <Text style={styles.recordedText}>
              {formatTimer(recordingInfo.duration || 0, false)} recorded
            </Text>
          )}
          {errorMessage && (
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          )}
        </View>
        
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, (isRecording || !recordingInfo) && styles.controlButtonDisabled]} 
            onPress={resetRecording}
            disabled={isRecording || !recordingInfo}
          >
            <RefreshCw size={24} color={isDark ? (isRecording || !recordingInfo ? "#555555" : "#FFFFFF") : (isRecording || !recordingInfo ? "#CCCCCC" : "#000000")} />
          </TouchableOpacity>
          
          <View style={styles.recordButtonContainer}>
            <View style={[styles.recordButtonBackground, { borderColor: isDark ? "#3f3f46" : "rgba(0,0,0,0.3)" }]} />
            <Pressable style={styles.recordButton} onPress={toggleRecording}>
              <Animated.View 
                style={[
                  styles.recordIndicator, 
                  recordIndicatorStyles,
                ]} 
              />
            </Pressable>
          </View>
          
          <TouchableOpacity 
            style={[styles.controlButton, (!recordingInfo || isRecording) && styles.controlButtonDisabled]} 
            onPress={togglePlayback}
            disabled={!recordingInfo || isRecording}
          >
            {isPlaying ? (
              <Pause size={24} color={isDark ? "#FFFFFF" : "#000000"} />
            ) : (
              <Play size={24} color={isDark ? (!recordingInfo || isRecording ? "#555555" : "#FFFFFF") : (!recordingInfo || isRecording ? "#CCCCCC" : "#000000")} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  container_dark: {
    padding: 16,
    backgroundColor: '#171717',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerTitle_dark: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#4f46e5',
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#6b7280',
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButtonText_dark: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButtonTextDisabled: {
    color: '#d1d5db',
  },
  recorderContainer: {
    marginTop: 16,
  },
  timerContainer: {
    padding: 16,
    marginTop: 32,
    alignItems: 'center',
  },
  timerText: {
    fontWeight: '500',
    fontSize: 28,
    color: '#000000',
  },
  timerText_dark: {
    fontWeight: '500',
    fontSize: 28,
    color: '#FFFFFF',
  },
  recordingIndicator: {
    marginTop: 8,
    alignItems: 'center',
    width: '100%',
  },
  recordingText: {
    color: '#dc2626',
    fontWeight: '500',
    marginBottom: 4,
  },
  recordedText: {
    marginTop: 8,
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '500',
  },
  micLevelIndicator: {
    height: 4,
    backgroundColor: '#dc2626',
    borderRadius: 2,
    width: '50%',
  },
  noPermissionText: {
    marginTop: 8,
    color: '#dc2626',
    fontSize: 14,
  },
  errorText: {
    marginTop: 8,
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 24,
  },
  controlButton: {
    padding: 12,
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  recordButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonBackground: {
    borderRadius: RECORD_BUTTON_BACKGROUND_SIZE / 2,
    height: RECORD_BUTTON_BACKGROUND_SIZE,
    width: RECORD_BUTTON_BACKGROUND_SIZE,
    borderWidth: 2,
  },
  recordButton: {
    position: 'absolute',
  },
  recordIndicator: {
    backgroundColor: RECORDING_INDICATOR_COLOR,
    borderRadius: RECORD_BUTTON_SIZE / 2,
    height: RECORD_BUTTON_SIZE,
    width: RECORD_BUTTON_SIZE,
  },
});

export default VoiceNoteView; 