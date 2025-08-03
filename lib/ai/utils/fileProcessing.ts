import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { FileAttachment } from '../types';

export const pickFiles = async (): Promise<FileAttachment[]> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return [];
    }

    const attachments: FileAttachment[] = [];

    for (const file of result.assets) {
      const attachment: FileAttachment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.mimeType?.startsWith('image/') ? 'image' : 
              file.mimeType === 'application/pdf' ? 'pdf' : 'document',
        uri: file.uri,
        mimeType: file.mimeType || 'application/octet-stream',
      };

      // Convert images to base64
      if (attachment.type === 'image') {
        attachment.base64 = await convertImageToBase64(file.uri);
      }

      attachments.push(attachment);
    }

    return attachments;
  } catch (error) {
    console.error('Error picking files:', error);
    throw error;
  }
};

export const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

export const getFilePreview = (attachment: FileAttachment) => {
  switch (attachment.type) {
    case 'image':
      return {
        icon: 'picture',
        color: '#10B981',
      };
    case 'pdf':
      return {
        icon: 'pdffile1',
        color: '#EF4444',
      };
    default:
      return {
        icon: 'file1',
        color: '#6B7280',
      };
  }
};