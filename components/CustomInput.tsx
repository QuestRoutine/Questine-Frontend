import { QuestineColors } from '@/constants/Colors';
import { ForwardedRef } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
interface CustomInputProps extends TextInputProps {
  label?: string;
  variant?: 'filled' | 'standard' | 'outlined';
  error?: string;
  success?: boolean;
  successMessage?: string;
  ref?: ForwardedRef<TextInput>;
}
export default function CustomInput({
  label,
  variant = 'filled',
  error,
  success,
  successMessage,
  ref,
  ...props
}: CustomInputProps) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.container, styles[variant]]}>
        <TextInput
          placeholderTextColor={QuestineColors.GRAY_500}
          style={styles.input}
          autoCapitalize='none'
          spellCheck={false}
          autoCorrect={false}
          ref={ref}
          {...props}
        />
      </View>
      {Boolean(error) && <Text style={styles.error}>{error}</Text>}
      {Boolean(success) && <Text style={styles.success}>{successMessage}</Text>}
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: QuestineColors.GRAY_700,
    marginBottom: 8,
  },
  filled: {
    backgroundColor: QuestineColors.GRAY_100,
    borderWidth: 1,
    borderColor: QuestineColors.GRAY_200,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: QuestineColors.GRAY_300,
  },
  standard: {
    borderBottomWidth: 1,
    borderBottomColor: QuestineColors.GRAY_300,
    borderRadius: 0,
  },
  input: {
    fontSize: 16,
    padding: 0,
    flex: 1,
    height: '100%',
    color: QuestineColors.GRAY_900,
  },
  error: {
    fontSize: 12,
    marginTop: 5,
    color: QuestineColors.RED_500,
  },
  success: {
    fontSize: 12,
    marginTop: 5,
    color: QuestineColors.GREEN_600,
  },
  inputError: {
    backgroundColor: QuestineColors.RED_100,
    borderColor: QuestineColors.RED_300,
  },
});
