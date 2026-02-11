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

    /** PacketHeader requestAck */
    requestAck?: (boolean|null);
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

    /** PacketHeader requestAck. */
    public requestAck?: (boolean|null);

    /** PacketHeader _requestAck. */
    public _requestAck?: "requestAck";

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

/** Properties of a GPSData. */
export interface IGPSData {

    /** GPSData latitude */
    latitude?: (number|null);

    /** GPSData longitude */
    longitude?: (number|null);

    /** GPSData altitude */
    altitude?: (number|null);

    /** GPSData speed */
    speed?: (number|null);

    /** GPSData heading */
    heading?: (number|null);
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

/** Properties of a BatteryState. */
export interface IBatteryState {

    /** BatteryState charging */
    charging?: (boolean|null);

    /** BatteryState voltage */
    voltage?: (number|null);

    /** BatteryState percentage */
    percentage?: (number|null);
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

    /** BatteryState voltage. */
    public voltage: number;

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

/** Properties of a SDCardState. */
export interface ISDCardState {

    /** SDCardState detected */
    detected?: (boolean|null);

    /** SDCardState spaceRemaining */
    spaceRemaining?: (number|Long|null);

    /** SDCardState totalSpace */
    totalSpace?: (number|Long|null);
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

/** Activity enum. */
export enum Activity {
    STILL = 0,
    WALK = 1,
    RUN = 2
}

/** Represents a SystemInfoPacket. */
export class SystemInfoPacket implements ISystemInfoPacket {

    /**
     * Constructs a new SystemInfoPacket.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISystemInfoPacket);

    /** SystemInfoPacket systemSensorSummary. */
    public systemSensorSummary?: (ISystemSensorSummary|null);

    /** SystemInfoPacket sdcardState. */
    public sdcardState?: (ISDCardState|null);

    /** SystemInfoPacket batteryState. */
    public batteryState?: (IBatteryState|null);

    /** SystemInfoPacket metadata. */
    public metadata?: (IMetadata|null);

    /** SystemInfoPacket gpsData. */
    public gpsData?: (IGPSData|null);

    /** SystemInfoPacket _systemSensorSummary. */
    public _systemSensorSummary?: "systemSensorSummary";

    /** SystemInfoPacket _sdcardState. */
    public _sdcardState?: "sdcardState";

    /** SystemInfoPacket _batteryState. */
    public _batteryState?: "batteryState";

    /** SystemInfoPacket _metadata. */
    public _metadata?: "metadata";

    /** SystemInfoPacket _gpsData. */
    public _gpsData?: "gpsData";

    /**
     * Creates a new SystemInfoPacket instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SystemInfoPacket instance
     */
    public static create(properties?: ISystemInfoPacket): SystemInfoPacket;

    /**
     * Encodes the specified SystemInfoPacket message. Does not implicitly {@link SystemInfoPacket.verify|verify} messages.
     * @param message SystemInfoPacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISystemInfoPacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SystemInfoPacket message, length delimited. Does not implicitly {@link SystemInfoPacket.verify|verify} messages.
     * @param message SystemInfoPacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISystemInfoPacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a SystemInfoPacket message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SystemInfoPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): SystemInfoPacket;

    /**
     * Decodes a SystemInfoPacket message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SystemInfoPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): SystemInfoPacket;

    /**
     * Verifies a SystemInfoPacket message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a SystemInfoPacket message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SystemInfoPacket
     */
    public static fromObject(object: { [k: string]: any }): SystemInfoPacket;

    /**
     * Creates a plain object from a SystemInfoPacket message. Also converts values to other types if specified.
     * @param message SystemInfoPacket
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: SystemInfoPacket, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this SystemInfoPacket to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for SystemInfoPacket
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a Metadata. */
export class Metadata implements IMetadata {

    /**
     * Constructs a new Metadata.
     * @param [properties] Properties to set
     */
    constructor(properties?: IMetadata);

    /** Metadata gpsAvgFixTime. */
    public gpsAvgFixTime: number;

    /**
     * Creates a new Metadata instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Metadata instance
     */
    public static create(properties?: IMetadata): Metadata;

    /**
     * Encodes the specified Metadata message. Does not implicitly {@link Metadata.verify|verify} messages.
     * @param message Metadata message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Metadata message, length delimited. Does not implicitly {@link Metadata.verify|verify} messages.
     * @param message Metadata message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Metadata message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Metadata
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Metadata;

    /**
     * Decodes a Metadata message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Metadata
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Metadata;

    /**
     * Verifies a Metadata message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Metadata message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Metadata
     */
    public static fromObject(object: { [k: string]: any }): Metadata;

