import * as $protobuf from "protobufjs";
import Long = require("long");
/** Properties of a PacketHeader. */
export interface IPacketHeader {

    /** PacketHeader systemUid */
    systemUid?: (number|null);

    /** PacketHeader msFromStart */
    msFromStart?: (number|null);

    /** PacketHeader epoch */
    epoch?: (number|null);

    /** PacketHeader packetIndex */
    packetIndex?: (number|null);
}

/** Represents a PacketHeader. */
export class PacketHeader implements IPacketHeader {

    /**
     * Constructs a new PacketHeader.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPacketHeader);

    /** PacketHeader systemUid. */
    public systemUid: number;

    /** PacketHeader msFromStart. */
    public msFromStart: number;

    /** PacketHeader epoch. */
    public epoch: number;

    /** PacketHeader packetIndex. */
    public packetIndex: number;

    /**
     * Creates a new PacketHeader instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PacketHeader instance
     */
    public static create(properties?: IPacketHeader): PacketHeader;

    /**
     * Encodes the specified PacketHeader message. Does not implicitly {@link PacketHeader.verify|verify} messages.
     * @param message PacketHeader message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPacketHeader, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PacketHeader message, length delimited. Does not implicitly {@link PacketHeader.verify|verify} messages.
     * @param message PacketHeader message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPacketHeader, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PacketHeader message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PacketHeader
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PacketHeader;

    /**
     * Decodes a PacketHeader message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PacketHeader
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PacketHeader;

    /**
     * Verifies a PacketHeader message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PacketHeader message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PacketHeader
     */
    public static fromObject(object: { [k: string]: any }): PacketHeader;

    /**
     * Creates a plain object from a PacketHeader message. Also converts values to other types if specified.
     * @param message PacketHeader
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PacketHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PacketHeader to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for PacketHeader
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a TimeWindow. */
export interface ITimeWindow {

    /** TimeWindow startHour */
    startHour?: (number|null);

    /** TimeWindow endHour */
    endHour?: (number|null);
}

/** Represents a TimeWindow. */
export class TimeWindow implements ITimeWindow {

    /**
     * Constructs a new TimeWindow.
     * @param [properties] Properties to set
     */
    constructor(properties?: ITimeWindow);

    /** TimeWindow startHour. */
    public startHour: number;

    /** TimeWindow endHour. */
    public endHour: number;

    /**
     * Creates a new TimeWindow instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TimeWindow instance
     */
    public static create(properties?: ITimeWindow): TimeWindow;

    /**
     * Encodes the specified TimeWindow message. Does not implicitly {@link TimeWindow.verify|verify} messages.
     * @param message TimeWindow message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ITimeWindow, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TimeWindow message, length delimited. Does not implicitly {@link TimeWindow.verify|verify} messages.
     * @param message TimeWindow message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ITimeWindow, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a TimeWindow message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TimeWindow
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): TimeWindow;

    /**
     * Decodes a TimeWindow message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TimeWindow
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): TimeWindow;

    /**
     * Verifies a TimeWindow message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a TimeWindow message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TimeWindow
     */
    public static fromObject(object: { [k: string]: any }): TimeWindow;

    /**
     * Creates a plain object from a TimeWindow message. Also converts values to other types if specified.
     * @param message TimeWindow
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: TimeWindow, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this TimeWindow to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for TimeWindow
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a SamplingConfig. */
export interface ISamplingConfig {

    /** SamplingConfig enabled */
    enabled?: (boolean|null);

    /** SamplingConfig sampleIntervalMin */
    sampleIntervalMin?: (number|null);
}

/** Represents a SamplingConfig. */
export class SamplingConfig implements ISamplingConfig {

    /**
     * Constructs a new SamplingConfig.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISamplingConfig);

    /** SamplingConfig enabled. */
    public enabled: boolean;

    /** SamplingConfig sampleIntervalMin. */
    public sampleIntervalMin: number;

    /**
     * Creates a new SamplingConfig instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SamplingConfig instance
     */
    public static create(properties?: ISamplingConfig): SamplingConfig;

