import { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import CustomInput from '@/components/CustomInput';
import { QuestineColors } from '@/constants/Colors';
import CustomButton from '@/components/CustomButton';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');

  const handleRegister = () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setRegisterError('모든 항목을 입력해주세요');
      return;
    }

    if (password !== confirmPassword) {
      setRegisterError('비밀번호가 일치하지 않습니다');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setRegisterError('올바른 이메일 형식이 아닙니다');
      return;
    }

    console.log('회원가입 시도:', { username, email, password });

    router.push('/auth/Login');
  };

  return (
    <View style={styles.container}>
      <CustomInput label='이메일' placeholder='이메일을 입력하세요' />
      <CustomInput label='비밀번호' placeholder='비밀번호를 입력하세요' />
      <CustomInput label='비밀번호 확인' placeholder='비밀번호를 다시 입력하세요' />

      {registerError ? <Text>{registerError}</Text> : null}

      <CustomButton label='회원가입' />

      <View style={styles.loginLinkContainer}>
        <Text style={styles.loginText}>이미 계정이 있으신가요?</Text>
        <Pressable>
          <Text style={styles.loginLink} onPress={() => router.navigate('/auth/Login')}>
            로그인
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: QuestineColors.GRAY_500,
    marginRight: 5,
  },
  loginLink: {
    color: QuestineColors.PINK_500,
    fontWeight: 'bold',
  },
});
