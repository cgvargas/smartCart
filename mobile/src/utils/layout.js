/**
 * Layout utilities
 * Safe area and status bar helpers
 */

import { Platform, StatusBar } from 'react-native';

// Get the status bar height for Android
export const getStatusBarHeight = () => {
    if (Platform.OS === 'android') {
        return StatusBar.currentHeight || 24;
    }
    return 0;
};

// Standard header padding that accounts for status bar
export const HEADER_PADDING_TOP = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 24) + 15
    : 60;

export default {
    getStatusBarHeight,
    HEADER_PADDING_TOP,
};