    /**
     * Encodes the specified SamplingConfig message. Does not implicitly {@link SamplingConfig.verify|verify} messages.
     * @param message SamplingConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISamplingConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SamplingConfig message, length delimited. Does not implicitly {@link SamplingConfig.verify|verify} messages.
     * @param message SamplingConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISamplingConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a SamplingConfig message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SamplingConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): SamplingConfig;

    /**
     * Decodes a SamplingConfig message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SamplingConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): SamplingConfig;

    /**
     * Verifies a SamplingConfig message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a SamplingConfig message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SamplingConfig
     */
    public static fromObject(object: { [k: string]: any }): SamplingConfig;

    /**
     * Creates a plain object from a SamplingConfig message. Also converts values to other types if specified.
     * @param message SamplingConfig
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: SamplingConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this SamplingConfig to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for SamplingConfig
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a GPSConfig. */
export interface IGPSConfig {

    /** GPSConfig enabled */
    enabled?: (boolean|null);

    /** GPSConfig sampleIntervalMin */
    sampleIntervalMin?: (number|null);

    /** GPSConfig accuracy */
    accuracy?: (number|null);
}

/** Represents a GPSConfig. */
export class GPSConfig implements IGPSConfig {

    /**
     * Constructs a new GPSConfig.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGPSConfig);

    /** GPSConfig enabled. */
    public enabled: boolean;

    /** GPSConfig sampleIntervalMin. */
    public sampleIntervalMin: number;

    /** GPSConfig accuracy. */
    public accuracy: number;

    /**
     * Creates a new GPSConfig instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GPSConfig instance
     */
    public static create(properties?: IGPSConfig): GPSConfig;

    /**
     * Encodes the specified GPSConfig message. Does not implicitly {@link GPSConfig.verify|verify} messages.
     * @param message GPSConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGPSConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GPSConfig message, length delimited. Does not implicitly {@link GPSConfig.verify|verify} messages.
     * @param message GPSConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGPSConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GPSConfig message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GPSConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GPSConfig;

    /**
     * Decodes a GPSConfig message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GPSConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GPSConfig;

    /**
     * Verifies a GPSConfig message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GPSConfig message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GPSConfig
     */
    public static fromObject(object: { [k: string]: any }): GPSConfig;

    /**
     * Creates a plain object from a GPSConfig message. Also converts values to other types if specified.
     * @param message GPSConfig
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GPSConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GPSConfig to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for GPSConfig
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** RadioRegion enum. */
export enum RadioRegion {
    REGION_US915 = 0,
    REGION_AU915 = 1,
    REGION_EU868 = 2
}

/** RadioAuth enum. */
export enum RadioAuth {
    AUTH_OTAA = 0,
    AUTH_ABP = 1
}

/** Represents a RadioOTAA. */
export class RadioOTAA implements IRadioOTAA {

    /**
     * Constructs a new RadioOTAA.
     * @param [properties] Properties to set
     */
    constructor(properties?: IRadioOTAA);

    /** RadioOTAA devEui. */
    public devEui: Uint8Array;

    /** RadioOTAA joinEui. */
    public joinEui: Uint8Array;

    /** RadioOTAA appKey. */
    public appKey: Uint8Array;

    /**
     * Creates a new RadioOTAA instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RadioOTAA instance
     */
    public static create(properties?: IRadioOTAA): RadioOTAA;

    /**
     * Encodes the specified RadioOTAA message. Does not implicitly {@link RadioOTAA.verify|verify} messages.
     * @param message RadioOTAA message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IRadioOTAA, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RadioOTAA message, length delimited. Does not implicitly {@link RadioOTAA.verify|verify} messages.
     * @param message RadioOTAA message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IRadioOTAA, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RadioOTAA message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RadioOTAA
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): RadioOTAA;

    /**
     * Decodes a RadioOTAA message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RadioOTAA
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): RadioOTAA;

    /**
     * Verifies a RadioOTAA message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a RadioOTAA message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RadioOTAA
     */
    public static fromObject(object: { [k: string]: any }): RadioOTAA;

    /**
     * Creates a plain object from a RadioOTAA message. Also converts values to other types if specified.
     * @param message RadioOTAA
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: RadioOTAA, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this RadioOTAA to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for RadioOTAA
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a RadioABP. */
export class RadioABP implements IRadioABP {

    /**
     * Constructs a new RadioABP.
     * @param [properties] Properties to set
     */
    constructor(properties?: IRadioABP);

