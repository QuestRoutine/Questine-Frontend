import CustomInput from '../CustomInput';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
export default function PasswordConfirmInput() {
  const { control } = useFormContext();
  const password = useWatch({ control, name: 'password' });

  return (
    <Controller
      name='passwordConfirm'
      control={control}
      rules={{
        validate: (data: string) => {
          if (data !== password) {
            return '비밀번호가 일치하지 않습니다.';
          }
        },
      }}
      render={({ field: { ref, onChange, value }, fieldState: { error } }) => {
        const success = !error && !!value && value === password;
        return (
          <CustomInput
            label='비밀번호 확인'
            placeholder='비밀번호를 다시 입력하세요'
            value={value}
            onChangeText={onChange}
            secureTextEntry
            error={error?.message}
            success={success}
            successMessage='비밀번호가 일치합니다.'
            textContentType='oneTimeCode'
            ref={ref}
          />
        );
      }}
    />
  );
}
