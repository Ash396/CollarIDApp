// Map tab: collarid.org's live map, signed in with the app's session.
// All the rules (what is injected, where the WebView may go, which messages
// count) live in utils/liveMap.ts, where they are unit-tested.
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type {
  ShouldStartLoadRequest,
  WebViewMessageEvent,
} from 'react-native-webview/lib/WebViewTypes';
import { useNavigation } from '@react-navigation/native';
import { getRole, getToken, verifySession } from '../utils/api';
import { useSession } from '../utils/useSession';
import {
  LIVE_MAP_URL,
  buildSessionInjection,
  decideNavigation,
  parseMapMessage,
} from '../utils/liveMap';

export default function LiveMapScreen() {
  const navigation = useNavigation<any>();
  const session = useSession();
  // Bumped by Reload: a brand-new (incognito) WebView, injected afresh.
  const [reloadCount, setReloadCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  // One automatic rebuild per session when the page reports an expiry the
  // server does not confirm — never a loop.
  const autoRetriedRef = useRef<number | null>(null);

  const reload = useCallback(() => {
    setLoadError(null);
    setReloadCount(n => n + 1);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: session.signedIn
        ? () => (
            <TouchableOpacity
              onPress={reload}
              style={styles.headerBtn}
              accessibilityRole="button"
              testID="map-reload"
            >
              <Text style={styles.headerBtnText}>Reload</Text>
            </TouchableOpacity>
          )
        : undefined,
    });
  }, [navigation, session.signedIn, reload]);

  // Rebuilt per session (generation), never from a stale token.
  const injection = useMemo(
    () =>
      session.signedIn
        ? buildSessionInjection({ token: getToken(), role: getRole() })
        : buildSessionInjection(null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session.signedIn, session.generation],
  );

  const onShouldStartLoadWithRequest = useCallback(
    (req: ShouldStartLoadRequest) => {
      const d = decideNavigation(req);
      if (d.openExternally) Linking.openURL(req.url).catch(() => {});
      return d.allow;
    },
    [],
  );

  const onMessage = useCallback(
    async (e: WebViewMessageEvent) => {
      const msg = parseMapMessage(e.nativeEvent.data, e.nativeEvent.url);
      if (msg !== 'session-expired') return;
      // The page dropped its token after a 401. Ask the server ourselves: if
      // the token really is finished, verifySession() ends the app session
      // (same as any other 401) and this tab switches to the sign-in prompt.
      const gen = session.generation;
      const v = await verifySession();
      if (v === 'valid' && autoRetriedRef.current !== gen) {
        autoRetriedRef.current = gen;
        reload();
      }
    },
    [session.generation, reload],
  );

  if (!session.ready) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#f8b26a" />
      </View>
    );
  }

  if (!session.signedIn) {
    return (
      <View style={[styles.container, styles.center]} testID="map-signed-out">
        <Text style={styles.promptTitle}>Live map</Text>
        <Text style={styles.promptText}>
          Sign in with your CollarID account on the Home tab to see your
          collars on the live map.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Home')}
          accessibilityRole="button"
          testID="map-go-home"
        >
          <Text style={styles.primaryBtnText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        key={`${session.generation}-${reloadCount}`}
        testID="map-webview"
        source={{ uri: LIVE_MAP_URL }}
        // Nothing (localStorage, cookies, cache) outlives this WebView, so
        // nothing survives a sign-out or a switch of account.
        incognito
        injectedJavaScriptBeforeContentLoaded={injection}
        injectedJavaScriptBeforeContentLoadedForMainFrameOnly
        // Every navigation goes through decideNavigation() (the library's
        // whitelist would otherwise hand some URLs to Safari by itself).
        originWhitelist={['*']}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onMessage={onMessage}
        onError={() => {
          /* renderError below says it; the default would log the event */
        }}
        renderError={() => (
          <View
            style={[StyleSheet.absoluteFill, styles.center, styles.container]}
            testID="map-load-failed"
          >
            <Text style={styles.promptText}>
              Could not load the live map. Check your connection.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={reload}
              accessibilityRole="button"
            >
              <Text style={styles.primaryBtnText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}
        onHttpError={e =>
          setLoadError(
            `The live map did not load (HTTP ${e.nativeEvent.statusCode}).`,
          )
        }
        onLoadStart={() => setLoadError(null)}
        startInLoadingState
        renderLoading={() => (
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <ActivityIndicator size="large" color="#f8b26a" />
          </View>
        )}
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
        style={styles.webview}
      />
      {loadError && (
        <View style={styles.errorBar} testID="map-error">
          <Text style={styles.errorText}>{loadError}</Text>
          <TouchableOpacity onPress={reload} accessibilityRole="button">
            <Text style={styles.linkText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  webview: { flex: 1 },
  promptTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 320,
  },
  primaryBtn: {
    backgroundColor: '#FDC996',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  headerBtn: { paddingHorizontal: 14, paddingVertical: 6 },
  headerBtnText: { color: '#2E7D32', fontWeight: '600', fontSize: 15 },
  errorBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  errorText: { color: '#9A3412', fontSize: 13, flex: 1 },
  linkText: { fontSize: 14, color: '#4A90D9', fontWeight: '600' },
});
