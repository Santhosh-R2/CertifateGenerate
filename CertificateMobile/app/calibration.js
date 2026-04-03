import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  Dimensions, ScrollView, Modal, TextInput, Alert 
} from 'react-native';
import { 
  GestureHandlerRootView, 
  PanGestureHandler, 
  State 
} from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler,
  runOnJS 
} from 'react-native-reanimated';
import { 
  Plus, Settings2, Trash2, Crosshair, 
  Type, Move, ChevronRight, X 
} from 'lucide-react-native';
import { theme } from '../src/theme';
import { useCertification } from '../src/CertificationContext';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CalibrationScreen() {
  const { 
    templateUri, 
    certificateFields, 
    setCertificateFields,
    issueDate,
    setIssueDate 
  } = useCertification();
  
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [selectedField, setSelectedField] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');

  // Handle image layout to calculate dimensions
  const onImageLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  const addField = () => {
    const formattedName = newFieldName.trim().toLowerCase().replace(/\s+/g, '_');
    if (!formattedName) return;
    if (certificateFields[formattedName]) {
      Alert.alert('Error', 'Field already exists');
      return;
    }

    setCertificateFields((prev) => ({
      ...prev,
      [formattedName]: {
        label: newFieldName.trim(),
        text: '',
        xPct: 50,
        yPct: 50,
        fontSize: 32,
        fontFamily: 'System',
        fontWeight: 'bold',
        align: 'center',
        color: '#000000',
        source: 'data'
      }
    }));
    setNewFieldName('');
  };

  const updateField = (fieldName, property, value) => {
    setCertificateFields((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], [property]: value }
    }));
  };

  const removeField = (fieldName) => {
    const newFields = { ...certificateFields };
    delete newFields[fieldName];
    setCertificateFields(newFields);
    setModalVisible(false);
  };

  const openProperties = (fieldName) => {
    setSelectedField(fieldName);
    setModalVisible(true);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.newFieldInput}
            placeholder="Field name (e.g. Name)"
            placeholderTextColor={theme.colors.textMuted}
            value={newFieldName}
            onChangeText={setNewFieldName}
          />
          <TouchableOpacity style={styles.addButton} onPress={addField}>
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.canvasWrapper}>
        <View style={styles.canvasContainer} onLayout={onImageLayout}>
          {templateUri && (
            <Image 
              source={{ uri: templateUri }} 
              style={styles.templateImage} 
              resizeMode="contain" 
            />
          )}
          
          {containerSize.width > 0 && Object.entries(certificateFields).map(([key, field]) => (
            <DraggableMarker 
              key={key}
              fieldKey={key}
              field={field}
              containerSize={containerSize}
              onDrag={(xPct, yPct) => {
                updateField(key, 'xPct', xPct);
                updateField(key, 'yPct', yPct);
              }}
              onPress={() => openProperties(key)}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
          {Object.keys(certificateFields).map(key => (
            <TouchableOpacity 
              key={key} 
              style={styles.chip}
              onPress={() => openProperties(key)}
            >
              <Text style={styles.chipText}>{certificateFields[key].label}</Text>
              <Settings2 size={12} color={theme.colors.accentCyan} />
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity 
          style={[styles.confirmButton, Object.keys(certificateFields).length === 0 && { opacity: 0.5 }]}
          onPress={() => router.push('/data')}
          disabled={Object.keys(certificateFields).length === 0}
        >
          <Text style={styles.confirmText}>CONFIRM MAPPING</Text>
          <ChevronRight size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Properties Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>FIELD PROPERTIES</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>

            {selectedField && certificateFields[selectedField] && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.propertyGroup}>
                  <Text style={styles.propertyLabel}>LABEL: {certificateFields[selectedField].label}</Text>
                  
                  <Text style={styles.subLabel}>DATA SOURCE</Text>
                  <View style={styles.toggleContainer}>
                    <TouchableOpacity 
                      style={[styles.toggleBtn, certificateFields[selectedField].source === 'data' && styles.toggleBtnActive]}
                      onPress={() => updateField(selectedField, 'source', 'data')}
                    >
                      <Text style={styles.toggleText}>EXCEL DATA</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.toggleBtn, certificateFields[selectedField].source === 'system_date' && styles.toggleBtnActive]}
                      onPress={() => updateField(selectedField, 'source', 'system_date')}
                    >
                      <Text style={styles.toggleText}>FIXED DATE</Text>
                    </TouchableOpacity>
                  </View>

                  {certificateFields[selectedField].source === 'data' ? (
                    <>
                      <Text style={styles.subLabel}>EXCEL COLUMN KEY</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={certificateFields[selectedField].text}
                        onChangeText={(val) => updateField(selectedField, 'text', val)}
                        placeholder="e.g. name"
                        placeholderTextColor={theme.colors.textDark}
                      />
                    </>
                  ) : (
                    <View style={styles.dateInfo}>
                      <Text style={styles.dateText}>Using global date: {issueDate}</Text>
                    </View>
                  )}

                  <Text style={styles.subLabel}>FONT SIZE (PT)</Text>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity 
                      style={styles.stepBtn}
                      onPress={() => updateField(selectedField, 'fontSize', Math.max(8, certificateFields[selectedField].fontSize - 2))}
                    >
                      <Text style={styles.stepText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepValue}>{certificateFields[selectedField].fontSize}</Text>
                    <TouchableOpacity 
                      style={styles.stepBtn}
                      onPress={() => updateField(selectedField, 'fontSize', certificateFields[selectedField].fontSize + 2)}
                    >
                      <Text style={styles.stepText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => removeField(selectedField)}
                  >
                    <Trash2 size={18} color={theme.colors.accentRose} />
                    <Text style={styles.deleteText}>DELETE FIELD</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const DraggableMarker = ({ fieldKey, field, containerSize, onDrag, onPress }) => {
  const x = useSharedValue((field.xPct / 100) * containerSize.width);
  const y = useSharedValue((field.yPct / 100) * containerSize.height);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = x.value;
      ctx.startY = y.value;
    },
    onActive: (event, ctx) => {
      x.value = Math.max(0, Math.min(containerSize.width, ctx.startX + event.translationX));
      y.value = Math.max(0, Math.min(containerSize.height, ctx.startY + event.translationY));
    },
    onEnd: () => {
      const xPct = (x.value / containerSize.width) * 100;
      const yPct = (y.value / containerSize.height) * 100;
      runOnJS(onDrag)(xPct, yPct);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value - 20 },
      { translateY: y.value - 20 },
    ],
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.marker, animatedStyle]}>
        <TouchableOpacity style={styles.markerInner} onPress={onPress}>
          <View style={styles.crosshair}>
            <View style={styles.crossH} />
            <View style={styles.crossV} />
            <View style={styles.crossDot} />
          </View>
          <View style={styles.markerLabel}>
            <Text style={styles.markerLabelText} numberOfLines={1}>{field.label}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgCore,
  },
  topBar: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.bgPanelSolid,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: theme.spacing.s,
  },
  newFieldInput: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.5)',
    color: 'white',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  addButton: {
    width: 50,
    backgroundColor: theme.colors.accentIndigo,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.m,
  },
  canvasWrapper: {
    flex: 1,
    padding: theme.spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasContainer: {
    width: '100%',
    aspectRatio: 1.414,
    backgroundColor: '#000',
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  marker: {
    position: 'absolute',
    width: 40,
    height: 40,
    zIndex: 100,
  },
  markerInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshair: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossH: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: theme.colors.accentCyan,
  },
  crossV: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.accentCyan,
  },
  crossDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.accentIndigo,
    shadowColor: theme.colors.accentIndigo,
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  markerLabel: {
    position: 'absolute',
    top: 30,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  markerLabelText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '800',
  },
  footer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.bgPanelSolid,
    borderTopWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  chipsContainer: {
    paddingBottom: theme.spacing.m,
    gap: theme.spacing.s,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    gap: 6,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: theme.colors.accentIndigo,
    height: 56,
    borderRadius: theme.borderRadius.m,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  confirmText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.bgPanelSolid,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 2,
  },
  modalBody: {
    padding: 24,
  },
  propertyGroup: {
    gap: 20,
  },
  propertyLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgCore,
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: theme.colors.accentIndigo,
  },
  toggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
  },
  modalInput: {
    backgroundColor: theme.colors.bgCore,
    color: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.bgCore,
    borderRadius: 12,
    padding: 4,
  },
  stepBtn: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  stepText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  stepValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
  },
  deleteText: {
    color: theme.colors.accentRose,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  dateInfo: {
    padding: 16,
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  dateText: {
    color: theme.colors.accentCyan,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