    /** RadioABP devAddr. */
    public devAddr: Uint8Array;

    /** RadioABP nwkSKey. */
    public nwkSKey: Uint8Array;

    /** RadioABP appSKey. */
    public appSKey: Uint8Array;

    /** RadioABP fNwkSIntKey. */
    public fNwkSIntKey: Uint8Array;

    /** RadioABP sNwkSIntKey. */
    public sNwkSIntKey: Uint8Array;

    /**
     * Creates a new RadioABP instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RadioABP instance
     */
    public static create(properties?: IRadioABP): RadioABP;

    /**
     * Encodes the specified RadioABP message. Does not implicitly {@link RadioABP.verify|verify} messages.
     * @param message RadioABP message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IRadioABP, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RadioABP message, length delimited. Does not implicitly {@link RadioABP.verify|verify} messages.
     * @param message RadioABP message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IRadioABP, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RadioABP message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RadioABP
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): RadioABP;

    /**
     * Decodes a RadioABP message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RadioABP
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): RadioABP;

    /**
     * Verifies a RadioABP message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a RadioABP message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RadioABP
     */
    public static fromObject(object: { [k: string]: any }): RadioABP;

    /**
     * Creates a plain object from a RadioABP message. Also converts values to other types if specified.
     * @param message RadioABP
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: RadioABP, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this RadioABP to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for RadioABP
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a RadioConfigPacket. */
export class RadioConfigPacket implements IRadioConfigPacket {

    /**
     * Constructs a new RadioConfigPacket.
     * @param [properties] Properties to set
     */
    constructor(properties?: IRadioConfigPacket);

    /** RadioConfigPacket enabled. */
    public enabled: boolean;

    /** RadioConfigPacket region. */
    public region: RadioRegion;

    /** RadioConfigPacket auth. */
    public auth: RadioAuth;

    /** RadioConfigPacket otaa. */
    public otaa?: (IRadioOTAA|null);

    /** RadioConfigPacket abp. */
    public abp?: (IRadioABP|null);

    /** RadioConfigPacket transmitIntervalMin. */
    public transmitIntervalMin: number;

    /** RadioConfigPacket txOnlyOnNewGpsFix. */
    public txOnlyOnNewGpsFix: boolean;

    /** RadioConfigPacket txPowerDbm. */
    public txPowerDbm: number;

    /** RadioConfigPacket credentials. */
    public credentials?: ("otaa"|"abp");

    /**
     * Creates a new RadioConfigPacket instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RadioConfigPacket instance
     */
    public static create(properties?: IRadioConfigPacket): RadioConfigPacket;

    /**
     * Encodes the specified RadioConfigPacket message. Does not implicitly {@link RadioConfigPacket.verify|verify} messages.
     * @param message RadioConfigPacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IRadioConfigPacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RadioConfigPacket message, length delimited. Does not implicitly {@link RadioConfigPacket.verify|verify} messages.
     * @param message RadioConfigPacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IRadioConfigPacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RadioConfigPacket message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RadioConfigPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): RadioConfigPacket;

    /**
     * Decodes a RadioConfigPacket message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RadioConfigPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): RadioConfigPacket;

    /**
     * Verifies a RadioConfigPacket message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a RadioConfigPacket message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RadioConfigPacket
     */
    public static fromObject(object: { [k: string]: any }): RadioConfigPacket;

    /**
     * Creates a plain object from a RadioConfigPacket message. Also converts values to other types if specified.
     * @param message RadioConfigPacket
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: RadioConfigPacket, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this RadioConfigPacket to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for RadioConfigPacket
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a MicrophoneConfig. */
export class MicrophoneConfig implements IMicrophoneConfig {

    /**
     * Constructs a new MicrophoneConfig.
     * @param [properties] Properties to set
     */
    constructor(properties?: IMicrophoneConfig);

    /** MicrophoneConfig enabled. */
    public enabled: boolean;

    /** MicrophoneConfig continuousMode. */
    public continuousMode: boolean;

    /** MicrophoneConfig sampleLengthMin. */
    public sampleLengthMin: number;

    /** MicrophoneConfig sampleWindowMin. */
    public sampleWindowMin: number;

    /**
     * Creates a new MicrophoneConfig instance using the specified properties.
     * @param [properties] Properties to set
     * @returns MicrophoneConfig instance
     */
    public static create(properties?: IMicrophoneConfig): MicrophoneConfig;

