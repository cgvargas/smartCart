import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ShoppingScreen from '../screens/ShoppingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanScreen from '../screens/ScanScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import AddPaymentScreen from '../screens/payment/AddPaymentScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import AlertSettingsScreen from '../screens/profile/AlertSettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import PrivacyScreen from '../screens/profile/PrivacyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Icon Component
function TabIcon({ label, focused }) {
    const emojis = {
        'Início': '🏠',
        'Início': '🏠',
        'Compras': '🛒',
        'Dashboard': '📊',
        'Perfil': '👤',
    };

    return (
        <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: focused ? '#1A237E' : 'transparent',
        }}>
            <Text style={{
                fontSize: 28,
            }}>
                {emojis[label]}
            </Text>
        </View>
    );
}

// Bottom Tab Navigator
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 70,
                    paddingTop: 8,
                    paddingBottom: 8,
                    backgroundColor: '#fff',
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                },
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="Início" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Shopping"
                component={ShoppingScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="Compras" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="Perfil" focused={focused} />,
                }}
            />
        </Tab.Navigator>
    );
}

// Auth Stack Navigator
function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}

// App Stack (Tabs + Modal Screens)
function AppStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                headerStyle: {
                    backgroundColor: '#1A237E',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: '600',
                },
            }}
        >
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
                name="Scan"
                component={ScanScreen}
                options={{
                    presentation: 'fullScreenModal',
                    animation: 'slide_from_bottom',
                }}
            />
            <Stack.Screen
                name="Payments"
                component={PaymentScreen}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="AddPayment"
                component={AddPaymentScreen}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="AlertSettings"
                component={AlertSettingsScreen}
                options={{
                    headerShown: true,
                    title: 'Alerta de Orçamento',
                }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

// Main Navigator
export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A237E' }}>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>SmartCart</Text>
                <Text style={{ color: '#fff', marginTop: 10 }}>Carregando...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
}
