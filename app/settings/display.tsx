import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Switch } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function DisplaySettings() {
  const colorScheme = useColorScheme();
  const colors = Colors['light'];

  // 상태 변수들
  const [darkMode, setDarkMode] = React.useState(false);
  const [highContrast, setHighContrast] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [fontSize, setFontSize] = React.useState('medium'); // small, medium, large
  const [fontFamily, setFontFamily] = React.useState('system');

  // 폰트 크기 변경 핸들러
  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
  };

  // 폰트 패밀리 변경 핸들러
  const handleFontFamilyChange = (font: string) => {
    setFontFamily(font);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.container}>
        {/* 테마 설정 섹션 */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>화면 테마</Text>

          <View style={styles.toggleContainer}>
            <View>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>다크 모드</Text>
              <Text style={[styles.toggleDescription, { color: colors.icon }]}>어두운 색상 테마를 적용합니다</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: '#FF8DA1' }}
              thumbColor='#ffffff'
            />
          </View>
        </View>

        {/* 폰트 크기 섹션 */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>폰트 크기</Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                fontSize === 'small' && styles.selectedOption,
                fontSize === 'small' && { borderColor: '#FF8DA1' },
              ]}
              onPress={() => handleFontSizeChange('small')}
            >
              <Text style={[styles.optionText, { color: colors.text }, fontSize === 'small' && { color: '#FF8DA1' }]}>
                작게
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                fontSize === 'medium' && styles.selectedOption,
                fontSize === 'medium' && { borderColor: '#FF8DA1' },
              ]}
              onPress={() => handleFontSizeChange('medium')}
            >
              <Text style={[styles.optionText, { color: colors.text }, fontSize === 'medium' && { color: '#FF8DA1' }]}>
                중간
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                fontSize === 'large' && styles.selectedOption,
                fontSize === 'large' && { borderColor: '#FF8DA1' },
              ]}
              onPress={() => handleFontSizeChange('large')}
            >
              <Text style={[styles.optionText, { color: colors.text }, fontSize === 'large' && { color: '#FF8DA1' }]}>
                크게
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.previewContainer}>
            <Text style={[styles.previewLabel, { color: colors.icon }]}>미리보기</Text>
            <Text
              style={[
                styles.previewText,
                { color: colors.text },
                fontSize === 'small' && { fontSize: 14 },
                fontSize === 'medium' && { fontSize: 16 },
                fontSize === 'large' && { fontSize: 18 },
              ]}
            >
              텍스트 크기가 이렇게 표시됩니다
            </Text>
          </View>
        </View>

        {/* 설정 적용 버튼 */}
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: '#FF8DA1' }]}
          onPress={() => console.log('설정 적용')}
        >
          <Text style={styles.applyButtonText}>설정 적용</Text>
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginHorizontal: 4,
  },
  selectedOption: {
    borderWidth: 2,
  },
  optionText: {
    fontWeight: '500',
  },
  previewContainer: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  previewLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  previewText: {
    lineHeight: 24,
  },
  fontOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
  },
  selectedFontOption: {
    backgroundColor: '#F5F5F5',
  },
  fontOptionText: {
    fontSize: 16,
  },
  applyButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