    /**
     * Encodes the specified MicrophoneConfig message. Does not implicitly {@link MicrophoneConfig.verify|verify} messages.
     * @param message MicrophoneConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IMicrophoneConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified MicrophoneConfig message, length delimited. Does not implicitly {@link MicrophoneConfig.verify|verify} messages.
     * @param message MicrophoneConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IMicrophoneConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a MicrophoneConfig message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns MicrophoneConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): MicrophoneConfig;

    /**
     * Decodes a MicrophoneConfig message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns MicrophoneConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): MicrophoneConfig;

    /**
     * Verifies a MicrophoneConfig message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a MicrophoneConfig message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns MicrophoneConfig
     */
    public static fromObject(object: { [k: string]: any }): MicrophoneConfig;

    /**
     * Creates a plain object from a MicrophoneConfig message. Also converts values to other types if specified.
     * @param message MicrophoneConfig
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: MicrophoneConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this MicrophoneConfig to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for MicrophoneConfig
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** AccelSampleRate enum. */
export enum AccelSampleRate {
    ACCEL_25HZ = 0,
    ACCEL_50HZ = 1
}

/** AccelSensitivity enum. */
export enum AccelSensitivity {
    ACCEL_2G = 0,
    ACCEL_4G = 1,
    ACCEL_8G = 2
}

/** Represents an AccelerometerConfig. */
export class AccelerometerConfig implements IAccelerometerConfig {

    /**
     * Constructs a new AccelerometerConfig.
     * @param [properties] Properties to set
     */
    constructor(properties?: IAccelerometerConfig);

    /** AccelerometerConfig enabled. */
    public enabled: boolean;

    /** AccelerometerConfig sampleRate. */
    public sampleRate: AccelSampleRate;

    /** AccelerometerConfig sensitivity. */
    public sensitivity: AccelSensitivity;

    /**
     * Creates a new AccelerometerConfig instance using the specified properties.
     * @param [properties] Properties to set
     * @returns AccelerometerConfig instance
     */
    public static create(properties?: IAccelerometerConfig): AccelerometerConfig;

    /**
     * Encodes the specified AccelerometerConfig message. Does not implicitly {@link AccelerometerConfig.verify|verify} messages.
     * @param message AccelerometerConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IAccelerometerConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified AccelerometerConfig message, length delimited. Does not implicitly {@link AccelerometerConfig.verify|verify} messages.
     * @param message AccelerometerConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IAccelerometerConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an AccelerometerConfig message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns AccelerometerConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): AccelerometerConfig;

    /**
     * Decodes an AccelerometerConfig message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns AccelerometerConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): AccelerometerConfig;

    /**
     * Verifies an AccelerometerConfig message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an AccelerometerConfig message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns AccelerometerConfig
     */
    public static fromObject(object: { [k: string]: any }): AccelerometerConfig;

    /**
     * Creates a plain object from an AccelerometerConfig message. Also converts values to other types if specified.
     * @param message AccelerometerConfig
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: AccelerometerConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this AccelerometerConfig to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for AccelerometerConfig
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a MagnetometerConfig. */
export class MagnetometerConfig implements IMagnetometerConfig {

    /**
     * Constructs a new MagnetometerConfig.
     * @param [properties] Properties to set
     */
    constructor(properties?: IMagnetometerConfig);

    /** MagnetometerConfig enabled. */
    public enabled: boolean;

    /** MagnetometerConfig sampleIntervalS. */
    public sampleIntervalS: number;

    /**
     * Creates a new MagnetometerConfig instance using the specified properties.
     * @param [properties] Properties to set
     * @returns MagnetometerConfig instance
     */
    public static create(properties?: IMagnetometerConfig): MagnetometerConfig;

    /**
     * Encodes the specified MagnetometerConfig message. Does not implicitly {@link MagnetometerConfig.verify|verify} messages.
     * @param message MagnetometerConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IMagnetometerConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified MagnetometerConfig message, length delimited. Does not implicitly {@link MagnetometerConfig.verify|verify} messages.
     * @param message MagnetometerConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IMagnetometerConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a MagnetometerConfig message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns MagnetometerConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): MagnetometerConfig;

    /**
     * Decodes a MagnetometerConfig message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns MagnetometerConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): MagnetometerConfig;

    /**
     * Verifies a MagnetometerConfig message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a MagnetometerConfig message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns MagnetometerConfig
     */
    public static fromObject(object: { [k: string]: any }): MagnetometerConfig;

