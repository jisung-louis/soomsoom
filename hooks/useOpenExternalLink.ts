import { Linking } from 'react-native';
import { useToast } from './useToast';

export function useOpenExternalLink() {
  const { showToast } = useToast();

  const open = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        showToast({ message: '지원되지 않는 링크 형식이에요.' });
      }
    } catch (error) {
      showToast({ message: '링크를 여는 중 문제가 발생했어요.' });
    }
  };

  return open;
}
