/**
 * "Load from CollarID server": GET /devices/{uid}/config onto the radio
 * editor's fields, the way configure.html prepopulateFromServer() fills the
 * website's radio form from the same reply:
 *
 *   website element            server field        app field
 *   r-wan-region  (0/1/2)      region US915/AU915/EU868   lorawanRegion
 *   r-wan-auth    (0=OTAA/1=ABP) supports_otaa     lorawanAuth
 *   r-otaa-deveui              dev_eui             devEui
 *   r-otaa-joineui             join_eui            joinEui
 *   r-otaa-appkey              app_key             appKey
 *   r-otaa-nwkkey              nwk_key             nwkKey
 *   r-abp-devaddr              dev_addr            devAddr
 *   r-abp-nwkskey              nwk_s_enc_key       nwkSKey
 *   r-abp-appskey              app_s_key           appSKey
 *   r-abp-fnwk                 f_nwk_s_int_key     fNwkSIntKey
 *   r-abp-snwk                 s_nwk_s_int_key     sNwkSIntKey
 *
 * Every key below is an obviously fake repeated pattern.
 */

export {}; // a module: its helpers stay out of other test files' scope

type Api = typeof import('../src/utils/api');
type Srv = typeof import('../src/utils/serverRadioConfig');

const OTAA_REPLY = {
  configured: true,
  name: 'CollarID-0006001B',
  region: 'US915',
  supports_otaa: true,
  dev_eui: '0101010101010101',
  join_eui: '0202020202020202',
  app_key: 'aa'.repeat(16),
  nwk_key: 'bb'.repeat(16),
  // Session keys ChirpStack also returns after a join: the website ignores
  // them for an OTAA device, so must we.
  dev_addr: '0c0c0c0c',
  nwk_s_enc_key: 'dd'.repeat(16),
  app_s_key: 'ee'.repeat(16),
  f_nwk_s_int_key: 'f1'.repeat(16),
  s_nwk_s_int_key: 'f2'.repeat(16),
};

const ABP_REPLY = {
  configured: true,
  region: 'EU868',
  supports_otaa: false,
  dev_eui: '0101010101010101',
  join_eui: '0000000000000000',
  dev_addr: '0c0c0c0c',
  nwk_s_enc_key: 'dd'.repeat(16),
  app_s_key: 'ee'.repeat(16),
  f_nwk_s_int_key: 'f1'.repeat(16),
  s_nwk_s_int_key: 'f2'.repeat(16),
};

function resp(status: number, body?: any) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (body === undefined) throw new Error('no body');
      return body;
    },
  };
}

let api: Api;
let srv: Srv;
let fetchMock: jest.Mock;

beforeEach(() => {
  jest.resetModules();
  api = require('../src/utils/api');
  srv = require('../src/utils/serverRadioConfig');
  require('react-native-keychain').__reset();
  fetchMock = jest.fn();
  (globalThis as any).fetch = fetchMock;
});

afterEach(() => jest.restoreAllMocks());

async function signIn(username = 'field-team') {
  fetchMock.mockResolvedValueOnce(resp(200, { token: 'fake-token-for-tests', role: 'user' }));
  await api.login(username, 'not-a-real-password');
  fetchMock.mockClear();
}

describe('serverConfigToRadioForm (configure.html mapping)', () => {
  it('OTAA: region, auth and all four OTAA fields; ABP fields untouched', () => {
    const { patch, missing, unsupportedRegion } =
      srv.serverConfigToRadioForm(OTAA_REPLY);
    expect(patch).toEqual({
      region: 'REGION_US915',
      auth: 'AUTH_OTAA',
      devEui: '0101010101010101',
      joinEui: '0202020202020202',
      appKey: 'AA'.repeat(16),
      nwkKey: 'BB'.repeat(16),
    });
    expect(missing).toEqual([]);
    expect(unsupportedRegion).toBeUndefined();
  });

  it('ABP: region, auth and all five ABP fields (nwk_s_enc_key -> nwkSKey); OTAA fields untouched', () => {
    const { patch, missing } = srv.serverConfigToRadioForm(ABP_REPLY);
    expect(patch).toEqual({
      region: 'REGION_EU868',
      auth: 'AUTH_ABP',
      devAddr: '0C0C0C0C',
      nwkSKey: 'DD'.repeat(16),
      appSKey: 'EE'.repeat(16),
      fNwkSIntKey: 'F1'.repeat(16),
      sNwkSIntKey: 'F2'.repeat(16),
    });
    expect(missing).toEqual([]);
  });

  it('maps exactly the three regions the website maps', () => {
    const r = (region: string) =>
      srv.serverConfigToRadioForm({ region, supports_otaa: true }).patch.region;
    expect(r('US915')).toBe('REGION_US915');
    expect(r('AU915')).toBe('REGION_AU915');
    expect(r('EU868')).toBe('REGION_EU868');
    // ChirpStack's other regions, and the server's unknown(n), leave it alone.
    expect(r('AS923')).toBeUndefined();
    expect(r('unknown(99)')).toBeUndefined();
    expect(r('constructor')).toBeUndefined();
    expect(
      srv.serverConfigToRadioForm({ region: 'AS923', supports_otaa: true })
        .unsupportedRegion,
    ).toBe('AS923');
  });

  it('leaves a field alone when the server has no value for it (null / "")', () => {
    const { patch, missing } = srv.serverConfigToRadioForm({
      ...OTAA_REPLY,
      join_eui: null,
      nwk_key: '',
    });
    expect(patch.joinEui).toBeUndefined();
    expect(patch.nwkKey).toBeUndefined();
    expect('joinEui' in patch).toBe(false);
    expect(missing).toEqual(['joinEui', 'nwkKey']);
  });

  it('without supports_otaa: auth untouched, ABP branch filled (the website does the same)', () => {
    const noProfile: any = { ...ABP_REPLY };
    delete noProfile.supports_otaa;
    const { patch } = srv.serverConfigToRadioForm(noProfile);
    expect(patch.auth).toBeUndefined();
    expect(patch.devAddr).toBe('0C0C0C0C');
    expect(patch.devEui).toBeUndefined();
  });

  it('shows hex the way the app shows typed hex: upper case, no spaces', () => {
    const { patch } = srv.serverConfigToRadioForm({
      supports_otaa: true,
      dev_eui: ' 01 01 01 01 0a 0b 0c 0d ',
    });
    expect(patch.devEui).toBe('010101010A0B0C0D');
  });
});

