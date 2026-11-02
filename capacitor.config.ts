/**
 * Capacitor Configuration for RentEasy Android & iOS Mobile Application
 */
export default {
  appId: 'com.renteasy.app',
  appName: 'RentEasy',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#167B62',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#167B62'
    }
  }
};
