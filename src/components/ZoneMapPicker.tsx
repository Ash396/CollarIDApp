// Map-based corner picker for a zone: the website's gfOpenMapPicker in a
// WebView (utils/zoneMapHtml.ts is the page). Tap to drop corners, drag to
// adjust, Undo / Clear, then "Use these corners" hands `lat, lon` lines back
// to the form — the same text path buildFenceFragments() validates, so
// typed and picked corners are interchangeable. Needs a network for the map
// library and tiles; offline, the page says to type corners instead.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { gfParseVertsText, vertsToText } from '../utils/geofence';
import type { LatLon } from '../utils/geofence';
import { MAP_VIEW_KEY, buildZoneMapHtml, parseZoneMapMessage } from '../utils/zoneMapHtml';
import type { MapView } from '../utils/zoneMapHtml';

type Props = {
  visible: boolean;
  /** The form's corner text, seeding the map. */
  vertsText: string;
  onCancel: () => void;
  /** The picked corners as `lat, lon` lines (vertsToText). */
  onUse: (vertsText: string) => void;
};

export default function ZoneMapPicker({ visible, vertsText, onCancel, onUse }: Props) {
  // Only injectJavaScript is used; the library's own ref type does not
  // survive the JSX generic inference under React 19's types.
  const webRef = useRef<{ injectJavaScript: (js: string) => void } | null>(null);
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [remembered, setRemembered] = useState<MapView | null | undefined>(undefined);
  const lastView = useRef<MapView | null>(null);

  // The remembered view is read once per open, before the page is built.
  useEffect(() => {
    if (!visible) {
      setRemembered(undefined);
      setReady(false);
      setFailed(false);
      setCount(0);
      return;
    }
    let alive = true;
    AsyncStorage.getItem(MAP_VIEW_KEY)
      .then(raw => {
        if (!alive) return;
        try {
          const v = raw ? JSON.parse(raw) : null;
          setRemembered(
            v && Array.isArray(v.center) && v.center.length === 2 && Number.isFinite(v.zoom) ? v : null,
          );
        } catch (_) {
          setRemembered(null);
        }
      })
      .catch(() => {
        if (alive) setRemembered(null);
      });
    return () => {
      alive = false;
    };
  }, [visible]);

  const seed: LatLon[] = useMemo(() => gfParseVertsText(vertsText), [vertsText]);
  const html = useMemo(
    () => (remembered === undefined ? null : buildZoneMapHtml(seed, remembered)),
    [seed, remembered],
  );

  const rememberView = () => {
    const v = lastView.current;
    if (v) AsyncStorage.setItem(MAP_VIEW_KEY, JSON.stringify(v)).catch(() => {});
  };

  const onMessage = useCallback(
    (e: WebViewMessageEvent) => {
      const m = parseZoneMapMessage(e.nativeEvent.data);
      if (!m) {
        // The page reports a load failure as {type:'error'}: not a message
        // the app acts on beyond showing the typed-corners advice.
        try {
          if (JSON.parse(e.nativeEvent.data)?.type === 'error') setFailed(true);
        } catch (_) {
          /* ignore */
        }
        return;
      }
      if (m.type === 'ready') setReady(true);
      else if (m.type === 'count') setCount(m.n);
      else if (m.type === 'view') lastView.current = m.view;
      else if (m.type === 'corners') {
        rememberView();
        onUse(vertsToText(m.corners));
      }
    },
    [onUse],
  );

  const inject = (js: string) => webRef.current?.injectJavaScript(`try{window.__gf&&window.__gf.${js}}catch(e){};true;`);
  const cancel = () => {
    rememberView();
    onCancel();
  };

  const countLine =
    `${count} corner${count === 1 ? '' : 's'}` +
    (count < 3 ? ' — tap the map to add (3–8)' : count >= 8 ? ' — max reached' : '');

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={cancel}>
      <View style={styles.container} testID="zone-map-picker">
        <View style={styles.header}>
          <Text style={styles.title}>Draw the zone</Text>
          <Text style={styles.count} testID="zone-map-count">
            {countLine}
          </Text>
        </View>
        <View style={styles.mapWrap}>
          {html ? (
            <WebView
              ref={webRef as any}
              testID="zone-map-webview"
              originWhitelist={['*']}
              source={{ html, baseUrl: 'https://collarid.org/' }}
              onMessage={onMessage}
              onError={() => setFailed(true)}
              onHttpError={() => setFailed(true)}
              javaScriptEnabled
              setSupportMultipleWindows={false}
              style={styles.webview}
            />
          ) : null}
          {failed && (
            <View style={styles.failBox} testID="zone-map-failed">
              <Text style={styles.failText}>
                Could not load the map (no internet?). Type the corners as “latitude, longitude” lines
                instead.
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.hint}>Tap adds a corner · drag a dot to move it · corners connect in the order placed.</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.btn, styles.ghostBtn]} onPress={() => inject('undo()')} testID="zone-map-undo">
            <Text style={styles.ghostBtnText}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.ghostBtn]} onPress={() => inject('clear()')} testID="zone-map-clear">
            <Text style={styles.ghostBtnText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.ghostBtn]} onPress={cancel} testID="zone-map-cancel">
            <Text style={styles.ghostBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.primaryBtn, (!ready || count < 3) && styles.btnDisabled]}
            disabled={!ready || count < 3}
            onPress={() => inject('use()')}
            testID="zone-map-use"
          >
            <Text style={styles.primaryBtnText}>Use these corners</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingTop: 54 },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  count: { marginTop: 2, fontSize: 13, color: '#6B7280' },
  mapWrap: { flex: 1, backgroundColor: '#F3F4F6' },
  webview: { flex: 1 },
  failBox: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFF',
  },
  failText: { fontSize: 15, color: '#444', textAlign: 'center', lineHeight: 21 },
  hint: { fontSize: 12, color: '#6B7280', paddingHorizontal: 16, paddingTop: 8 },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
    paddingBottom: 28,
  },
  btn: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { backgroundColor: '#FDC996', flexGrow: 1 },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  ghostBtn: { backgroundColor: '#EFEFEF' },
  ghostBtnText: { color: '#111', fontWeight: '600', fontSize: 15 },
  btnDisabled: { opacity: 0.4 },
});
