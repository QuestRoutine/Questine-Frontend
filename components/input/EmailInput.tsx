import CustomInput from '../CustomInput';
import { Controller, useFormContext } from 'react-hook-form';
export default function EmailInput() {
  const { control, setFocus } = useFormContext();
  return (
    <Controller
      name='email'
      control={control}
      rules={{
        validate: (data: string) => {
          if (!data) {
            return '이메일을 입력하세요.';
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) {
            return '올바른 이메일 형식이 아닙니다.';
          }
          return true;
        },
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <CustomInput
          autoFocus
          label='이메일'
          placeholder='이메일을 입력하세요'
          value={value}
          onChangeText={onChange}
          error={error?.message}
          returnKeyType='next'
          submitBehavior='submit'
          onSubmitEditing={() => {
            setFocus('password');
          }}
          inputMode='email'
        />
      )}
    />
  );
}