    /**
     * Creates a plain object from a MagnetometerConfig message. Also converts values to other types if specified.
     * @param message MagnetometerConfig
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: MagnetometerConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this MagnetometerConfig to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for MagnetometerConfig
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a ScheduledConfig. */
export class ScheduledConfig implements IScheduledConfig {

    /**
     * Constructs a new ScheduledConfig.
     * @param [properties] Properties to set
     */
    constructor(properties?: IScheduledConfig);

    /** ScheduledConfig window. */
    public window?: (ITimeWindow|null);

    /** ScheduledConfig light. */
    public light?: (ISamplingConfig|null);

    /** ScheduledConfig environmental. */
    public environmental?: (ISamplingConfig|null);

    /** ScheduledConfig particulate. */
    public particulate?: (ISamplingConfig|null);

    /** ScheduledConfig gps. */
    public gps?: (IGPSConfig|null);

    /** ScheduledConfig microphone. */
    public microphone?: (IMicrophoneConfig|null);

    /** ScheduledConfig accelerometer. */
    public accelerometer?: (IAccelerometerConfig|null);

    /** ScheduledConfig lorawanEnabled. */
    public lorawanEnabled: boolean;

    /** ScheduledConfig lorawanSendIntervalMin. */
    public lorawanSendIntervalMin: number;

    /** ScheduledConfig magnetometer. */
    public magnetometer?: (IMagnetometerConfig|null);

    /**
     * Creates a new ScheduledConfig instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ScheduledConfig instance
     */
    public static create(properties?: IScheduledConfig): ScheduledConfig;

    /**
     * Encodes the specified ScheduledConfig message. Does not implicitly {@link ScheduledConfig.verify|verify} messages.
     * @param message ScheduledConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IScheduledConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ScheduledConfig message, length delimited. Does not implicitly {@link ScheduledConfig.verify|verify} messages.
     * @param message ScheduledConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IScheduledConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ScheduledConfig message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ScheduledConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ScheduledConfig;

    /**
     * Decodes a ScheduledConfig message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ScheduledConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ScheduledConfig;

    /**
     * Verifies a ScheduledConfig message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ScheduledConfig message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ScheduledConfig
     */
    public static fromObject(object: { [k: string]: any }): ScheduledConfig;

    /**
     * Creates a plain object from a ScheduledConfig message. Also converts values to other types if specified.
     * @param message ScheduledConfig
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ScheduledConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ScheduledConfig to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ScheduledConfig
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a ScheduleConfigPacket. */
export class ScheduleConfigPacket implements IScheduleConfigPacket {

    /**
     * Constructs a new ScheduleConfigPacket.
     * @param [properties] Properties to set
     */
    constructor(properties?: IScheduleConfigPacket);

    /** ScheduleConfigPacket schedules. */
    public schedules: IScheduledConfig[];

    /**
     * Creates a new ScheduleConfigPacket instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ScheduleConfigPacket instance
     */
    public static create(properties?: IScheduleConfigPacket): ScheduleConfigPacket;

    /**
     * Encodes the specified ScheduleConfigPacket message. Does not implicitly {@link ScheduleConfigPacket.verify|verify} messages.
     * @param message ScheduleConfigPacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IScheduleConfigPacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ScheduleConfigPacket message, length delimited. Does not implicitly {@link ScheduleConfigPacket.verify|verify} messages.
     * @param message ScheduleConfigPacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IScheduleConfigPacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ScheduleConfigPacket message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ScheduleConfigPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ScheduleConfigPacket;

    /**
     * Decodes a ScheduleConfigPacket message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ScheduleConfigPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ScheduleConfigPacket;

    /**
     * Verifies a ScheduleConfigPacket message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ScheduleConfigPacket message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ScheduleConfigPacket
     */
    public static fromObject(object: { [k: string]: any }): ScheduleConfigPacket;

