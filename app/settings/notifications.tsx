import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function Notifications() {
  const colorScheme = useColorScheme();
  const colors = Colors['light'];

  // 임시 공지사항
  const notifications = [
    {
      id: '1',
      title: '앱 업데이트 안내 (v1.0.0)',
      date: '2025년 4월 25일',
      content:
        '퀘스틴 앱이 정식 출시되었습니다! 이제 다양한 기능을 사용해보세요. 사용 중 불편한 점이나 개선이 필요한 부분은 고객센터로 문의해 주세요.',
      isNew: true,
    },
    {
      id: '2',
      title: '서버 점검 안내',
      date: '2025년 4월 20일',
      content:
        '2025년 4월 21일 오전 2시부터 4시까지 서버 점검이 예정되어 있습니다. 해당 시간에는 서비스 이용이 원활하지 않을 수 있으니 양해 부탁드립니다.',
      isNew: false,
    },
    {
      id: '3',
      title: '개인정보처리방침 변경 안내',
      date: '2025년 4월 15일',
      content:
        '개인정보처리방침이 변경되었습니다. 변경된 내용은 앱 내 설정 > 개인정보처리방침에서 확인하실 수 있습니다.',
      isNew: false,
    },
    {
      id: '4',
      title: '부하 테스트 안내',
      date: '2025년 4월 10일',
      content:
        '서비스의 안정적인 운영을 위한 부하 테스트가 진행됩니다. 테스트 기간 동안 일시적으로 속도 저하가 발생할 수 있습니다.',
      isNew: false,
    },
    {
      id: '5',
      title: '베타 테스트 종료 안내',
      date: '2025년 4월 5일',
      content:
        '베타 테스트가 성공적으로 종료되었습니다. 참여해주신 모든 분들께 감사드립니다. 정식 출시는 4월 25일로 예정되어 있습니다.',
      isNew: false,
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.container}>
        {/* 공지사항 목록 */}
        {notifications.map((notification) => (
          <View
            key={notification.id}
            style={[
              styles.notificationItem,
              { borderBottomColor: colors.icon + '20' },
              notification.isNew && styles.newNotification,
            ]}
          >
            <View style={styles.notificationHeader}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>
                {notification.title}
                {notification.isNew && <Text style={styles.newBadge}> NEW</Text>}
              </Text>
              <Text style={[styles.notificationDate, { color: colors.icon }]}>{notification.date}</Text>
            </View>

            <Text style={[styles.notificationContent, { color: colors.text }]}>{notification.content}</Text>
          </View>
        ))}

        {/* 추가 안내문 */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoText, { color: colors.icon }]}>
            더 많은 공지사항은 퀘스틴 공식 웹사이트에서 확인하실 수 있습니다.
          </Text>

          <TouchableOpacity
            style={[styles.websiteButton, { borderColor: colors.icon + '30' }]}
            onPress={() => console.log('웹사이트로 이동')}
          >
            <Text style={[styles.websiteButtonText, { color: '#FF8DA1' }]}>웹사이트 방문하기</Text>
          </TouchableOpacity>
        </View>

        {/* 고객 지원 섹션 */}
        <View style={styles.supportSection}>
          <Text style={[styles.supportTitle, { color: colors.text }]}>도움이 필요하신가요?</Text>
          <Text style={[styles.supportText, { color: colors.icon }]}>
            서비스 이용 중 궁금한 점이나 불편한 사항이 있으시면 언제든지 고객센터로 문의해주세요.
          </Text>

          <TouchableOpacity
            style={[styles.supportButton, { backgroundColor: '#FF8DA1' }]}
            onPress={() => console.log('고객센터 연결')}
          >
            <Text style={styles.supportButtonText}>고객센터 문의하기</Text>
          </TouchableOpacity>
        </View>
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
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  newNotification: {
    backgroundColor: 'rgba(255, 141, 161, 0.05)',
    borderRadius: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  newBadge: {
    color: '#FF8DA1',
    fontWeight: 'bold',
  },
  notificationDate: {
    fontSize: 13,
  },
  notificationContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoSection: {
    marginTop: 30,
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  infoText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  websiteButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  websiteButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  supportSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  supportText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  supportButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  supportButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
