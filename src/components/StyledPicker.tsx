import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

export type PickerValue = string | number;

export type PickerOption = {
  label: string;
  value: PickerValue;
};

type Props = {
  selectedValue: PickerValue;
  onValueChange: (value: PickerValue) => void;
  items: PickerOption[];
  placeholder?: string;
  enabled?: boolean;
};

export default function StyledPicker({
  selectedValue,
  onValueChange,
  items,
  placeholder,
  enabled = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const selectedItem = items.find(item => item.value === selectedValue);

  if (Platform.OS === 'ios') {
    return (
      <View style={!enabled ? styles.disabledInput : undefined}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={value => onValueChange(value)}
          enabled={enabled}
          style={styles.pickerIOS}
          itemStyle={styles.pickerItemIOS}
        >
          {items.map(item => (
            <Picker.Item
              key={String(item.value)}
              label={item.label}
              value={item.value}
              color="#111"
            />
          ))}
        </Picker>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.androidSelect, !enabled && styles.disabledInput]}
        onPress={() => enabled && setOpen(true)}
        activeOpacity={0.8}
        disabled={!enabled}
      >
        <Text style={styles.androidSelectText}>
          {selectedItem?.label ?? placeholder ?? 'Select'}
        </Text>
        <Text style={styles.androidSelectChevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>
              {placeholder ?? 'Select an option'}
            </Text>

            <ScrollView
              style={styles.modalOptionsList}
              contentContainerStyle={styles.modalOptionsContent}
              nestedScrollEnabled
            >
              {items.map(item => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.modalOption,
                      isSelected && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        isSelected && styles.modalOptionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setOpen(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#FFF',
    marginBottom: 6,
    overflow: 'hidden',
  },

  pickerIOS: {
    color: '#111',
  },

  pickerItemIOS: {
    color: '#111',
  },

  androidSelect: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#FFF',
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  androidSelectText: {
    color: '#111',
    fontSize: 15,
  },

  androidSelectChevron: {
    color: '#666',
    fontSize: 14,
  },

  disabledInput: {
    backgroundColor: '#F3F4F6',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    maxHeight: '80%',
    padding: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },

  modalOptionsList: {
    maxHeight: 320,
    marginBottom: 12,
  },

  modalOptionsContent: {
    paddingBottom: 8,
  },

  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  modalOptionSelected: {
    backgroundColor: '#FDE7D0',
  },

  modalOptionText: {
    color: '#111',
    fontSize: 16,
  },

  modalOptionTextSelected: {
    fontWeight: '700',
  },

  modalCloseButton: {
    backgroundColor: '#FDC996',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  modalCloseButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