    /**
     * Creates a plain object from a ScheduleConfigPacket message. Also converts values to other types if specified.
     * @param message ScheduleConfigPacket
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ScheduleConfigPacket, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ScheduleConfigPacket to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ScheduleConfigPacket
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Activity enum. */
export enum Activity {
    STILL = 0,
    WALK = 1,
    RUN = 2
}

/** Represents a SimpleSensorReading. */
export class SimpleSensorReading implements ISimpleSensorReading {

    /**
     * Constructs a new SimpleSensorReading.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISimpleSensorReading);

    /** SimpleSensorReading index. */
    public index: number;

    /** SimpleSensorReading temperature. */
    public temperature: number;

    /** SimpleSensorReading humidity. */
    public humidity: number;

    /** SimpleSensorReading pressure. */
    public pressure: number;

    /** SimpleSensorReading gas. */
    public gas: number;

    /** SimpleSensorReading pm2_5. */
    public pm2_5: number;

    /** SimpleSensorReading light. */
    public light: number;

    /** SimpleSensorReading activity. */
    public activity: Activity;

    /** SimpleSensorReading steps. */
    public steps: number;

    /** SimpleSensorReading particulateStaticObstructed. */
    public particulateStaticObstructed: boolean;

    /** SimpleSensorReading particulateDynamicObstructed. */
    public particulateDynamicObstructed: boolean;

    /** SimpleSensorReading particulateOutsideDetectionLimits. */
    public particulateOutsideDetectionLimits: boolean;

    /**
     * Creates a new SimpleSensorReading instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SimpleSensorReading instance
     */
    public static create(properties?: ISimpleSensorReading): SimpleSensorReading;

    /**
     * Encodes the specified SimpleSensorReading message. Does not implicitly {@link SimpleSensorReading.verify|verify} messages.
     * @param message SimpleSensorReading message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISimpleSensorReading, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SimpleSensorReading message, length delimited. Does not implicitly {@link SimpleSensorReading.verify|verify} messages.
     * @param message SimpleSensorReading message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISimpleSensorReading, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a SimpleSensorReading message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SimpleSensorReading
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): SimpleSensorReading;

    /**
     * Decodes a SimpleSensorReading message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SimpleSensorReading
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): SimpleSensorReading;

    /**
     * Verifies a SimpleSensorReading message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a SimpleSensorReading message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SimpleSensorReading
     */
    public static fromObject(object: { [k: string]: any }): SimpleSensorReading;

    /**
     * Creates a plain object from a SimpleSensorReading message. Also converts values to other types if specified.
     * @param message SimpleSensorReading
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: SimpleSensorReading, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this SimpleSensorReading to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for SimpleSensorReading
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a BatteryState. */
export class BatteryState implements IBatteryState {

    /**
     * Constructs a new BatteryState.
     * @param [properties] Properties to set
     */
    constructor(properties?: IBatteryState);

    /** BatteryState charging. */
    public charging: boolean;

    /** BatteryState mV. */
    public mV: number;

    /** BatteryState percentage. */
    public percentage?: (number|null);

    /** BatteryState _percentage. */
    public _percentage?: "percentage";

    /**
     * Creates a new BatteryState instance using the specified properties.
     * @param [properties] Properties to set
     * @returns BatteryState instance
     */
    public static create(properties?: IBatteryState): BatteryState;

    /**
     * Encodes the specified BatteryState message. Does not implicitly {@link BatteryState.verify|verify} messages.
     * @param message BatteryState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IBatteryState, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified BatteryState message, length delimited. Does not implicitly {@link BatteryState.verify|verify} messages.
     * @param message BatteryState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IBatteryState, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a BatteryState message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns BatteryState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): BatteryState;

    /**
     * Decodes a BatteryState message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns BatteryState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): BatteryState;

    /**
     * Verifies a BatteryState message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a BatteryState message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns BatteryState
     */
    public static fromObject(object: { [k: string]: any }): BatteryState;

    /**
     * Creates a plain object from a BatteryState message. Also converts values to other types if specified.
     * @param message BatteryState
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: BatteryState, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this BatteryState to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for BatteryState
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a SDCardState. */
export class SDCardState implements ISDCardState {

    /**
     * Constructs a new SDCardState.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISDCardState);

    /** SDCardState detected. */
    public detected: boolean;

    /** SDCardState spaceRemaining. */
    public spaceRemaining: (number|Long);

