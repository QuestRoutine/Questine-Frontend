import { useState } from 'react';
import { StyleSheet, Text, View, Image, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { QuestineColors } from '@/constants/Colors';
import CustomInput from '@/components/CustomInput';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setLoginError('아이디와 비밀번호를 모두 입력해주세요');
      return;
    }
    console.log({ username, password });
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/Questine.png')} style={styles.logo} resizeMode='contain' />
        </View>

        <View style={styles.formContainer}>
          <CustomInput
            placeholder='아이디를 입력하세요'
            label='이메일'
            value={username}
            onChangeText={setUsername}
            autoCapitalize='none'
          />

          <CustomInput
            label='비밀번호'
            placeholder='비밀번호를 입력하세요'
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

          <CustomButton label='로그인' onPress={handleLogin} />
          <CustomButton label='카카오로 로그인' loginType='kakao' onPress={handleLogin} />

          <View style={styles.registerLinkContainer}>
            <Text style={styles.registerText}>아직 계정이 없으신가요?</Text>
            <Pressable>
              <Text style={styles.registerLink} onPress={() => router.push('/auth/Register')}>
                회원가입
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 250,
    height: 100,
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: QuestineColors.GRAY_500,
    marginRight: 5,
  },
  registerLink: {
    color: QuestineColors.PINK_500,
    fontWeight: 'bold',
  },
});
