import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useSchedules } from '../context/SchedulesContext';
import {
  SavedPreset,
  createPreset,
  deletePreset,
  getPreset,
  getToken,
  getUsername,
  listPresets,
  loadSession,
  login,
  logout,
  onSessionExpired,
} from '../utils/api';
import {
  appToPresetSchedule,
  presetToAppSchedule,
} from '../utils/presetShape';

export default function SavedSchedulesScreen() {
  const navigation = useNavigation<any>();
  const { draftSchedules, replaceDraft } = useSchedules();

  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  /* sign-in form */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  /* presets */
  const [presets, setPresets] = useState<SavedPreset[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [saveName, setSaveName] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setListError(null);
    try {
      setPresets(await listPresets());
    } catch (e: any) {
      setPresets([]);
      setListError(`Failed to load: ${e?.message ?? e}`);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadSession();
      const t = !!getToken();
      setSignedIn(t);
      setReady(true);
      if (t) refresh();
    })();
    return onSessionExpired(() => setSignedIn(false));
  }, [refresh]);

  const handleSignIn = async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await login(username.trim(), password);
      setPassword('');
      setSignedIn(true);
      refresh();
    } catch (e: any) {
      setAuthError(e?.message ?? 'Sign in failed');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setSignedIn(false);
    setPresets(null);
  };

  const handleSave = async () => {
    const name = saveName.trim();
    if (!name) {
      Alert.alert('Name required', 'Enter a name for this schedule set.');
      return;
    }
    if (!draftSchedules.length) {
      Alert.alert('Nothing to save', 'Add at least one schedule first.');
      return;
    }
    setBusy(true);
    try {
      // Stored in the website's snake_case shape, so presets are
      // interchangeable with configure.html.
      await createPreset(name, draftSchedules.map(appToPresetSchedule));
      setSaveName('');
      refresh();
    } catch (e: any) {
      Alert.alert('Save failed', e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleLoad = async (p: SavedPreset) => {
    const doLoad = async () => {
      setBusy(true);
      try {
        const full = await getPreset(p.id);
        const schedules = Array.isArray(full.schedules) ? full.schedules : [];
        if (!schedules.length) {
          Alert.alert('Empty preset', 'This preset has no schedules.');
          return;
        }
        replaceDraft(schedules.map(presetToAppSchedule));
        navigation.goBack();
      } catch (e: any) {
        Alert.alert('Load failed', e?.message ?? String(e));
      } finally {
        setBusy(false);
      }
    };
    if (draftSchedules.length) {
      Alert.alert(
        'Replace current set?',
        `Replace the current ${draftSchedules.length} schedule${
          draftSchedules.length === 1 ? '' : 's'
        } with "${p.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Replace', onPress: doLoad },
        ],
      );
    } else {
      doLoad();
    }
  };

  const handleDelete = (p: SavedPreset) => {
    Alert.alert('Delete?', `Delete "${p.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePreset(p.id);
            refresh();
          } catch (e: any) {
            Alert.alert('Delete failed', e?.message ?? String(e));
          }
        },
      },
    ]);
  };

  if (!ready) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#f8b26a" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.rowBetween}>
        <Text style={styles.header}>SAVED SCHEDULES</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Done</Text>
        </TouchableOpacity>
      </View>

      {!signedIn ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign in</Text>
          <Text style={styles.helper}>
            Presets are stored in your CollarID account and shared with the
            website configurator.
          </Text>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="username"
            placeholderTextColor="#999"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#999"
          />
          {authError && <Text style={styles.errorText}>{authError}</Text>}
          <TouchableOpacity
            style={[styles.primaryBtn, authBusy && styles.btnDisabled]}
            onPress={handleSignIn}
            disabled={authBusy}
          >
            <Text style={styles.primaryBtnText}>
              {authBusy ? 'Signing in…' : 'Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.helper}>
              Signed in as {getUsername() ?? 'user'}
            </Text>
            <TouchableOpacity onPress={handleSignOut}>
              <Text style={styles.linkText}>Sign out</Text>
            </TouchableOpacity>
          </View>

          {/* Save current set */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Save current set</Text>
            <View style={styles.rowGap}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={saveName}
                onChangeText={setSaveName}
                placeholder="e.g. Elephant — dry season"
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={[styles.smallBtnPrimary, busy && styles.btnDisabled]}
                onPress={handleSave}
                disabled={busy}
              >
                <Text style={styles.primaryBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helper}>
              Saves the {draftSchedules.length} draft schedule
              {draftSchedules.length === 1 ? '' : 's'} currently on the
              Schedules tab.
            </Text>
          </View>

          {/* Existing presets */}
          <Text style={styles.sectionHead}>Your saved schedules</Text>
          {listError && <Text style={styles.errorText}>{listError}</Text>}
          {presets === null ? (
            <ActivityIndicator color="#f8b26a" />
          ) : presets.length === 0 && !listError ? (
            <Text style={styles.helper}>No saved schedules yet.</Text>
          ) : (
            presets.map(p => {
              const n = Array.isArray(p.schedules) ? p.schedules.length : 0;
              const updated = p.updated_at
                ? new Date(p.updated_at).toLocaleDateString()
                : '';
              const ownerTag =
                !p.is_owner && p.owner_username ? ` · ${p.owner_username}` : '';
              return (
                <View key={p.id} style={styles.card}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.cardTitle}>{p.name}</Text>
                      <Text style={styles.helper}>
                        {n} schedule{n === 1 ? '' : 's'}
                        {updated ? ` · ${updated}` : ''}
                        {ownerTag}
                      </Text>
                    </View>
                    <View style={styles.rowGap}>
                      <TouchableOpacity
                        style={styles.smallBtn}
                        onPress={() => handleLoad(p)}
                      >
                        <Text style={styles.smallBtnText}>Load</Text>
                      </TouchableOpacity>
                      {p.is_owner !== false && (
                        <TouchableOpacity
                          style={[styles.smallBtn, styles.dangerBtn]}
                          onPress={() => handleDelete(p)}
                        >
                          <Text style={styles.dangerBtnText}>Delete</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  content: { paddingBottom: 50 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sectionHead: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 4,
  },
  helper: { fontSize: 12, color: '#6B7280', marginTop: 4, flexShrink: 1 },
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowGap: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  linkText: { fontSize: 14, color: '#4A90D9', fontWeight: '600' },
  primaryBtn: {
    backgroundColor: '#FDC996',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  smallBtnPrimary: {
    backgroundColor: '#FDC996',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  smallBtn: {
    backgroundColor: '#EFEFEF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  smallBtnText: { color: '#111', fontWeight: '600', fontSize: 13 },
  dangerBtn: { backgroundColor: '#FEE2E2' },
  dangerBtnText: { color: '#B91C1C', fontWeight: '700', fontSize: 13 },
  btnDisabled: { opacity: 0.5 },
  errorText: { color: '#B91C1C', fontSize: 13, marginTop: 8 },
});
