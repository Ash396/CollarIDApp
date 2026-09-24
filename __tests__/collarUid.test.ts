/**
 * The collar's server UID: "0x" + 8 upper-case hex, the same text the server
 * builds from header.system_uid (api/decoder.py f'0x{uid:08X}').
 */
import {
  deriveCollarUid,
  formatServerUid,
  uidFromAdvertisedName,
} from '../src/utils/collarUid';

describe('formatServerUid', () => {
  it('formats the status packet number like the server does', () => {
    expect(formatServerUid(0x0006001b)).toBe('0x0006001B');
    expect(formatServerUid(0x00070021)).toBe('0x00070021');
    expect(formatServerUid(0x6001b)).toBe('0x0006001B'); // zero-padded
    expect(formatServerUid(0xffffffff)).toBe('0xFFFFFFFF');
  });

  it('treats 0 (proto3 "absent") and junk as unknown', () => {
    expect(formatServerUid(0)).toBeNull();
    expect(formatServerUid(undefined)).toBeNull();
    expect(formatServerUid(null)).toBeNull();
    expect(formatServerUid(-1)).toBeNull();
    expect(formatServerUid(1.5)).toBeNull();
    expect(formatServerUid(0x100000000)).toBeNull();
  });
});

describe('uidFromAdvertisedName', () => {
  it('reads "CollarID-XXXXXXXX" the way configure.html does', () => {
    expect(uidFromAdvertisedName('CollarID-00060018')).toBe('0x00060018');
    expect(uidFromAdvertisedName('CollarID-0006001b')).toBe('0x0006001B');
  });

  it('refuses names that are not a collar the server knows', () => {
    expect(uidFromAdvertisedName('CollarDT-00060018')).toBeNull(); // add-on
    expect(uidFromAdvertisedName('CollarID')).toBeNull(); // cached GAP name
    expect(uidFromAdvertisedName('CollarID-6001B')).toBeNull();
    expect(uidFromAdvertisedName('CollarID-0006001B-x')).toBeNull();
    expect(uidFromAdvertisedName('Mock Collar')).toBeNull();
    expect(uidFromAdvertisedName(undefined)).toBeNull();
  });
});

describe('deriveCollarUid', () => {
  it("prefers the collar's own status UID over its Bluetooth name", () => {
    expect(
      deriveCollarUid({ systemUid: 0x0006001b, name: 'CollarID-12345678' }),
    ).toEqual({ uid: '0x0006001B', source: 'status' });
  });

  it('falls back to the advertised name, then the local name', () => {
    expect(deriveCollarUid({ systemUid: 0, name: 'CollarID-00060018' })).toEqual(
      { uid: '0x00060018', source: 'name' },
    );
    expect(
      deriveCollarUid({
        systemUid: null,
        name: 'CollarID',
        localName: 'CollarID-00070021',
      }),
    ).toEqual({ uid: '0x00070021', source: 'name' });
  });

  it('gives up rather than guess', () => {
    expect(deriveCollarUid({ systemUid: null, name: 'Mock Collar' })).toBeNull();
  });
});
