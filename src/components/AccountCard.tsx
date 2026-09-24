// Home screen account card: sign in with the collarid.org account once, and
// the whole app has it — Saved schedules, the Map tab, and the radio
// editor's "Load from CollarID server".
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login, logout, onSessionExpired } from '../utils/api';
import { useSession } from '../utils/useSession';

export default function AccountCard() {
  const navigation = useNavigation<any>();
  const session = useSession();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  // Say why the card went back to the sign-in form.
  useEffect(
    () =>
      onSessionExpired(() =>
        setError('Your sign-in expired. Sign in again to continue.'),
      ),
    [],
  );

  const handleSignIn = async () => {
    if (busy) return;
    const u = username.trim();
    if (!u || !password) {
      setError('Enter your username and password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await login(u, password);
      setPassword('');
      setShowPassword(false);
    } catch (e: any) {
      setError(e?.message ?? 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    await logout();
  };

  if (!session.ready) {
    return (
      <View style={styles.card} testID="account-card-loading">
        <ActivityIndicator color="#f8b26a" />
      </View>
    );
  }

  if (session.signedIn) {
    return (
      <View style={styles.card} testID="account-card-signed-in">
        <View style={styles.rowBetween}>
          <Text style={styles.signedInText} numberOfLines={1}>
            Signed in as{' '}
            <Text style={styles.username}>{session.username ?? 'user'}</Text>
            {session.isAdmin ? <Text style={styles.role}> · admin</Text> : null}
          </Text>
          <TouchableOpacity
            onPress={handleSignOut}
            accessibilityRole="button"
            testID="account-sign-out"
          >
            <Text style={styles.linkText}>Sign out</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.shortcutRow}>
          <TouchableOpacity
            style={styles.shortcut}
            accessibilityRole="button"
            testID="account-open-saved"
            onPress={() =>
              // initial:false keeps the Schedules list under it, so "Done"
              // lands there instead of leaving the tab.
              navigation.navigate('SchedulesTab', {
                screen: 'SavedSchedules',
                initial: false,
              })
            }
          >
            <Text style={styles.shortcutText}>📅 Saved schedules</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shortcut}
            accessibilityRole="button"
            testID="account-open-map"
            onPress={() => navigation.navigate('MapTab')}
          >
            <Text style={styles.shortcutText}>🗺️ Live map</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card} testID="account-card-signed-out">
      <Text style={styles.cardTitle}>Sign in to CollarID</Text>
      <Text style={styles.helper}>
        Use your collarid.org account for saved schedules, the live map, and
        your collars' LoRaWAN keys.
      </Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="username"
        placeholderTextColor="#999"
        textContentType="username"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
        editable={!busy}
        testID="account-username"
      />

      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordRow}>
        <TextInput
          ref={passwordRef}
          style={[styles.input, styles.passwordInput]}
          value={password}
          onChangeText={setPassword}
          placeholder="password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          textContentType="password"
          autoComplete="current-password"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="go"
          onSubmitEditing={handleSignIn}
          editable={!busy}
          testID="account-password"
        />
        <TouchableOpacity
          style={styles.showBtn}
          onPress={() => setShowPassword(v => !v)}
          accessibilityRole="button"
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          testID="account-toggle-password"
        >
          <Text style={styles.linkText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <Text style={styles.errorText} testID="account-error">
          {error}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.primaryBtn, busy && styles.btnDisabled]}
        onPress={handleSignIn}
        disabled={busy}
        accessibilityRole="button"
        testID="account-sign-in"
      >
        <Text style={styles.primaryBtnText}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  helper: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#FFF',
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  passwordInput: { flex: 1 },
  showBtn: { paddingVertical: 9, paddingHorizontal: 6 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  signedInText: { fontSize: 14, color: '#374151', flexShrink: 1 },
  username: { fontWeight: '700', color: '#111' },
  role: { color: '#6B7280' },
  shortcutRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  shortcut: {
    flex: 1,
    backgroundColor: '#EFEFEF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  shortcutText: { color: '#111', fontWeight: '600', fontSize: 14 },
  linkText: { fontSize: 14, color: '#4A90D9', fontWeight: '600' },
  primaryBtn: {
    backgroundColor: '#FDC996',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  btnDisabled: { opacity: 0.5 },
  errorText: { color: '#B91C1C', fontSize: 13, marginTop: 8 },
});