    /**
     * Creates a plain object from a Metadata message. Also converts values to other types if specified.
     * @param message Metadata
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Metadata, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Metadata to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Metadata
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a ConfigPacket. */
export class ConfigPacket implements IConfigPacket {

    /**
     * Constructs a new ConfigPacket.
     * @param [properties] Properties to set
     */
    constructor(properties?: IConfigPacket);

    /** ConfigPacket engageSystem. */
    public engageSystem: boolean;

    /** ConfigPacket enableMicrophone. */
    public enableMicrophone: boolean;

    /** ConfigPacket enableActivity. */
    public enableActivity: boolean;

    /** ConfigPacket enableParticulate. */
    public enableParticulate: boolean;

    /** ConfigPacket enableEnvironmental. */
    public enableEnvironmental: boolean;

    /** ConfigPacket enableLight. */
    public enableLight: boolean;

    /** ConfigPacket enableMotion. */
    public enableMotion: boolean;

    /** ConfigPacket enableLora. */
    public enableLora: boolean;

    /**
     * Creates a new ConfigPacket instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ConfigPacket instance
     */
    public static create(properties?: IConfigPacket): ConfigPacket;

    /**
     * Encodes the specified ConfigPacket message. Does not implicitly {@link ConfigPacket.verify|verify} messages.
     * @param message ConfigPacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IConfigPacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ConfigPacket message, length delimited. Does not implicitly {@link ConfigPacket.verify|verify} messages.
     * @param message ConfigPacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IConfigPacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ConfigPacket message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ConfigPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ConfigPacket;

    /**
     * Decodes a ConfigPacket message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ConfigPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ConfigPacket;

    /**
     * Verifies a ConfigPacket message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ConfigPacket message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ConfigPacket
     */
    public static fromObject(object: { [k: string]: any }): ConfigPacket;

    /**
     * Creates a plain object from a ConfigPacket message. Also converts values to other types if specified.
     * @param message ConfigPacket
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ConfigPacket, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ConfigPacket to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ConfigPacket
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a GPSData_2. */
export class GPSData_2 implements IGPSData_2 {

    /**
     * Constructs a new GPSData_2.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGPSData_2);

    /** GPSData_2 latitudeE7. */
    public latitudeE7: number;

    /** GPSData_2 longitudeE7. */
    public longitudeE7: number;

    /** GPSData_2 altitudeMm. */
    public altitudeMm: number;

    /** GPSData_2 timestamp. */
    public timestamp?: (number|null);

    /** GPSData_2 gpsAvgFixTimeMs. */
    public gpsAvgFixTimeMs?: (number|null);

    /** GPSData_2 _timestamp. */
    public _timestamp?: "timestamp";

    /** GPSData_2 _gpsAvgFixTimeMs. */
    public _gpsAvgFixTimeMs?: "gpsAvgFixTimeMs";

    /**
     * Creates a new GPSData_2 instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GPSData_2 instance
     */
    public static create(properties?: IGPSData_2): GPSData_2;

    /**
     * Encodes the specified GPSData_2 message. Does not implicitly {@link GPSData_2.verify|verify} messages.
     * @param message GPSData_2 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGPSData_2, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GPSData_2 message, length delimited. Does not implicitly {@link GPSData_2.verify|verify} messages.
     * @param message GPSData_2 message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGPSData_2, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GPSData_2 message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GPSData_2
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GPSData_2;

    /**
     * Decodes a GPSData_2 message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GPSData_2
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GPSData_2;

    /**
     * Verifies a GPSData_2 message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GPSData_2 message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GPSData_2
     */
    public static fromObject(object: { [k: string]: any }): GPSData_2;

    /**
     * Creates a plain object from a GPSData_2 message. Also converts values to other types if specified.
     * @param message GPSData_2
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GPSData_2, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GPSData_2 to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for GPSData_2
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a SystemSensorSummary. */
export class SystemSensorSummary implements ISystemSensorSummary {

    /**
     * Constructs a new SystemSensorSummary.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISystemSensorSummary);

    /** SystemSensorSummary temperature. */
    public temperature: number;

    /** SystemSensorSummary humidity. */
    public humidity: number;

    /** SystemSensorSummary pressure. */
    public pressure: number;

    /** SystemSensorSummary gas. */
    public gas: number;

    /** SystemSensorSummary pm1. */
    public pm1: number;

    /** SystemSensorSummary pm2_5. */
    public pm2_5: number;

    /** SystemSensorSummary pm10. */
    public pm10: number;

    /** SystemSensorSummary light. */
    public light: number;

