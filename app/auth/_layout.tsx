import { Foundation } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
export default function _layout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: 'hotpink',
      }}
    >
      <Stack.Screen
        name='Login'
        options={{
          title: '로그인',
          headerLeft: () => (
            <Link href='/' replace style={{ marginLeft: 10 }}>
              <Foundation name='home' size={28} color={'hotpink'} />
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name='Register'
        options={{
          headerTitle: '회원가입',
        }}
      />
    </Stack>
  );
}
const styles = StyleSheet.create({});
