import { QuestineColors } from '@/constants/Colors';
import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';

export interface CustomToastProps {
  text1?: string;
  text2?: string;
  props?: {
    icon?: string;
    color?: string;
  };
}

export default function CustomToast({ text1, text2, props }: CustomToastProps) {
  return (
    <View
      style={[
        styles.container,
        props?.color ? { borderLeftColor: props.color, shadowColor: props.color } : null,
        Platform.OS === 'ios' ? styles.iosShadow : styles.androidShadow,
      ]}
    >
      {props?.icon && (
        <Image
          source={typeof props.icon === 'string' ? { uri: props.icon } : props.icon}
          style={styles.icon}
          resizeMode='contain'
        />
      )}
      <View style={styles.textContainer}>
        {text1 ? <Text style={styles.text1}>{text1}</Text> : null}
        {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderLeftWidth: 5,
    borderLeftColor: QuestineColors.BLUE_300,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 8,
    minWidth: 350,
    maxWidth: 350,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  iosShadow: {
    shadowColor: QuestineColors.BLUE_300,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  androidShadow: {
    elevation: 3,
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontWeight: '700',
    fontSize: 16,
    color: QuestineColors.GRAY_900,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  text2: {
    fontSize: 14,
    color: QuestineColors.GRAY_600,
    marginTop: 2,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
});
