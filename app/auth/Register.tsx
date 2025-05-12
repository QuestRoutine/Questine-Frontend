import { StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { QuestineColors } from '@/constants/Colors';
import CustomButton from '@/components/CustomButton';
import { FormProvider, useForm } from 'react-hook-form';
import EmailInput from '@/components/input/EmailInput';
import PasswordInput from '@/components/input/PasswordInput';
import PasswordConfirmInput from '@/components/input/PasswordConfirmInput';

export default function Register() {
  type FormValues = {
    email: string;
    password: string;
    passwordConfirm: string;
  };

  const signupform = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const onSubmit = (formValues: FormValues) => {
    console.log(formValues);
    const { email, password, passwordConfirm } = signupform.getValues();
  };

  return (
    <FormProvider {...signupform}>
      <View style={styles.container}>
        <EmailInput />
        <PasswordInput submitBehavior='submit' />
        <PasswordConfirmInput />
        <CustomButton label='회원가입' onPress={signupform.handleSubmit(onSubmit)} />

        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>이미 계정이 있으신가요?</Text>
          <Pressable>
            <Text style={styles.loginLink} onPress={() => router.navigate('/auth/Login')}>
              로그인
            </Text>
          </Pressable>
        </View>
      </View>
    </FormProvider>
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