describe('loadServerRadioCredentials', () => {
  it('signed out: explains, and never calls the server', async () => {
    const r = await srv.loadServerRadioCredentials('0x0006001B');
    expect(r.kind).toBe('signed-out');
    expect(r.message).toMatch(/Home tab/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('OTAA collar: GET /devices/{uid}/config with the session, returns the patch', async () => {
    await signIn();
    fetchMock.mockResolvedValueOnce(resp(200, OTAA_REPLY));
    const r = await srv.loadServerRadioCredentials('0x0006001B');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.collarid.org/devices/0x0006001B/config');
    expect(init.headers.Authorization).toBe('Bearer fake-token-for-tests');
    expect(init.method).toBeUndefined(); // a plain GET

    expect(r.kind).toBe('ok');
    if (r.kind !== 'ok') return;
    expect(r.patch.auth).toBe('AUTH_OTAA');
    expect(r.patch.appKey).toBe('AA'.repeat(16));
    expect(r.message).toContain('0x0006001B (OTAA, US915)');
    expect(r.message).toContain('Nothing has been sent');
    // The message never repeats a key.
    for (const v of Object.values(r.patch)) {
      if (v && v.length >= 8) expect(r.message).not.toContain(v);
    }
  });

  it('says which fields the server left empty', async () => {
    await signIn();
    fetchMock.mockResolvedValueOnce(resp(200, { ...OTAA_REPLY, join_eui: null }));
    const r = await srv.loadServerRadioCredentials('0x0006001B');
    expect(r.kind).toBe('ok');
    expect(r.message).toContain('no value for joinEui');
  });

  it('configured=false: not on the CollarID network (or not heard yet)', async () => {
    await signIn();
    fetchMock.mockResolvedValueOnce(
      resp(200, {
        configured: false,
        detail: 'Device has no DevEUI — not yet seen via LoRaWAN',
      }),
    );
    const r = await srv.loadServerRadioCredentials('0x0006001B');
    expect(r.kind).toBe('not-on-network');
    expect(r.message).toMatch(/not on the CollarID LoRaWAN network/);
    expect(r.message).toMatch(/not yet seen via LoRaWAN/);
    expect(r.message).toMatch(/own LoRaWAN network/);
  });

  it('503: same explanation', async () => {
    await signIn();
    fetchMock.mockResolvedValueOnce(
      resp(503, { detail: 'ChirpStack API not configured' }),
    );
    const r = await srv.loadServerRadioCredentials('0x0006001B');
    expect(r.kind).toBe('not-on-network');
    expect(r.message).toMatch(/own LoRaWAN network/);
  });

  it('403: not your collar', async () => {
    await signIn('field-team');
    fetchMock.mockResolvedValueOnce(
      resp(403, { detail: 'Device not provisioned to your account' }),
    );
    const r = await srv.loadServerRadioCredentials('0x0006001B');
    expect(r.kind).toBe('forbidden');
    expect(r.message).toContain('0x0006001B is not on your CollarID account (field-team)');
    expect(api.getToken()).not.toBeNull(); // a 403 is not an expiry
  });

  it('401: the session is over (and ended app-wide)', async () => {
    await signIn();
    fetchMock.mockResolvedValueOnce(resp(401, { detail: 'Invalid or expired token' }));
    const r = await srv.loadServerRadioCredentials('0x0006001B');
    expect(r.kind).toBe('expired');
    expect(api.getToken()).toBeNull();
  });

  it('network failure: cannot reach the server', async () => {
    await signIn();
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
    const r = await srv.loadServerRadioCredentials('0x0006001B');
    expect(r.kind).toBe('unreachable');
    expect(r.message).toMatch(/Cannot reach the CollarID server/);
  });

  it('other HTTP errors: says so, changes nothing', async () => {
    await signIn();
    fetchMock.mockResolvedValueOnce(resp(500));
    const r = await srv.loadServerRadioCredentials('0x0006001B');
    expect(r.kind).toBe('error');
    expect(r.message).toContain('HTTP 500');
  });

  it('configured but no keys at all: nothing to fill', async () => {
    await signIn();
    fetchMock.mockResolvedValueOnce(resp(200, { configured: true }));
    const r = await srv.loadServerRadioCredentials('0x0006001B');
    expect(r.kind).toBe('error');
  });

  it('never logs the reply', async () => {
    const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map(m =>
      jest.spyOn(console, m).mockImplementation(() => {}),
    );
    await signIn();
    fetchMock.mockResolvedValueOnce(resp(200, OTAA_REPLY));
    await srv.loadServerRadioCredentials('0x0006001B');
    for (const spy of spies) {
      for (const call of spy.mock.calls) {
        expect(JSON.stringify(call)).not.toMatch(/aaaaaaaa|bbbbbbbb|AAAAAAAA/i);
      }
    }
  });
});