    /** SystemSensorSummary steps. */
    public steps: number;

    /** SystemSensorSummary particulateObstructed. */
    public particulateObstructed: boolean;

    /** SystemSensorSummary particulateOutsideDetectionLimits. */
    public particulateOutsideDetectionLimits: boolean;

    /**
     * Creates a new SystemSensorSummary instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SystemSensorSummary instance
     */
    public static create(properties?: ISystemSensorSummary): SystemSensorSummary;

    /**
     * Encodes the specified SystemSensorSummary message. Does not implicitly {@link SystemSensorSummary.verify|verify} messages.
     * @param message SystemSensorSummary message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISystemSensorSummary, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SystemSensorSummary message, length delimited. Does not implicitly {@link SystemSensorSummary.verify|verify} messages.
     * @param message SystemSensorSummary message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISystemSensorSummary, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a SystemSensorSummary message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SystemSensorSummary
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): SystemSensorSummary;

    /**
     * Decodes a SystemSensorSummary message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SystemSensorSummary
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): SystemSensorSummary;

    /**
     * Verifies a SystemSensorSummary message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a SystemSensorSummary message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SystemSensorSummary
     */
    public static fromObject(object: { [k: string]: any }): SystemSensorSummary;

    /**
     * Creates a plain object from a SystemSensorSummary message. Also converts values to other types if specified.
     * @param message SystemSensorSummary
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: SystemSensorSummary, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this SystemSensorSummary to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for SystemSensorSummary
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents an AckPacket. */
export class AckPacket implements IAckPacket {

    /**
     * Constructs a new AckPacket.
     * @param [properties] Properties to set
     */
    constructor(properties?: IAckPacket);

    /**
     * Creates a new AckPacket instance using the specified properties.
     * @param [properties] Properties to set
     * @returns AckPacket instance
     */
    public static create(properties?: IAckPacket): AckPacket;

    /**
     * Encodes the specified AckPacket message. Does not implicitly {@link AckPacket.verify|verify} messages.
     * @param message AckPacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IAckPacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified AckPacket message, length delimited. Does not implicitly {@link AckPacket.verify|verify} messages.
     * @param message AckPacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IAckPacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an AckPacket message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns AckPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): AckPacket;

    /**
     * Decodes an AckPacket message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns AckPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): AckPacket;

    /**
     * Verifies an AckPacket message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an AckPacket message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns AckPacket
     */
    public static fromObject(object: { [k: string]: any }): AckPacket;

    /**
     * Creates a plain object from an AckPacket message. Also converts values to other types if specified.
     * @param message AckPacket
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: AckPacket, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this AckPacket to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for AckPacket
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a RadioInfo. */
export class RadioInfo implements IRadioInfo {

    /**
     * Constructs a new RadioInfo.
     * @param [properties] Properties to set
     */
    constructor(properties?: IRadioInfo);

    /** RadioInfo rssi. */
    public rssi: number;

    /** RadioInfo snr. */
    public snr: number;

    /** RadioInfo rssiEst. */
    public rssiEst: number;

    /**
     * Creates a new RadioInfo instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RadioInfo instance
     */
    public static create(properties?: IRadioInfo): RadioInfo;

    /**
     * Encodes the specified RadioInfo message. Does not implicitly {@link RadioInfo.verify|verify} messages.
     * @param message RadioInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IRadioInfo, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RadioInfo message, length delimited. Does not implicitly {@link RadioInfo.verify|verify} messages.
     * @param message RadioInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IRadioInfo, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RadioInfo message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RadioInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): RadioInfo;

    /**
     * Decodes a RadioInfo message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RadioInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): RadioInfo;

    /**
     * Verifies a RadioInfo message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a RadioInfo message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RadioInfo
     */
    public static fromObject(object: { [k: string]: any }): RadioInfo;

    /**
     * Creates a plain object from a RadioInfo message. Also converts values to other types if specified.
     * @param message RadioInfo
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: RadioInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this RadioInfo to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for RadioInfo
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents an AccAxis. */
export class AccAxis implements IAccAxis {

    /**
     * Constructs a new AccAxis.
     * @param [properties] Properties to set
     */
    constructor(properties?: IAccAxis);

    /** AccAxis x. */
    public x: number;

    /** AccAxis y. */
    public y: number;

    /** AccAxis z. */
    public z: number;

    /**
     * Creates a new AccAxis instance using the specified properties.
     * @param [properties] Properties to set
     * @returns AccAxis instance
     */
    public static create(properties?: IAccAxis): AccAxis;