    /** SDCardState totalSpace. */
    public totalSpace: (number|Long);

    /**
     * Creates a new SDCardState instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SDCardState instance
     */
    public static create(properties?: ISDCardState): SDCardState;

    /**
     * Encodes the specified SDCardState message. Does not implicitly {@link SDCardState.verify|verify} messages.
     * @param message SDCardState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISDCardState, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SDCardState message, length delimited. Does not implicitly {@link SDCardState.verify|verify} messages.
     * @param message SDCardState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISDCardState, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a SDCardState message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SDCardState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): SDCardState;

    /**
     * Decodes a SDCardState message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SDCardState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): SDCardState;

    /**
     * Verifies a SDCardState message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a SDCardState message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SDCardState
     */
    public static fromObject(object: { [k: string]: any }): SDCardState;

    /**
     * Creates a plain object from a SDCardState message. Also converts values to other types if specified.
     * @param message SDCardState
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: SDCardState, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this SDCardState to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for SDCardState
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a GPSData. */
export class GPSData implements IGPSData {

    /**
     * Constructs a new GPSData.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGPSData);

    /** GPSData latitude. */
    public latitude: number;

    /** GPSData longitude. */
    public longitude: number;

    /** GPSData altitude. */
    public altitude: number;

    /** GPSData speed. */
    public speed: number;

    /** GPSData heading. */
    public heading: number;

    /**
     * Creates a new GPSData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GPSData instance
     */
    public static create(properties?: IGPSData): GPSData;

    /**
     * Encodes the specified GPSData message. Does not implicitly {@link GPSData.verify|verify} messages.
     * @param message GPSData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGPSData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GPSData message, length delimited. Does not implicitly {@link GPSData.verify|verify} messages.
     * @param message GPSData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGPSData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GPSData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GPSData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GPSData;

    /**
     * Decodes a GPSData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GPSData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GPSData;

    /**
     * Verifies a GPSData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GPSData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GPSData
     */
    public static fromObject(object: { [k: string]: any }): GPSData;

    /**
     * Creates a plain object from a GPSData message. Also converts values to other types if specified.
     * @param message GPSData
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GPSData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GPSData to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for GPSData
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a SystemStatePacket. */
export class SystemStatePacket implements ISystemStatePacket {

    /**
     * Constructs a new SystemStatePacket.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISystemStatePacket);

    /** SystemStatePacket engageState. */
    public engageState: boolean;

    /** SystemStatePacket battery. */
    public battery?: (IBatteryState|null);

    /** SystemStatePacket sdcard. */
    public sdcard?: (ISDCardState|null);

    /** SystemStatePacket gpsData. */
    public gpsData?: (IGPSData|null);

    /** SystemStatePacket sensors. */
    public sensors?: (ISimpleSensorReading|null);

    /** SystemStatePacket firmwareVersion. */
    public firmwareVersion: string;

    /** SystemStatePacket _gpsData. */
    public _gpsData?: "gpsData";

    /**
     * Creates a new SystemStatePacket instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SystemStatePacket instance
     */
    public static create(properties?: ISystemStatePacket): SystemStatePacket;

    /**
     * Encodes the specified SystemStatePacket message. Does not implicitly {@link SystemStatePacket.verify|verify} messages.
     * @param message SystemStatePacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISystemStatePacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SystemStatePacket message, length delimited. Does not implicitly {@link SystemStatePacket.verify|verify} messages.
     * @param message SystemStatePacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISystemStatePacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a SystemStatePacket message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SystemStatePacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): SystemStatePacket;

    /**
     * Decodes a SystemStatePacket message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SystemStatePacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): SystemStatePacket;

    /**
     * Verifies a SystemStatePacket message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a SystemStatePacket message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SystemStatePacket
     */
    public static fromObject(object: { [k: string]: any }): SystemStatePacket;

    /**
     * Creates a plain object from a SystemStatePacket message. Also converts values to other types if specified.
     * @param message SystemStatePacket
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: SystemStatePacket, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this SystemStatePacket to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for SystemStatePacket
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** PeripheralType enum. */
export enum PeripheralType {
    PERIPHERAL_SATCOM = 0,
    PERIPHERAL_DETACHMENT = 1
}

/** Represents a PeripheralPacket. */
export class PeripheralPacket implements IPeripheralPacket {

