import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Switch } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function AccountSettings() {
  const colorScheme = useColorScheme();
  const colors = Colors['light'];
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [syncData, setSyncData] = React.useState(true);

  // 임시 사용자 데이터
  const userData = {
    name: '김퀘스틴',
    email: 'user@questine.com',
    phone: '010-1234-5678',
    joinDate: '2025-01-15',
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.container}>
        {/* 사용자 정보 섹션 */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>내 정보</Text>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.icon }]}>이름</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>{userData.name}</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.icon }]}>이메일</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>{userData.email}</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.icon }]}>전화번호</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>{userData.phone}</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.icon }]}>가입일</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>{userData.joinDate}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF8DA1' }]}
            onPress={() => console.log('프로필 편집')}
          >
            <Text style={styles.buttonText}>프로필 편집</Text>
          </TouchableOpacity>
        </View>

        {/* 계정 관리 섹션 */}
        <TouchableOpacity
          style={[styles.deleteAccount, { borderColor: colors.icon + '30' }]}
          onPress={() => console.log('계정 삭제')}
        >
          <Text style={[styles.deleteAccountText, { color: '#FF3B30' }]}>계정 탈퇴</Text>
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
  },
});