    /**
     * Encodes the specified AccAxis message. Does not implicitly {@link AccAxis.verify|verify} messages.
     * @param message AccAxis message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IAccAxis, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified AccAxis message, length delimited. Does not implicitly {@link AccAxis.verify|verify} messages.
     * @param message AccAxis message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IAccAxis, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an AccAxis message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns AccAxis
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): AccAxis;

    /**
     * Decodes an AccAxis message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns AccAxis
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): AccAxis;

    /**
     * Verifies an AccAxis message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an AccAxis message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns AccAxis
     */
    public static fromObject(object: { [k: string]: any }): AccAxis;

    /**
     * Creates a plain object from an AccAxis message. Also converts values to other types if specified.
     * @param message AccAxis
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: AccAxis, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this AccAxis to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for AccAxis
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents an AccStats. */
export class AccStats implements IAccStats {

    /**
     * Constructs a new AccStats.
     * @param [properties] Properties to set
     */
    constructor(properties?: IAccStats);

    /** AccStats ODBAMeanX100. */
    public ODBAMeanX100: number;

    /** AccStats ODBAMaxX100. */
    public ODBAMaxX100: number;

    /** AccStats VeDBAMeanX100. */
    public VeDBAMeanX100: number;

    /** AccStats VeDBAMaxX100. */
    public VeDBAMaxX100: number;

    /** AccStats StdDevX100. */
    public StdDevX100?: (IAccAxis|null);

    /** AccStats MeanX100. */
    public MeanX100?: (IAccAxis|null);

    /** AccStats _StdDevX100. */
    public _StdDevX100?: "StdDevX100";

    /** AccStats _MeanX100. */
    public _MeanX100?: "MeanX100";

    /**
     * Creates a new AccStats instance using the specified properties.
     * @param [properties] Properties to set
     * @returns AccStats instance
     */
    public static create(properties?: IAccStats): AccStats;

    /**
     * Encodes the specified AccStats message. Does not implicitly {@link AccStats.verify|verify} messages.
     * @param message AccStats message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IAccStats, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified AccStats message, length delimited. Does not implicitly {@link AccStats.verify|verify} messages.
     * @param message AccStats message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IAccStats, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an AccStats message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns AccStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): AccStats;

    /**
     * Decodes an AccStats message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns AccStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): AccStats;

    /**
     * Verifies an AccStats message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an AccStats message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns AccStats
     */
    public static fromObject(object: { [k: string]: any }): AccStats;

    /**
     * Creates a plain object from an AccStats message. Also converts values to other types if specified.
     * @param message AccStats
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: AccStats, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this AccStats to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for AccStats
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents an EnvData. */
export class EnvData implements IEnvData {

    /**
     * Constructs a new EnvData.
     * @param [properties] Properties to set
     */
    constructor(properties?: IEnvData);

    /** EnvData temperatureX10. */
    public temperatureX10?: (number|null);

    /** EnvData humidityX10. */
    public humidityX10?: (number|null);

    /** EnvData gas. */
    public gas?: (number|null);

    /** EnvData pressure. */
    public pressure?: (number|null);

    /** EnvData light. */
    public light?: (number|null);

    /** EnvData timestamp. */
    public timestamp?: (number|null);

    /** EnvData _temperatureX10. */
    public _temperatureX10?: "temperatureX10";

    /** EnvData _humidityX10. */
    public _humidityX10?: "humidityX10";

    /** EnvData _gas. */
    public _gas?: "gas";

    /** EnvData _pressure. */
    public _pressure?: "pressure";

    /** EnvData _light. */
    public _light?: "light";

    /** EnvData _timestamp. */
    public _timestamp?: "timestamp";

    /**
     * Creates a new EnvData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns EnvData instance
     */
    public static create(properties?: IEnvData): EnvData;

    /**
     * Encodes the specified EnvData message. Does not implicitly {@link EnvData.verify|verify} messages.
     * @param message EnvData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IEnvData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified EnvData message, length delimited. Does not implicitly {@link EnvData.verify|verify} messages.
     * @param message EnvData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IEnvData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an EnvData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns EnvData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): EnvData;

    /**
     * Decodes an EnvData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns EnvData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): EnvData;

    /**
     * Verifies an EnvData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an EnvData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns EnvData
     */
    public static fromObject(object: { [k: string]: any }): EnvData;

    /**
     * Creates a plain object from an EnvData message. Also converts values to other types if specified.
     * @param message EnvData
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: EnvData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this EnvData to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for EnvData
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a ParticulateData. */
export class ParticulateData implements IParticulateData {

