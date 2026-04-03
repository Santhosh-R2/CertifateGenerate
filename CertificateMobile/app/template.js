import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { UploadCloud, CheckCircle2 } from 'lucide-react-native';
import { theme } from '../src/theme';
import { useCertification } from '../src/CertificationContext';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';

export default function TemplateScreen() {
  const { templateUri, setTemplateUri } = useCertification();

  const handlePickTemplate = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setTemplateUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image');
      console.log(err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Initialize Canvas</Text>
        <Text style={styles.subtitle}>Upload your high-resolution certificate template to begin.</Text>
      </View>
      
      <TouchableOpacity 
        onPress={handlePickTemplate} 
        style={[styles.dropzone, templateUri && { borderColor: theme.colors.accentIndigo }]}
      >
        {templateUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: templateUri }} style={styles.previewImage} resizeMode="contain" />
            <View style={styles.overlay}>
               <Text style={styles.overlayText}>REPLACE TEMPLATE</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContent}>
            <View style={styles.iconCircle}>
              <UploadCloud size={48} color={theme.colors.accentIndigo} />
            </View>
            <Text style={styles.mainText}>TAP TO UPLOAD</Text>
            <Text style={styles.subText}>Select from Files or Gallery</Text>
          </View>
        )}
      </TouchableOpacity>

      {templateUri && (
        <TouchableOpacity 
          style={styles.proceedButton}
          onPress={() => router.push('/calibration')}
        >
          <Text style={styles.proceedText}>PROCEED TO CALIBRATION</Text>
          <CheckCircle2 size={18} color="white" />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.bgCore,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.m,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.s,
    lineHeight: 20,
  },
  dropzone: {
    width: '100%',
    aspectRatio: 1.414,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  emptyContent: {
    alignItems: 'center',
    gap: theme.spacing.s,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  mainText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: 2,
  },
  subText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
    padding: theme.spacing.m,
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  proceedButton: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.accentIndigo,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.m,
  },
  proceedText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
});
