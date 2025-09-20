
import { View, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/commonStyles';

interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  style?: object;
  color?: string;
  useAdobeAsset?: boolean;
}

export default function Icon({ name, size = 40, style, color = "black", useAdobeAsset = false }: IconProps) {
  // Use Adobe asset for specific icons or when explicitly requested
  if (useAdobeAsset || name === 'create' || name === 'add' || name === 'calendar') {
    return (
      <View style={[styles.iconContainer, style]}>
        <Image
          source={{ uri: 'https://assets.adobe.com/id/urn:aaid:sc:US:5211f370-3b76-4574-8bdc-9899e22dd324?view=published' }}
          style={{
            width: size,
            height: size,
            tintColor: color,
          }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={[styles.iconContainer, style]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