    /**
     * Constructs a new ParticulateData.
     * @param [properties] Properties to set
     */
    constructor(properties?: IParticulateData);

    /** ParticulateData pm1. */
    public pm1: number;

    /** ParticulateData pm2_5. */
    public pm2_5: number;

    /** ParticulateData pm10. */
    public pm10: number;

    /** ParticulateData timestamp. */
    public timestamp?: (number|null);

    /** ParticulateData _timestamp. */
    public _timestamp?: "timestamp";

    /**
     * Creates a new ParticulateData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ParticulateData instance
     */
    public static create(properties?: IParticulateData): ParticulateData;

    /**
     * Encodes the specified ParticulateData message. Does not implicitly {@link ParticulateData.verify|verify} messages.
     * @param message ParticulateData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IParticulateData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ParticulateData message, length delimited. Does not implicitly {@link ParticulateData.verify|verify} messages.
     * @param message ParticulateData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IParticulateData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ParticulateData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ParticulateData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ParticulateData;

    /**
     * Decodes a ParticulateData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ParticulateData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ParticulateData;

    /**
     * Verifies a ParticulateData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ParticulateData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ParticulateData
     */
    public static fromObject(object: { [k: string]: any }): ParticulateData;

    /**
     * Creates a plain object from a ParticulateData message. Also converts values to other types if specified.
     * @param message ParticulateData
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ParticulateData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ParticulateData to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ParticulateData
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents an ErrorFlags. */
export class ErrorFlags implements IErrorFlags {

    /**
     * Constructs a new ErrorFlags.
     * @param [properties] Properties to set
     */
    constructor(properties?: IErrorFlags);

    /** ErrorFlags flag. */
    public flag: number;

    /**
     * Creates a new ErrorFlags instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ErrorFlags instance
     */
    public static create(properties?: IErrorFlags): ErrorFlags;

    /**
     * Encodes the specified ErrorFlags message. Does not implicitly {@link ErrorFlags.verify|verify} messages.
     * @param message ErrorFlags message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IErrorFlags, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ErrorFlags message, length delimited. Does not implicitly {@link ErrorFlags.verify|verify} messages.
     * @param message ErrorFlags message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IErrorFlags, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an ErrorFlags message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ErrorFlags
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ErrorFlags;

    /**
     * Decodes an ErrorFlags message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ErrorFlags
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ErrorFlags;

    /**
     * Verifies an ErrorFlags message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an ErrorFlags message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ErrorFlags
     */
    public static fromObject(object: { [k: string]: any }): ErrorFlags;

    /**
     * Creates a plain object from an ErrorFlags message. Also converts values to other types if specified.
     * @param message ErrorFlags
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ErrorFlags, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ErrorFlags to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ErrorFlags
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a Deployment. */
export class Deployment implements IDeployment {

    /**
     * Constructs a new Deployment.
     * @param [properties] Properties to set
     */
    constructor(properties?: IDeployment);

    /** Deployment particulateData. */
    public particulateData?: (IParticulateData|null);

    /** Deployment envData. */
    public envData?: (IEnvData|null);

    /** Deployment spaceRemainingMb. */
    public spaceRemainingMb?: (number|null);

    /** Deployment batteryPercentageX10. */
    public batteryPercentageX10: number;

    /** Deployment accStats. */
    public accStats?: (IAccStats|null);

    /** Deployment steps. */
    public steps?: (number|null);

    /** Deployment gpsData. */
    public gpsData?: (IGPSData_2|null);

    /** Deployment errorFlags. */
    public errorFlags?: (IErrorFlags|null);

    /** Deployment _particulateData. */
    public _particulateData?: "particulateData";

    /** Deployment _envData. */
    public _envData?: "envData";

    /** Deployment _spaceRemainingMb. */
    public _spaceRemainingMb?: "spaceRemainingMb";

    /** Deployment _accStats. */
    public _accStats?: "accStats";

    /** Deployment _steps. */
    public _steps?: "steps";

    /** Deployment _gpsData. */
    public _gpsData?: "gpsData";

    /** Deployment _errorFlags. */
    public _errorFlags?: "errorFlags";

    /**
     * Creates a new Deployment instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Deployment instance
     */
    public static create(properties?: IDeployment): Deployment;

    /**
     * Encodes the specified Deployment message. Does not implicitly {@link Deployment.verify|verify} messages.
     * @param message Deployment message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IDeployment, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Deployment message, length delimited. Does not implicitly {@link Deployment.verify|verify} messages.
     * @param message Deployment message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IDeployment, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Deployment message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Deployment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Deployment;

    /**
     * Decodes a Deployment message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Deployment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Deployment;

    /**
     * Verifies a Deployment message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Deployment message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Deployment
     */
    public static fromObject(object: { [k: string]: any }): Deployment;

