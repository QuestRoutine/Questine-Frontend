import { StyleSheet, Text, View, Image, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { QuestineColors } from '@/constants/Colors';
import EmailInput from '@/components/input/EmailInput';
import PasswordInput from '@/components/input/PasswordInput';
import { FormProvider, useForm } from 'react-hook-form';
import useAuth from '@/hooks/useAuth';

export default function Login() {
  type FormValues = {
    email: string;
    password: string;
    passwordConfirm: string;
  };

  const signinForm = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const { signinMutation } = useAuth();

  const onSubmit = (formValues: FormValues) => {
    const { email, password } = formValues;
    signinMutation.mutate({ email, password });
  };

  return (
    <FormProvider {...signinForm}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/images/Questine2.png')} style={styles.logo} resizeMode='contain' />
          </View>

          <View style={styles.formContainer}>
            <EmailInput />
            <PasswordInput />

            {/* {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null} */}

            <CustomButton label='로그인' onPress={signinForm.handleSubmit(onSubmit)} />

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
    </FormProvider>
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
    width: 200,
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
