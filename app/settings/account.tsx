import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, QuestineColors } from '@/constants/Colors';

export default function AccountSettings() {
  const colors = Colors['light'];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.container}>
        {/* 계정 관리 섹션 */}
        <TouchableOpacity
          style={[styles.deleteAccount, { borderColor: colors.icon + '30' }]}
          onPress={() => console.log('계정 삭제')}
        >
          <Text style={styles.deleteAccountText}>계정 탈퇴</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  dataButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  dataButtonText: {
    fontWeight: '500',
    fontSize: 16,
  },
  deleteAccount: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  deleteAccountText: {
    fontWeight: '500',
    fontSize: 16,
    color: QuestineColors.RED_500,
  },
});