    /**
     * Creates a plain object from a Deployment message. Also converts values to other types if specified.
     * @param message Deployment
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Deployment, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Deployment to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Deployment
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a MessagePacket. */
export class MessagePacket implements IMessagePacket {

    /**
     * Constructs a new MessagePacket.
     * @param [properties] Properties to set
     */
    constructor(properties?: IMessagePacket);

    /** MessagePacket header. */
    public header?: (IPacketHeader|null);

    /** MessagePacket systemInfoPacket. */
    public systemInfoPacket?: (ISystemInfoPacket|null);

    /** MessagePacket configPacket. */
    public configPacket?: (IConfigPacket|null);

    /** MessagePacket ackPacket. */
    public ackPacket?: (IAckPacket|null);

    /** MessagePacket systemDeploymentPacket. */
    public systemDeploymentPacket?: (IDeployment|null);

    /** MessagePacket radioInfo. */
    public radioInfo?: (IRadioInfo|null);

    /** MessagePacket payload. */
    public payload?: ("systemInfoPacket"|"configPacket"|"ackPacket"|"systemDeploymentPacket");

    /** MessagePacket _radioInfo. */
    public _radioInfo?: "radioInfo";

    /**
     * Creates a new MessagePacket instance using the specified properties.
     * @param [properties] Properties to set
     * @returns MessagePacket instance
     */
    public static create(properties?: IMessagePacket): MessagePacket;

    /**
     * Encodes the specified MessagePacket message. Does not implicitly {@link MessagePacket.verify|verify} messages.
     * @param message MessagePacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IMessagePacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified MessagePacket message, length delimited. Does not implicitly {@link MessagePacket.verify|verify} messages.
     * @param message MessagePacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IMessagePacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a MessagePacket message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns MessagePacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): MessagePacket;

    /**
     * Decodes a MessagePacket message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns MessagePacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): MessagePacket;

    /**
     * Verifies a MessagePacket message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a MessagePacket message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns MessagePacket
     */
    public static fromObject(object: { [k: string]: any }): MessagePacket;

    /**
     * Creates a plain object from a MessagePacket message. Also converts values to other types if specified.
     * @param message MessagePacket
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: MessagePacket, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this MessagePacket to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for MessagePacket
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
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

    /** RadioOTAA nwkKey. */
    public nwkKey: Uint8Array;

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

/** RadioSpreadingFactor enum. */
export enum RadioSpreadingFactor {
    SF7 = 0,
    SF8 = 1,
    SF9 = 2,
    SF10 = 3,
    SF11 = 4,
    SF12 = 5
}

/** RadioBandwidth enum. */
export enum RadioBandwidth {
    bw_125 = 0,
    bw_250 = 1,
    bw_500 = 2
}

/** RadioCodingRate enum. */
export enum RadioCodingRate {
    cr_4_5 = 0,
    cr_4_6 = 1,
    cr_4_7 = 2,
    cr_4_8 = 3
}

/** Represents a LoRaWANConfig. */
export class LoRaWANConfig implements ILoRaWANConfig {

    /**
     * Constructs a new LoRaWANConfig.
     * @param [properties] Properties to set
     */
    constructor(properties?: ILoRaWANConfig);

    /** LoRaWANConfig region. */
    public region: RadioRegion;

    /** LoRaWANConfig auth. */
    public auth: RadioAuth;

    /** LoRaWANConfig otaa. */
    public otaa?: (IRadioOTAA|null);

    /** LoRaWANConfig abp. */
    public abp?: (IRadioABP|null);

    /** LoRaWANConfig transmitIntervalMin. */
    public transmitIntervalMin: number;

    /** LoRaWANConfig txOnlyOnNewGpsFix. */
    public txOnlyOnNewGpsFix: boolean;

    /** LoRaWANConfig txPowerDbm. */
    public txPowerDbm: number;

    /** LoRaWANConfig credentials. */
    public credentials?: ("otaa"|"abp");

    /**
     * Creates a new LoRaWANConfig instance using the specified properties.
     * @param [properties] Properties to set
     * @returns LoRaWANConfig instance
     */
    public static create(properties?: ILoRaWANConfig): LoRaWANConfig;

