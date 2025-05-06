import React from 'react';
import {ColorSchemeName, Image, Linking, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {Colors} from '@/components/design/colors';

type NoAPIKeyViewProps = {
  colorScheme?: ColorSchemeName;
};

const NoAPIKeyView = ({ colorScheme }: NoAPIKeyViewProps) => {
  const isDark = colorScheme === 'dark';
  
  const handleWebSettingsPress = () => {
    Linking.openURL("https://app.betterstacks.com/settings/ai");
  };

  return (
    <ScrollView 
      style={{flex: 1, backgroundColor: isDark ? '#0A0A0A' : '#fff'}}
      contentContainerStyle={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24}}>
      <View style={{alignItems: 'center', width: '100%', maxWidth: 450}}>
        <View style={{marginBottom: 40}}>
          <Image
            source={require('@/assets/png/stacks-logo.png')}
            style={{width: 80, height: 80}}
            resizeMode="contain"
          />
        </View>
        
        <Text style={{fontSize: 24, fontWeight: '600', color: isDark ? '#E5E5E5' : '#333', marginBottom: 16, textAlign: 'center'}}>
          API Key Required
        </Text>
        
        <Text style={{fontSize: 16, color: isDark ? '#A0B3BC' : '#666', textAlign: 'center', marginBottom: 32, lineHeight: 24}}>
          To use Stacks AI, you'll need to add an API key from either OpenAI or Anthropic in your settings.
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: Colors.TextColor.LignMainColor,
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            marginBottom: 40
          }}
          onPress={handleWebSettingsPress}>
          <Feather name="external-link" size={16} color="#fff" style={{marginRight: 8}} />
          <Text style={{color: '#fff', fontSize: 15, fontWeight: '600'}}>
            Configure on Web
          </Text>
        </TouchableOpacity>

        <View style={{
          backgroundColor: isDark ? '#171717' : '#f8f8f8', 
          padding: 20, 
          borderRadius: 12, 
          width: '100%'
        }}>
          <Text style={{fontSize: 15, fontWeight: '600', color: isDark ? '#E5E5E5' : '#444', marginBottom: 16}}>
            How to get your API key:
          </Text>
          
          <View style={{width: '100%', marginBottom: 16}}>
            <Text style={{fontSize: 14, fontWeight: '600', color: isDark ? '#A0B3BC' : '#555', marginBottom: 10}}>OpenAI</Text>
            <View style={{
              width: '100%', 
              backgroundColor: isDark ? '#262626' : 'white', 
              borderRadius: 8, 
              padding: 12
            }}>
              <Text style={{fontSize: 13, color: isDark ? '#A0B3BC' : '#666', marginBottom: 6}}>• Visit platform.openai.com</Text>
              <Text style={{fontSize: 13, color: isDark ? '#A0B3BC' : '#666'}}>• Create a new secret key</Text>
            </View>
          </View>
          
          <View style={{width: '100%'}}>
            <Text style={{fontSize: 14, fontWeight: '600', color: isDark ? '#A0B3BC' : '#555', marginBottom: 10}}>Anthropic</Text>
            <View style={{
              width: '100%', 
              backgroundColor: isDark ? '#262626' : 'white', 
              borderRadius: 8, 
              padding: 12
            }}>
              <Text style={{fontSize: 13, color: isDark ? '#A0B3BC' : '#666', marginBottom: 6}}>• Visit console.anthropic.com</Text>
              <Text style={{fontSize: 13, color: isDark ? '#A0B3BC' : '#666'}}>• Generate a new API key</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default NoAPIKeyView; 