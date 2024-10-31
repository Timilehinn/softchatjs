import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import { ChatProvider } from "softchatjs-react-native"
import { Platform } from 'react-native';
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';


export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(main)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

// const client = ChatClient.getInstance({ apiKey: '1234', projectId: '5909b61d-e6be-47b5-bb54-a60e56344580' });

function RootLayoutNav() {

  const colorScheme = useColorScheme();
  // const chatUser = Platform.OS === 'android'? { id: '69', username: 'oscar' } : { id: '19', username: 'timi' }
  // client.initializeUser(chatUser);

  // useEffect(() => {
  //   if(client.connection){
  //     client.connection.on(Events.CONNECTION_CHANGED, (event) => {
  //       console.log(event, '---CONNECTION_CHANGED')
  //     })
  
  //     client.connection.on(Events.CONVERSATION_LIST_CHANGED, (event) => {
  //       console.log(event, '---CONVERSATION_LIST_CHANGED')
  //     })
  //   }
  
  //   },[client])

  return (
    <ChatProvider
      subId='ef066542-6e13-4f25-a6c3-d3e3671e4662'
      projectId='5909b61d-e6be-47b5-bb54-a60e56344580'
      // theme={{
      //   background: {
      //     primary: '#FFFFFF', // White background for light mode
      //     secondary: '#F5F5F5', // Light grey for secondary background
      //     disabled: '#F5F5F5'
      //   },
      //   text: {
      //     primary: '#000000', // Black text for high contrast
      //     secondary: '#4A4A4A', // Dark grey for secondary text
      //     disabled: '#9E9E9E', // Light grey for disabled text
      //   },
      //   action: {
      //     primary: '#4F9ED0', // Dark teal for primary action buttons
      //     secondary: '#4F9ED0', // Light teal for secondary action buttons
      //   },
      //   chatBubble: {
      //     left: {
      //       bgColor: '#F0F0F0', // Light grey for incoming message background
      //       messageColor: '#212121', // Dark grey for incoming message text
      //       messageTimeColor: '#757575', // Medium grey for message time
      //       replyBorderColor: 'red'
      //     },
      //     right: {
      //       bgColor: '#4F9ED0', // Light teal for outgoing message background
      //       messageColor: 'white', // Black for outgoing message text
      //       messageTimeColor: 'lightgrey', // Medium grey for message time
      //       replyBorderColor: 'green'
      //     }
      //   },
      //   icon: '#4F9ED0', // Dark grey for icons
      //   divider: '#E0E0E0', // Light grey for dividers
      // }}
    >
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
    </ChatProvider>
  );
}