    /**
     * Encodes the specified LoRaWANConfig message. Does not implicitly {@link LoRaWANConfig.verify|verify} messages.
     * @param message LoRaWANConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ILoRaWANConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified LoRaWANConfig message, length delimited. Does not implicitly {@link LoRaWANConfig.verify|verify} messages.
     * @param message LoRaWANConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ILoRaWANConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a LoRaWANConfig message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns LoRaWANConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LoRaWANConfig;

    /**
     * Decodes a LoRaWANConfig message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns LoRaWANConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LoRaWANConfig;

    /**
     * Verifies a LoRaWANConfig message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a LoRaWANConfig message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns LoRaWANConfig
     */
    public static fromObject(object: { [k: string]: any }): LoRaWANConfig;

    /**
     * Creates a plain object from a LoRaWANConfig message. Also converts values to other types if specified.
     * @param message LoRaWANConfig
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: LoRaWANConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this LoRaWANConfig to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for LoRaWANConfig
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a LoRaConfig. */
export class LoRaConfig implements ILoRaConfig {

    /**
     * Constructs a new LoRaConfig.
     * @param [properties] Properties to set
     */
    constructor(properties?: ILoRaConfig);

    /** LoRaConfig radioSpreadingFactor. */
    public radioSpreadingFactor: RadioSpreadingFactor;

    /** LoRaConfig radioBandwidth. */
    public radioBandwidth: RadioBandwidth;

    /** LoRaConfig radioCodingRate. */
    public radioCodingRate: RadioCodingRate;

    /** LoRaConfig txPowerDbm. */
    public txPowerDbm: number;

    /** LoRaConfig syncWord. */
    public syncWord: number;

    /** LoRaConfig frequency. */
    public frequency: number;

    /**
     * Creates a new LoRaConfig instance using the specified properties.
     * @param [properties] Properties to set
     * @returns LoRaConfig instance
     */
    public static create(properties?: ILoRaConfig): LoRaConfig;

    /**
     * Encodes the specified LoRaConfig message. Does not implicitly {@link LoRaConfig.verify|verify} messages.
     * @param message LoRaConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ILoRaConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified LoRaConfig message, length delimited. Does not implicitly {@link LoRaConfig.verify|verify} messages.
     * @param message LoRaConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ILoRaConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a LoRaConfig message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns LoRaConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LoRaConfig;

    /**
     * Decodes a LoRaConfig message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns LoRaConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LoRaConfig;

    /**
     * Verifies a LoRaConfig message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a LoRaConfig message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns LoRaConfig
     */
    public static fromObject(object: { [k: string]: any }): LoRaConfig;

    /**
     * Creates a plain object from a LoRaConfig message. Also converts values to other types if specified.
     * @param message LoRaConfig
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: LoRaConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this LoRaConfig to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for LoRaConfig
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a LostMode_config. */
export class LostMode_config implements ILostMode_config {

    /**
     * Constructs a new LostMode_config.
     * @param [properties] Properties to set
     */
    constructor(properties?: ILostMode_config);

    /** LostMode_config activationEpoch. */
    public activationEpoch: number;

    /** LostMode_config transmitIntervalMin. */
    public transmitIntervalMin: number;

    /** LostMode_config txPowerDbm. */
    public txPowerDbm: number;

    /**
     * Creates a new LostMode_config instance using the specified properties.
     * @param [properties] Properties to set
     * @returns LostMode_config instance
     */
    public static create(properties?: ILostMode_config): LostMode_config;

    /**
     * Encodes the specified LostMode_config message. Does not implicitly {@link LostMode_config.verify|verify} messages.
     * @param message LostMode_config message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ILostMode_config, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified LostMode_config message, length delimited. Does not implicitly {@link LostMode_config.verify|verify} messages.
     * @param message LostMode_config message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ILostMode_config, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a LostMode_config message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns LostMode_config
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LostMode_config;

    /**
     * Decodes a LostMode_config message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns LostMode_config
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LostMode_config;

    /**
     * Verifies a LostMode_config message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a LostMode_config message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns LostMode_config
     */
    public static fromObject(object: { [k: string]: any }): LostMode_config;

    /**
     * Creates a plain object from a LostMode_config message. Also converts values to other types if specified.
     * @param message LostMode_config
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: LostMode_config, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this LostMode_config to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for LostMode_config
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

    /** RadioConfigPacket loRaWANConfig. */
    public loRaWANConfig?: (ILoRaWANConfig|null);

    /** RadioConfigPacket loRaConfig. */
    public loRaConfig?: (ILoRaConfig|null);

    /** RadioConfigPacket lostModeEnabled. */
    public lostModeEnabled: boolean;

