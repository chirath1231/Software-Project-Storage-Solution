import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen"; // create later
import RegisterScreen from "../screens/RegisterScreen"; // optional
import SubscriptionScreen from "../screens/SubscriptionScreen";
import PayHereScreen from "../screens/PayHereScreen";



const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="PayHereScreen" component={PayHereScreen} />
        <Stack.Screen name="SubscriptionScreen" component={SubscriptionScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
