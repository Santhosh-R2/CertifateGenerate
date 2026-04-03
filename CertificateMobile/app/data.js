import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import { Database, FileSpreadsheet, Trash2, CheckCircle2, ChevronRight, Table } from 'lucide-react-native';
import { theme } from '../src/theme';
import { useCertification } from '../src/CertificationContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import Papa from 'papaparse';

export default function DataScreen() {
  const { importedData, setImportedData } = useCertification();
  const [isLoading, setIsLoading] = useState(false);

  const handlePickFile = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const normalizedData = results.data.map(row => {
              const normalized = {};
              Object.keys(row).forEach(key => {
                normalized[key.toLowerCase().trim().replace(/\s+/g, '_')] = row[key];
              });
              return normalized;
            });
            setImportedData(normalizedData);
            setIsLoading(false);
          },
          error: (error) => {
            Alert.alert('Error', 'Failed to parse CSV');
            setIsLoading(false);
          }
        });
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick file');
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setImportedData([]);
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={[styles.headerCell, { width: 50 }]}>ID</Text>
      {importedData.length > 0 && Object.keys(importedData[0]).map(key => (
        <Text key={key} style={styles.headerCell}>{key.toUpperCase()}</Text>
      ))}
    </View>
  );

  const renderItem = ({ item, index }) => (
    <View style={styles.row}>
      <View style={[styles.cell, { width: 50, borderRightWidth: 1, borderColor: theme.colors.borderLight }]}>
        <Text style={styles.idBadge}>{String(index + 1).padStart(2, '0')}</Text>
      </View>
      {Object.keys(item).map(key => (
        <Text key={key} style={styles.cell} numberOfLines={1}>{String(item[key] || '-')}</Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
           <Database size={24} color={theme.colors.accentCyan} />
           <View>
             <Text style={styles.title}>ROSTER POOL</Text>
             <Text style={styles.subtitle}>{importedData.length} records verified</Text>
           </View>
        </View>
        {importedData.length > 0 && (
          <TouchableOpacity onPress={clearData} style={styles.clearBtn}>
            <Trash2 size={16} color={theme.colors.accentRose} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {importedData.length === 0 ? (
          <TouchableOpacity 
            onPress={handlePickFile} 
            style={styles.uploadCard}
            disabled={isLoading}
          >
            <View style={styles.iconCircle}>
              <FileSpreadsheet size={48} color={theme.colors.accentCyan} />
            </View>
            <Text style={styles.uploadTitle}>{isLoading ? 'PARSING DATA...' : 'INITIALIZE CSV'}</Text>
            <Text style={styles.uploadSub}>Select a roster file from your phone</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.tableCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FlatList
                data={importedData.slice(0, 50)}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                keyExtractor={(item, index) => index.toString()}
                stickyHeaderIndices={[0]}
              />
            </ScrollView>
            {importedData.length > 50 && (
              <View style={styles.tableFooter}>
                <CheckCircle2 size={14} color={theme.colors.accentEmerald} />
                <Text style={styles.footerText}>+ {importedData.length - 50} MORE RECORDS LOADED</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {importedData.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.proceedButton}
            onPress={() => router.push('/generate')}
          >
            <Text style={styles.proceedText}>INITIALIZE ENGINE</Text>
            <ChevronRight size={18} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgCore,
  },
  header: {
    padding: 24,
    backgroundColor: theme.colors.bgPanelSolid,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderStrong,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  uploadCard: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.borderStrong,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 1,
    textAlign: 'center',
  },
  uploadSub: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  tableCard: {
    flex: 1,
    backgroundColor: theme.colors.bgPanelSolid,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    overflow: 'hidden',
  },
  listHeader: {
    flexDirection: 'row',
    backgroundColor: '#161e2e',
    borderBottomWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  headerCell: {
    padding: 12,
    width: 120,
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.accentCyan,
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  cell: {
    padding: 12,
    width: 120,
    fontSize: 12,
    color: theme.colors.textMain,
    textAlign: 'center',
  },
  idBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textMuted,
    fontFamily: 'System',
  },
  tableFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: theme.colors.bgCore,
    gap: 8,
  },
  footerText: {
    color: theme.colors.accentEmerald,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  proceedButton: {
    backgroundColor: theme.colors.accentIndigo,
    height: 56,
    borderRadius: theme.borderRadius.m,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  proceedText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
});