    /** RadioConfigPacket lostModeConfig. */
    public lostModeConfig?: (ILostMode_config|null);

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

/** Represents a ScheduleConfig. */
export class ScheduleConfig implements IScheduleConfig {

    /**
     * Constructs a new ScheduleConfig.
     * @param [properties] Properties to set
     */
    constructor(properties?: IScheduleConfig);

    /** ScheduleConfig window. */
    public window?: (ITimeWindow|null);

    /** ScheduleConfig light. */
    public light?: (ISamplingConfig|null);

    /** ScheduleConfig environmental. */
    public environmental?: (ISamplingConfig|null);

    /** ScheduleConfig particulate. */
    public particulate?: (ISamplingConfig|null);

    /** ScheduleConfig gps. */
    public gps?: (IGPSConfig|null);

    /** ScheduleConfig microphone. */
    public microphone?: (IMicrophoneConfig|null);

    /** ScheduleConfig accelerometer. */
    public accelerometer?: (IAccelerometerConfig|null);

    /** ScheduleConfig lorawanEnabled. */
    public lorawanEnabled: boolean;

    /** ScheduleConfig lorawanSendIntervalMin. */
    public lorawanSendIntervalMin: number;

    /** ScheduleConfig loraEnabled. */
    public loraEnabled: boolean;

    /** ScheduleConfig loraSendIntervalMin. */
    public loraSendIntervalMin: number;

    /** ScheduleConfig magnetometer. */
    public magnetometer?: (IMagnetometerConfig|null);

    /**
     * Creates a new ScheduleConfig instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ScheduleConfig instance
     */
    public static create(properties?: IScheduleConfig): ScheduleConfig;

    /**
     * Encodes the specified ScheduleConfig message. Does not implicitly {@link ScheduleConfig.verify|verify} messages.
     * @param message ScheduleConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IScheduleConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ScheduleConfig message, length delimited. Does not implicitly {@link ScheduleConfig.verify|verify} messages.
     * @param message ScheduleConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IScheduleConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ScheduleConfig message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ScheduleConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ScheduleConfig;

    /**
     * Decodes a ScheduleConfig message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ScheduleConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ScheduleConfig;

    /**
     * Verifies a ScheduleConfig message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a ScheduleConfig message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ScheduleConfig
     */
    public static fromObject(object: { [k: string]: any }): ScheduleConfig;

    /**
     * Creates a plain object from a ScheduleConfig message. Also converts values to other types if specified.
     * @param message ScheduleConfig
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: ScheduleConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this ScheduleConfig to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for ScheduleConfig
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
    public schedules: IScheduleConfig[];

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

/** Represents a BlePacket. */
export class BlePacket implements IBlePacket {

    /**
     * Constructs a new BlePacket.
     * @param [properties] Properties to set
     */
    constructor(properties?: IBlePacket);

    /** BlePacket header. */
    public header?: (IPacketHeader|null);

    /** BlePacket scheduleConfigPacket. */
    public scheduleConfigPacket?: (IScheduleConfigPacket|null);

    /** BlePacket systemStatePacket. */
    public systemStatePacket?: (ISystemStatePacket|null);

    /** BlePacket radioConfigPacket. */
    public radioConfigPacket?: (IRadioConfigPacket|null);

    /** BlePacket peripheralPacket. */
    public peripheralPacket?: (IPeripheralPacket|null);

    /** BlePacket peripheralInfo. */
    public peripheralInfo?: (IPeripheralInfo|null);

    /** BlePacket payload. */
    public payload?: ("scheduleConfigPacket"|"systemStatePacket"|"radioConfigPacket"|"peripheralPacket"|"peripheralInfo");

    /**
     * Creates a new BlePacket instance using the specified properties.
     * @param [properties] Properties to set
     * @returns BlePacket instance
     */
    public static create(properties?: IBlePacket): BlePacket;

    /**
     * Encodes the specified BlePacket message. Does not implicitly {@link BlePacket.verify|verify} messages.
     * @param message BlePacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IBlePacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified BlePacket message, length delimited. Does not implicitly {@link BlePacket.verify|verify} messages.
     * @param message BlePacket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IBlePacket, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a BlePacket message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns BlePacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): BlePacket;

    /**
     * Decodes a BlePacket message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns BlePacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): BlePacket;

    /**
     * Verifies a BlePacket message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a BlePacket message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns BlePacket
     */
    public static fromObject(object: { [k: string]: any }): BlePacket;

    /**
     * Creates a plain object from a BlePacket message. Also converts values to other types if specified.
     * @param message BlePacket
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: BlePacket, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this BlePacket to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for BlePacket
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}