    /**
     * Constructs a new PeripheralPacket.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPeripheralPacket);

    /** PeripheralPacket macAddress. */
    public macAddress: Uint8Array;

    /** PeripheralPacket type. */
    public type: PeripheralType;

    /**
     * Creates a new PeripheralPacket instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PeripheralPacket instance
     */
    public static create(properties?: IPeripheralPacket): PeripheralPacket;

    /**
     * Encodes the specified PeripheralPacket message. Does not implicitly {@link PeripheralPacket.verify|verify} messages.
     * @param message PeripheralPacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPeripheralPacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PeripheralPacket message, length delimited. Does not implicitly {@link PeripheralPacket.verify|verify} messages.
     * @param message PeripheralPacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPeripheralPacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PeripheralPacket message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PeripheralPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PeripheralPacket;

    /**
     * Decodes a PeripheralPacket message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PeripheralPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PeripheralPacket;

    /**
     * Verifies a PeripheralPacket message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PeripheralPacket message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PeripheralPacket
     */
    public static fromObject(object: { [k: string]: any }): PeripheralPacket;

    /**
     * Creates a plain object from a PeripheralPacket message. Also converts values to other types if specified.
     * @param message PeripheralPacket
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PeripheralPacket, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PeripheralPacket to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for PeripheralPacket
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a PeripheralInfo. */
export class PeripheralInfo implements IPeripheralInfo {

    /**
     * Constructs a new PeripheralInfo.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPeripheralInfo);

    /** PeripheralInfo deviceUids. */
    public deviceUids: string[];

    /**
     * Creates a new PeripheralInfo instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PeripheralInfo instance
     */
    public static create(properties?: IPeripheralInfo): PeripheralInfo;

    /**
     * Encodes the specified PeripheralInfo message. Does not implicitly {@link PeripheralInfo.verify|verify} messages.
     * @param message PeripheralInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPeripheralInfo, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PeripheralInfo message, length delimited. Does not implicitly {@link PeripheralInfo.verify|verify} messages.
     * @param message PeripheralInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPeripheralInfo, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PeripheralInfo message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PeripheralInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PeripheralInfo;

    /**
     * Decodes a PeripheralInfo message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PeripheralInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PeripheralInfo;

    /**
     * Verifies a PeripheralInfo message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PeripheralInfo message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PeripheralInfo
     */
    public static fromObject(object: { [k: string]: any }): PeripheralInfo;

    /**
     * Creates a plain object from a PeripheralInfo message. Also converts values to other types if specified.
     * @param message PeripheralInfo
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PeripheralInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PeripheralInfo to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for PeripheralInfo
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a Packet. */
export class Packet implements IPacket {

    /**
     * Constructs a new Packet.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPacket);

    /** Packet header. */
    public header?: (IPacketHeader|null);

    /** Packet scheduleConfigPacket. */
    public scheduleConfigPacket?: (IScheduleConfigPacket|null);

    /** Packet systemStatePacket. */
    public systemStatePacket?: (ISystemStatePacket|null);

    /** Packet radioConfigPacket. */
    public radioConfigPacket?: (IRadioConfigPacket|null);

    /** Packet peripheralPacket. */
    public peripheralPacket?: (IPeripheralPacket|null);

    /** Packet peripheralInfo. */
    public peripheralInfo?: (IPeripheralInfo|null);

    /** Packet payload. */
    public payload?: ("scheduleConfigPacket"|"systemStatePacket"|"radioConfigPacket"|"peripheralPacket"|"peripheralInfo");

    /**
     * Creates a new Packet instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Packet instance
     */
    public static create(properties?: IPacket): Packet;

    /**
     * Encodes the specified Packet message. Does not implicitly {@link Packet.verify|verify} messages.
     * @param message Packet message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Packet message, length delimited. Does not implicitly {@link Packet.verify|verify} messages.
     * @param message Packet message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Packet message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Packet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Packet;

    /**
     * Decodes a Packet message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Packet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Packet;

    /**
     * Verifies a Packet message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Packet message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Packet
     */
    public static fromObject(object: { [k: string]: any }): Packet;

    /**
     * Creates a plain object from a Packet message. Also converts values to other types if specified.
     * @param message Packet
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Packet, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Packet to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Packet
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}
