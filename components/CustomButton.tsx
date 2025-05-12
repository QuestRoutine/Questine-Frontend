import { QuestineColors } from '@/constants/Colors';
import { Text, Pressable, StyleSheet, PressableProps } from 'react-native';

interface CustomButtonProps extends PressableProps {
  label: string;
  size?: 'md' | 'lg';
  variant?: 'filled';
  loginType?: 'email' | 'kakao';
}

const CustomButton = ({ label, size = 'lg', variant = 'filled', loginType = 'email', ...props }: CustomButtonProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        styles[size],
        loginType === 'kakao' ? styles.kakao : styles.email,
        pressed && styles.pressed,
      ]}
      {...props}
    >
      <Text style={[styles.filled, loginType === 'kakao' && styles.kakaoText]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lg: {
    width: '100%',
    height: 44,
  },
  md: {
    width: '100%',
  },
  filled: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pressed: {
    opacity: 0.8,
  },
  email: {
    backgroundColor: QuestineColors.PINK_400,
  },
  kakao: {
    backgroundColor: '#FAE100',
  },
  kakaoText: {
    color: QuestineColors.BLACK,
  },
});

export default CustomButton;
