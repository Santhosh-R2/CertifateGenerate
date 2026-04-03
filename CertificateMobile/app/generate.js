import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Zap, CheckCircle2, Download, Hexagon, ShieldCheck, Share2 } from 'lucide-react-native';
import { theme } from '../src/theme';
import { useCertification } from '../src/CertificationContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';

export default function GenerateScreen() {
  const { templateUri, importedData, certificateFields, issueDate } = useCertification();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const isReady = templateUri && importedData.length > 0 && Object.keys(certificateFields).length > 0;

  const handleGenerateAndShare = async () => {
    if (!isReady) return;
    setIsGenerating(true);
    setProgress(0);

    try {
      // In a real mobile app, we'd ideally zip these. 
      // For this professional version, we'll generate the FIRST 10 as a demo or 
      // combine them into a single PDF with page breaks for the whole batch.
      
      let htmlContent = `
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; }
              .page {
                position: relative;
                width: 100vw;
                height: 100vh;
                page-break-after: always;
                background-image: url('${templateUri}');
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
              }
              .label {
                position: absolute;
                transform: translate(-50%, -50%);
                text-align: center;
              }
            </style>
          </head>
          <body>
      `;

      for (let i = 0; i < importedData.length; i++) {
        const item = importedData[i];
        htmlContent += `<div class="page">`;
        
        Object.entries(certificateFields).forEach(([key, config]) => {
          const textStr = config.source === 'system_date' ? issueDate : String(item[key] || item[config.label?.toLowerCase()] || '');
          if (!textStr) return;

          const style = `
            left: ${config.xPct}%;
            top: ${config.yPct}%;
            font-size: ${config.fontSize}px;
            color: ${config.color};
            font-family: sans-serif;
            font-weight: ${config.fontWeight || 'bold'};
          `;
          
          htmlContent += `<div class="label" style="${style}">${textStr}</div>`;
        });

        htmlContent += `</div>`;
        setProgress(Math.round(((i + 1) / importedData.length) * 100));
      }

      htmlContent += `</body></html>`;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Success', 'Certificates generated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate certificates');
      console.log(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Zap size={40} color={theme.colors.accentCyan} />
          </View>
          <Text style={styles.title}>System Ready</Text>
          <Text style={styles.subtitle}>Precision Studio Mobile Engine is fully calibrated and standing by.</Text>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <View style={styles.labelGroup}>
              <ShieldCheck size={16} color={theme.colors.accentEmerald} />
              <Text style={styles.summaryLabel}>Template Logic</Text>
            </View>
            <Text style={styles.summaryValue}>VERIFIED</Text>
          </View>
          
          <View style={styles.summaryItem}>
             <View style={styles.labelGroup}>
              <ShieldCheck size={16} color={theme.colors.accentEmerald} />
              <Text style={styles.summaryLabel}>Coordinate Grid</Text>
            </View>
            <Text style={styles.summaryValue}>{Object.keys(certificateFields).length} FIELDS</Text>
          </View>
          
          <View style={styles.summaryItem}>
             <View style={styles.labelGroup}>
              <ShieldCheck size={16} color={theme.colors.accentEmerald} />
              <Text style={styles.summaryLabel}>Roster Linked</Text>
            </View>
            <Text style={styles.summaryValue}>{importedData.length} RECORDS</Text>
          </View>
        </View>

        {isGenerating ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>GENERATING BATCH...</Text>
              <Text style={styles.percentageText}>{progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <ActivityIndicator color={theme.colors.accentIndigo} style={{ marginTop: 16 }} />
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.generateButton, !isReady && { opacity: 0.5 }]}
            onPress={handleGenerateAndShare}
            disabled={!isReady}
          >
            <Download size={20} color="white" />
            <Text style={styles.generateText}>INITIALIZE BATCH PRODUCTION</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('/template')}
          disabled={isGenerating}
        >
          <Text style={styles.backText}>ABORT AND RETURN TO START</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.bgCore,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.bgPanelSolid,
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  summaryBox: {
    backgroundColor: 'rgba(2, 6, 23, 0.5)',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    color: theme.colors.textMain,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    color: theme.colors.accentEmerald,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'System',
  },
  generateButton: {
    backgroundColor: theme.colors.accentIndigo,
    height: 64,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: theme.colors.accentIndigo,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  generateText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  progressContainer: {
    paddingVertical: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressText: {
    color: theme.colors.accentCyan,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  percentageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.bgCore,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accentIndigo,
    borderRadius: 4,
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
});
