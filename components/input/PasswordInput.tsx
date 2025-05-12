import { TextInputProps } from 'react-native';
import CustomInput from '../CustomInput';
import { Controller, useFormContext } from 'react-hook-form';
export default function PasswordInput({
  submitBehavior = 'blurAndSubmit',
}: {
  submitBehavior?: TextInputProps['submitBehavior'];
}) {
  const { control, setFocus } = useFormContext();
  return (
    <Controller
      name='password'
      control={control}
      rules={{
        validate: (data: string) => {
          if (data.length < 8) {
            return '비밀번호를 8자 이상 입력해주세요.';
          }
        },
      }}
      render={({ field: { ref, onChange, value }, fieldState: { error } }) => (
        <CustomInput
          label='비밀번호'
          placeholder='비밀번호를 입력하세요'
          value={value}
          onChangeText={onChange}
          error={error?.message}
          secureTextEntry
          textContentType='oneTimeCode'
          returnKeyType='next'
          submitBehavior={submitBehavior}
          ref={ref}
          onSubmitEditing={() => {
            setFocus('passwordConfirm');
          }}
        />
      )}
    />
  );
}
