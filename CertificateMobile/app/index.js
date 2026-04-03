import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Award, Lock, User, KeyRound, ShieldAlert } from 'lucide-react-native';
import { theme } from '../src/theme';
import { useCertification } from '../src/CertificationContext';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { setIsAuthenticated } = useCertification();

  const handleLogin = () => {
    setIsAuthenticating(true);
    setError('');
    
    // Simulate network delay for effect
    setTimeout(() => {
        if (username === 'admin' && password === 'admin123') {
            setIsAuthenticated(true);
            router.replace('/template');
        } else {
            setError('ACCESS DENIED. Invalid security clearance.');
            setIsAuthenticating(false);
        }
    }, 1000);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View className="login-card" style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
               <View style={styles.iconGlow} />
               <View style={styles.icon}>
                  <Award size={32} color="white" />
               </View>
            </View>
            <Text style={styles.title}>PRECISION STUDIO</Text>
            <Text style={styles.subtitle}>SECURE TERMINAL ACCESS</Text>
          </View>
          
          <View style={styles.form}>
            {error ? (
              <View style={styles.errorContainer}>
                <ShieldAlert size={16} color={theme.colors.accentRose} /> 
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
            <View style={styles.inputGroup}>
               <Text style={styles.label}>ADMINISTRATOR ID</Text>
               <View style={styles.inputWrapper}>
                  <User size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="Enter Admin ID"
                    placeholderTextColor={theme.colors.textMuted}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    editable={!isAuthenticating}
                  />
               </View>
            </View>
            
            <View style={styles.inputGroup}>
               <Text style={styles.label}>SECURITY KEY</Text>
               <View style={styles.inputWrapper}>
                  <Lock size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="Enter access key"
                    placeholderTextColor={theme.colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!isAuthenticating}
                  />
               </View>
            </View>

            <TouchableOpacity 
              onPress={handleLogin} 
              disabled={isAuthenticating} 
              style={[styles.button, isAuthenticating && { opacity: 0.7 }]}
            >
              <KeyRound size={18} color="white" /> 
              <Text style={styles.buttonText}>{isAuthenticating ? 'AUTHENTICATING...' : 'INITIALIZE SESSION'}</Text>
            </TouchableOpacity>
            
            <View style={styles.footer}>
               <Text style={styles.footerText}>Authorized personnel only.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgCore,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.m,
  },
  card: {
    backgroundColor: theme.colors.bgPanelSolid,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  iconGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.accentIndigo,
    borderRadius: theme.borderRadius.m,
    opacity: 0.3,
  },
  icon: {
    backgroundColor: '#0f172a',
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.accentCyan,
    letterSpacing: 3,
    marginTop: theme.spacing.xs,
  },
  form: {
    gap: theme.spacing.l,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    gap: theme.spacing.s,
  },
  errorText: {
    color: theme.colors.accentRose,
    fontSize: 12,
    fontWeight: '700',
  },
  inputGroup: {
    gap: theme.spacing.s,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
  },
  inputIcon: {
    marginRight: theme.spacing.s,
  },
  input: {
    flex: 1,
    height: 48,
    color: 'white',
    fontSize: 14,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: theme.colors.accentIndigo,
    height: 56,
    borderRadius: theme.borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.m,
  },
  buttonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  footer: {
    marginTop: theme.spacing.m,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
});
