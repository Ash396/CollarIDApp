/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.PacketHeader = (function() {

    /**
     * Properties of a PacketHeader.
     * @exports IPacketHeader
     * @interface IPacketHeader
     * @property {number|null} [systemUid] PacketHeader systemUid
     * @property {number|null} [msFromStart] PacketHeader msFromStart
     * @property {number|null} [epoch] PacketHeader epoch
     * @property {number|null} [packetIndex] PacketHeader packetIndex
     * @property {boolean|null} [requestAck] PacketHeader requestAck
     */

    /**
     * Constructs a new PacketHeader.
     * @exports PacketHeader
     * @classdesc Represents a PacketHeader.
     * @implements IPacketHeader
     * @constructor
     * @param {IPacketHeader=} [properties] Properties to set
     */
    function PacketHeader(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PacketHeader systemUid.
     * @member {number} systemUid
     * @memberof PacketHeader
     * @instance
     */
    PacketHeader.prototype.systemUid = 0;

    /**
     * PacketHeader msFromStart.
     * @member {number} msFromStart
     * @memberof PacketHeader
     * @instance
     */
    PacketHeader.prototype.msFromStart = 0;

    /**
     * PacketHeader epoch.
     * @member {number} epoch
     * @memberof PacketHeader
     * @instance
     */
    PacketHeader.prototype.epoch = 0;

    /**
     * PacketHeader packetIndex.
     * @member {number} packetIndex
     * @memberof PacketHeader
     * @instance
     */
    PacketHeader.prototype.packetIndex = 0;

    /**
     * PacketHeader requestAck.
     * @member {boolean|null|undefined} requestAck
     * @memberof PacketHeader
     * @instance
     */
    PacketHeader.prototype.requestAck = null;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * PacketHeader _requestAck.
     * @member {"requestAck"|undefined} _requestAck
     * @memberof PacketHeader
     * @instance
     */
    Object.defineProperty(PacketHeader.prototype, "_requestAck", {
        get: $util.oneOfGetter($oneOfFields = ["requestAck"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new PacketHeader instance using the specified properties.
     * @function create
     * @memberof PacketHeader
     * @static
     * @param {IPacketHeader=} [properties] Properties to set
     * @returns {PacketHeader} PacketHeader instance
     */
    PacketHeader.create = function create(properties) {
        return new PacketHeader(properties);
    };

    /**
     * Encodes the specified PacketHeader message. Does not implicitly {@link PacketHeader.verify|verify} messages.
     * @function encode
     * @memberof PacketHeader
     * @static
     * @param {IPacketHeader} message PacketHeader message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PacketHeader.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.systemUid != null && Object.hasOwnProperty.call(message, "systemUid"))
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.systemUid);
        if (message.msFromStart != null && Object.hasOwnProperty.call(message, "msFromStart"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.msFromStart);
        if (message.epoch != null && Object.hasOwnProperty.call(message, "epoch"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.epoch);
        if (message.packetIndex != null && Object.hasOwnProperty.call(message, "packetIndex"))
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.packetIndex);
        if (message.requestAck != null && Object.hasOwnProperty.call(message, "requestAck"))
            writer.uint32(/* id 5, wireType 0 =*/40).bool(message.requestAck);
        return writer;
    };

    /**
     * Encodes the specified PacketHeader message, length delimited. Does not implicitly {@link PacketHeader.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PacketHeader
     * @static
     * @param {IPacketHeader} message PacketHeader message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PacketHeader.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PacketHeader message from the specified reader or buffer.
     * @function decode
     * @memberof PacketHeader
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PacketHeader} PacketHeader
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PacketHeader.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PacketHeader();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.systemUid = reader.uint32();
                    break;
                }
            case 2: {
                    message.msFromStart = reader.uint32();
                    break;
                }
            case 3: {
                    message.epoch = reader.uint32();
                    break;
                }
            case 4: {
                    message.packetIndex = reader.uint32();
                    break;
                }
            case 5: {
                    message.requestAck = reader.bool();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a PacketHeader message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PacketHeader
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PacketHeader} PacketHeader
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PacketHeader.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PacketHeader message.
     * @function verify
     * @memberof PacketHeader
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PacketHeader.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        var properties = {};
        if (message.systemUid != null && message.hasOwnProperty("systemUid"))
            if (!$util.isInteger(message.systemUid))
                return "systemUid: integer expected";
        if (message.msFromStart != null && message.hasOwnProperty("msFromStart"))
            if (!$util.isInteger(message.msFromStart))
                return "msFromStart: integer expected";
        if (message.epoch != null && message.hasOwnProperty("epoch"))
            if (!$util.isInteger(message.epoch))
                return "epoch: integer expected";
        if (message.packetIndex != null && message.hasOwnProperty("packetIndex"))
            if (!$util.isInteger(message.packetIndex))
                return "packetIndex: integer expected";
        if (message.requestAck != null && message.hasOwnProperty("requestAck")) {
            properties._requestAck = 1;
            if (typeof message.requestAck !== "boolean")
                return "requestAck: boolean expected";
        }
        return null;
    };

    /**
     * Creates a PacketHeader message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PacketHeader
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PacketHeader} PacketHeader
     */
    PacketHeader.fromObject = function fromObject(object) {
        if (object instanceof $root.PacketHeader)
            return object;
        var message = new $root.PacketHeader();
        if (object.systemUid != null)
            message.systemUid = object.systemUid >>> 0;
        if (object.msFromStart != null)
            message.msFromStart = object.msFromStart >>> 0;
        if (object.epoch != null)
            message.epoch = object.epoch >>> 0;
        if (object.packetIndex != null)
            message.packetIndex = object.packetIndex >>> 0;
        if (object.requestAck != null)
            message.requestAck = Boolean(object.requestAck);
        return message;
    };

    /**
     * Creates a plain object from a PacketHeader message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PacketHeader
     * @static
     * @param {PacketHeader} message PacketHeader
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PacketHeader.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.systemUid = 0;
            object.msFromStart = 0;
            object.epoch = 0;
            object.packetIndex = 0;
        }
        if (message.systemUid != null && message.hasOwnProperty("systemUid"))
            object.systemUid = message.systemUid;
        if (message.msFromStart != null && message.hasOwnProperty("msFromStart"))
            object.msFromStart = message.msFromStart;
        if (message.epoch != null && message.hasOwnProperty("epoch"))
            object.epoch = message.epoch;
        if (message.packetIndex != null && message.hasOwnProperty("packetIndex"))
            object.packetIndex = message.packetIndex;
        if (message.requestAck != null && message.hasOwnProperty("requestAck")) {
            object.requestAck = message.requestAck;
            if (options.oneofs)
                object._requestAck = "requestAck";
        }
        return object;
    };

    /**
     * Converts this PacketHeader to JSON.
     * @function toJSON
     * @memberof PacketHeader
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PacketHeader.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for PacketHeader
     * @function getTypeUrl
     * @memberof PacketHeader
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PacketHeader.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PacketHeader";
    };

    return PacketHeader;
})();

$root.GPSData = (function() {

    /**
     * Properties of a GPSData.
     * @exports IGPSData
     * @interface IGPSData
     * @property {number|null} [latitude] GPSData latitude
     * @property {number|null} [longitude] GPSData longitude
     * @property {number|null} [altitude] GPSData altitude
     * @property {number|null} [speed] GPSData speed
     * @property {number|null} [heading] GPSData heading
     */

    /**
     * Constructs a new GPSData.
     * @exports GPSData
     * @classdesc Represents a GPSData.
     * @implements IGPSData
     * @constructor
     * @param {IGPSData=} [properties] Properties to set
     */
    function GPSData(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * GPSData latitude.
     * @member {number} latitude
     * @memberof GPSData
     * @instance
     */
    GPSData.prototype.latitude = 0;

    /**
     * GPSData longitude.
     * @member {number} longitude
     * @memberof GPSData
     * @instance
     */
    GPSData.prototype.longitude = 0;

    /**
     * GPSData altitude.
     * @member {number} altitude
     * @memberof GPSData
     * @instance
     */
    GPSData.prototype.altitude = 0;

    /**
     * GPSData speed.
     * @member {number} speed
     * @memberof GPSData
     * @instance
     */
    GPSData.prototype.speed = 0;

    /**
     * GPSData heading.
     * @member {number} heading
     * @memberof GPSData
     * @instance
     */
    GPSData.prototype.heading = 0;

    /**
     * Creates a new GPSData instance using the specified properties.
     * @function create
     * @memberof GPSData
     * @static
     * @param {IGPSData=} [properties] Properties to set
     * @returns {GPSData} GPSData instance
     */
    GPSData.create = function create(properties) {
        return new GPSData(properties);
    };

    /**
     * Encodes the specified GPSData message. Does not implicitly {@link GPSData.verify|verify} messages.
     * @function encode
     * @memberof GPSData
     * @static
     * @param {IGPSData} message GPSData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GPSData.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.latitude != null && Object.hasOwnProperty.call(message, "latitude"))
            writer.uint32(/* id 1, wireType 5 =*/13).float(message.latitude);
        if (message.longitude != null && Object.hasOwnProperty.call(message, "longitude"))
            writer.uint32(/* id 2, wireType 5 =*/21).float(message.longitude);
        if (message.altitude != null && Object.hasOwnProperty.call(message, "altitude"))
            writer.uint32(/* id 3, wireType 5 =*/29).float(message.altitude);
        if (message.speed != null && Object.hasOwnProperty.call(message, "speed"))
            writer.uint32(/* id 4, wireType 5 =*/37).float(message.speed);
        if (message.heading != null && Object.hasOwnProperty.call(message, "heading"))
            writer.uint32(/* id 5, wireType 5 =*/45).float(message.heading);
        return writer;
    };

    /**
     * Encodes the specified GPSData message, length delimited. Does not implicitly {@link GPSData.verify|verify} messages.
     * @function encodeDelimited
     * @memberof GPSData
     * @static
     * @param {IGPSData} message GPSData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GPSData.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a GPSData message from the specified reader or buffer.
     * @function decode
     * @memberof GPSData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {GPSData} GPSData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GPSData.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GPSData();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.latitude = reader.float();
                    break;
                }
            case 2: {
                    message.longitude = reader.float();
                    break;
                }
            case 3: {
                    message.altitude = reader.float();
                    break;
                }
            case 4: {
                    message.speed = reader.float();
                    break;
                }
            case 5: {
                    message.heading = reader.float();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a GPSData message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof GPSData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {GPSData} GPSData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GPSData.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a GPSData message.
     * @function verify
     * @memberof GPSData
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    GPSData.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.latitude != null && message.hasOwnProperty("latitude"))
            if (typeof message.latitude !== "number")
                return "latitude: number expected";
        if (message.longitude != null && message.hasOwnProperty("longitude"))
            if (typeof message.longitude !== "number")
                return "longitude: number expected";
        if (message.altitude != null && message.hasOwnProperty("altitude"))
            if (typeof message.altitude !== "number")
                return "altitude: number expected";
        if (message.speed != null && message.hasOwnProperty("speed"))
            if (typeof message.speed !== "number")
                return "speed: number expected";
        if (message.heading != null && message.hasOwnProperty("heading"))
            if (typeof message.heading !== "number")
                return "heading: number expected";
        return null;
    };

    /**
     * Creates a GPSData message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof GPSData
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {GPSData} GPSData
     */
    GPSData.fromObject = function fromObject(object) {
        if (object instanceof $root.GPSData)
            return object;
        var message = new $root.GPSData();
        if (object.latitude != null)
            message.latitude = Number(object.latitude);
        if (object.longitude != null)
            message.longitude = Number(object.longitude);
        if (object.altitude != null)
            message.altitude = Number(object.altitude);
        if (object.speed != null)
            message.speed = Number(object.speed);
        if (object.heading != null)
            message.heading = Number(object.heading);
        return message;
    };

    /**
     * Creates a plain object from a GPSData message. Also converts values to other types if specified.
     * @function toObject
     * @memberof GPSData
     * @static
     * @param {GPSData} message GPSData
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    GPSData.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.latitude = 0;
            object.longitude = 0;
            object.altitude = 0;
            object.speed = 0;
            object.heading = 0;
        }
        if (message.latitude != null && message.hasOwnProperty("latitude"))
            object.latitude = options.json && !isFinite(message.latitude) ? String(message.latitude) : message.latitude;
        if (message.longitude != null && message.hasOwnProperty("longitude"))
            object.longitude = options.json && !isFinite(message.longitude) ? String(message.longitude) : message.longitude;
        if (message.altitude != null && message.hasOwnProperty("altitude"))
            object.altitude = options.json && !isFinite(message.altitude) ? String(message.altitude) : message.altitude;
        if (message.speed != null && message.hasOwnProperty("speed"))
            object.speed = options.json && !isFinite(message.speed) ? String(message.speed) : message.speed;
        if (message.heading != null && message.hasOwnProperty("heading"))
            object.heading = options.json && !isFinite(message.heading) ? String(message.heading) : message.heading;
        return object;
    };

    /**
     * Converts this GPSData to JSON.
     * @function toJSON
     * @memberof GPSData
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    GPSData.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for GPSData
     * @function getTypeUrl
     * @memberof GPSData
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    GPSData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/GPSData";
    };

    return GPSData;
})();

$root.BatteryState = (function() {

    /**
     * Properties of a BatteryState.
     * @exports IBatteryState
     * @interface IBatteryState
     * @property {boolean|null} [charging] BatteryState charging
     * @property {number|null} [voltage] BatteryState voltage
     * @property {number|null} [percentage] BatteryState percentage
     */

    /**
     * Constructs a new BatteryState.
     * @exports BatteryState
     * @classdesc Represents a BatteryState.
     * @implements IBatteryState
     * @constructor
     * @param {IBatteryState=} [properties] Properties to set
     */
    function BatteryState(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * BatteryState charging.
     * @member {boolean} charging
     * @memberof BatteryState
     * @instance
     */
    BatteryState.prototype.charging = false;

    /**
     * BatteryState voltage.
     * @member {number} voltage
     * @memberof BatteryState
     * @instance
     */
    BatteryState.prototype.voltage = 0;

    /**
     * BatteryState percentage.
     * @member {number|null|undefined} percentage
     * @memberof BatteryState
     * @instance
     */
    BatteryState.prototype.percentage = null;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * BatteryState _percentage.
     * @member {"percentage"|undefined} _percentage
     * @memberof BatteryState
     * @instance
     */
    Object.defineProperty(BatteryState.prototype, "_percentage", {
        get: $util.oneOfGetter($oneOfFields = ["percentage"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new BatteryState instance using the specified properties.
     * @function create
     * @memberof BatteryState
     * @static
     * @param {IBatteryState=} [properties] Properties to set
     * @returns {BatteryState} BatteryState instance
     */
    BatteryState.create = function create(properties) {
        return new BatteryState(properties);
    };

    /**
     * Encodes the specified BatteryState message. Does not implicitly {@link BatteryState.verify|verify} messages.
     * @function encode
     * @memberof BatteryState
     * @static
     * @param {IBatteryState} message BatteryState message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BatteryState.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.charging != null && Object.hasOwnProperty.call(message, "charging"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.charging);
        if (message.voltage != null && Object.hasOwnProperty.call(message, "voltage"))
            writer.uint32(/* id 2, wireType 5 =*/21).float(message.voltage);
        if (message.percentage != null && Object.hasOwnProperty.call(message, "percentage"))
            writer.uint32(/* id 3, wireType 5 =*/29).float(message.percentage);
        return writer;
    };

    /**
     * Encodes the specified BatteryState message, length delimited. Does not implicitly {@link BatteryState.verify|verify} messages.
     * @function encodeDelimited
     * @memberof BatteryState
     * @static
     * @param {IBatteryState} message BatteryState message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BatteryState.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a BatteryState message from the specified reader or buffer.
     * @function decode
     * @memberof BatteryState
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {BatteryState} BatteryState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BatteryState.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.BatteryState();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.charging = reader.bool();
                    break;
                }
            case 2: {
                    message.voltage = reader.float();
                    break;
                }
            case 3: {
                    message.percentage = reader.float();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a BatteryState message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof BatteryState
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {BatteryState} BatteryState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BatteryState.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a BatteryState message.
     * @function verify
     * @memberof BatteryState
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    BatteryState.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        var properties = {};
        if (message.charging != null && message.hasOwnProperty("charging"))
            if (typeof message.charging !== "boolean")
                return "charging: boolean expected";
        if (message.voltage != null && message.hasOwnProperty("voltage"))
            if (typeof message.voltage !== "number")
                return "voltage: number expected";
        if (message.percentage != null && message.hasOwnProperty("percentage")) {
            properties._percentage = 1;
            if (typeof message.percentage !== "number")
                return "percentage: number expected";
        }
        return null;
    };

    /**
     * Creates a BatteryState message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof BatteryState
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {BatteryState} BatteryState
     */
    BatteryState.fromObject = function fromObject(object) {
        if (object instanceof $root.BatteryState)
            return object;
        var message = new $root.BatteryState();
        if (object.charging != null)
            message.charging = Boolean(object.charging);
        if (object.voltage != null)
            message.voltage = Number(object.voltage);
        if (object.percentage != null)
            message.percentage = Number(object.percentage);
        return message;
    };

    /**
     * Creates a plain object from a BatteryState message. Also converts values to other types if specified.
     * @function toObject
     * @memberof BatteryState
     * @static
     * @param {BatteryState} message BatteryState
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    BatteryState.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.charging = false;
            object.voltage = 0;
        }
        if (message.charging != null && message.hasOwnProperty("charging"))
            object.charging = message.charging;
        if (message.voltage != null && message.hasOwnProperty("voltage"))
            object.voltage = options.json && !isFinite(message.voltage) ? String(message.voltage) : message.voltage;
        if (message.percentage != null && message.hasOwnProperty("percentage")) {
            object.percentage = options.json && !isFinite(message.percentage) ? String(message.percentage) : message.percentage;
            if (options.oneofs)
                object._percentage = "percentage";
        }
        return object;
    };

    /**
     * Converts this BatteryState to JSON.
     * @function toJSON
     * @memberof BatteryState
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    BatteryState.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for BatteryState
     * @function getTypeUrl
     * @memberof BatteryState
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    BatteryState.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/BatteryState";
    };

    return BatteryState;
})();

$root.SDCardState = (function() {

    /**
     * Properties of a SDCardState.
     * @exports ISDCardState
     * @interface ISDCardState
     * @property {boolean|null} [detected] SDCardState detected
     * @property {number|Long|null} [spaceRemaining] SDCardState spaceRemaining
     * @property {number|Long|null} [totalSpace] SDCardState totalSpace
     */

    /**
     * Constructs a new SDCardState.
     * @exports SDCardState
     * @classdesc Represents a SDCardState.
     * @implements ISDCardState
     * @constructor
     * @param {ISDCardState=} [properties] Properties to set
     */
    function SDCardState(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * SDCardState detected.
     * @member {boolean} detected
     * @memberof SDCardState
     * @instance
     */
    SDCardState.prototype.detected = false;

    /**
     * SDCardState spaceRemaining.
     * @member {number|Long} spaceRemaining
     * @memberof SDCardState
     * @instance
     */
    SDCardState.prototype.spaceRemaining = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * SDCardState totalSpace.
     * @member {number|Long} totalSpace
     * @memberof SDCardState
     * @instance
     */
    SDCardState.prototype.totalSpace = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * Creates a new SDCardState instance using the specified properties.
     * @function create
     * @memberof SDCardState
     * @static
     * @param {ISDCardState=} [properties] Properties to set
     * @returns {SDCardState} SDCardState instance
     */
    SDCardState.create = function create(properties) {
        return new SDCardState(properties);
    };

    /**
     * Encodes the specified SDCardState message. Does not implicitly {@link SDCardState.verify|verify} messages.
     * @function encode
     * @memberof SDCardState
     * @static
     * @param {ISDCardState} message SDCardState message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SDCardState.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.detected != null && Object.hasOwnProperty.call(message, "detected"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.detected);
        if (message.spaceRemaining != null && Object.hasOwnProperty.call(message, "spaceRemaining"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.spaceRemaining);
        if (message.totalSpace != null && Object.hasOwnProperty.call(message, "totalSpace"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.totalSpace);
        return writer;
    };

    /**
     * Encodes the specified SDCardState message, length delimited. Does not implicitly {@link SDCardState.verify|verify} messages.
     * @function encodeDelimited
     * @memberof SDCardState
     * @static
     * @param {ISDCardState} message SDCardState message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SDCardState.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a SDCardState message from the specified reader or buffer.
     * @function decode
     * @memberof SDCardState
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {SDCardState} SDCardState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SDCardState.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.SDCardState();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.detected = reader.bool();
                    break;
                }
            case 2: {
                    message.spaceRemaining = reader.uint64();
                    break;
                }
            case 3: {
                    message.totalSpace = reader.uint64();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a SDCardState message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof SDCardState
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {SDCardState} SDCardState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SDCardState.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a SDCardState message.
     * @function verify
     * @memberof SDCardState
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    SDCardState.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.detected != null && message.hasOwnProperty("detected"))
            if (typeof message.detected !== "boolean")
                return "detected: boolean expected";
        if (message.spaceRemaining != null && message.hasOwnProperty("spaceRemaining"))
            if (!$util.isInteger(message.spaceRemaining) && !(message.spaceRemaining && $util.isInteger(message.spaceRemaining.low) && $util.isInteger(message.spaceRemaining.high)))
                return "spaceRemaining: integer|Long expected";
        if (message.totalSpace != null && message.hasOwnProperty("totalSpace"))
            if (!$util.isInteger(message.totalSpace) && !(message.totalSpace && $util.isInteger(message.totalSpace.low) && $util.isInteger(message.totalSpace.high)))
                return "totalSpace: integer|Long expected";
        return null;
    };

    /**
     * Creates a SDCardState message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof SDCardState
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {SDCardState} SDCardState
     */
    SDCardState.fromObject = function fromObject(object) {
        if (object instanceof $root.SDCardState)
            return object;
        var message = new $root.SDCardState();
        if (object.detected != null)
            message.detected = Boolean(object.detected);
        if (object.spaceRemaining != null)
            if ($util.Long)
                (message.spaceRemaining = $util.Long.fromValue(object.spaceRemaining)).unsigned = true;
            else if (typeof object.spaceRemaining === "string")
                message.spaceRemaining = parseInt(object.spaceRemaining, 10);
            else if (typeof object.spaceRemaining === "number")
                message.spaceRemaining = object.spaceRemaining;
            else if (typeof object.spaceRemaining === "object")
                message.spaceRemaining = new $util.LongBits(object.spaceRemaining.low >>> 0, object.spaceRemaining.high >>> 0).toNumber(true);
        if (object.totalSpace != null)
            if ($util.Long)
                (message.totalSpace = $util.Long.fromValue(object.totalSpace)).unsigned = true;
            else if (typeof object.totalSpace === "string")
                message.totalSpace = parseInt(object.totalSpace, 10);
            else if (typeof object.totalSpace === "number")
                message.totalSpace = object.totalSpace;
            else if (typeof object.totalSpace === "object")
                message.totalSpace = new $util.LongBits(object.totalSpace.low >>> 0, object.totalSpace.high >>> 0).toNumber(true);
        return message;
    };

    /**
     * Creates a plain object from a SDCardState message. Also converts values to other types if specified.
     * @function toObject
     * @memberof SDCardState
     * @static
     * @param {SDCardState} message SDCardState
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    SDCardState.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.detected = false;
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.spaceRemaining = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.spaceRemaining = options.longs === String ? "0" : 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.totalSpace = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.totalSpace = options.longs === String ? "0" : 0;
        }
        if (message.detected != null && message.hasOwnProperty("detected"))
            object.detected = message.detected;
        if (message.spaceRemaining != null && message.hasOwnProperty("spaceRemaining"))
            if (typeof message.spaceRemaining === "number")
                object.spaceRemaining = options.longs === String ? String(message.spaceRemaining) : message.spaceRemaining;
            else
                object.spaceRemaining = options.longs === String ? $util.Long.prototype.toString.call(message.spaceRemaining) : options.longs === Number ? new $util.LongBits(message.spaceRemaining.low >>> 0, message.spaceRemaining.high >>> 0).toNumber(true) : message.spaceRemaining;
        if (message.totalSpace != null && message.hasOwnProperty("totalSpace"))
            if (typeof message.totalSpace === "number")
                object.totalSpace = options.longs === String ? String(message.totalSpace) : message.totalSpace;
            else
                object.totalSpace = options.longs === String ? $util.Long.prototype.toString.call(message.totalSpace) : options.longs === Number ? new $util.LongBits(message.totalSpace.low >>> 0, message.totalSpace.high >>> 0).toNumber(true) : message.totalSpace;
        return object;
    };

    /**
     * Converts this SDCardState to JSON.
     * @function toJSON
     * @memberof SDCardState
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    SDCardState.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for SDCardState
     * @function getTypeUrl
     * @memberof SDCardState
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    SDCardState.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/SDCardState";
    };

    return SDCardState;
})();

/**
 * Activity enum.
 * @exports Activity
 * @enum {number}
 * @property {number} STILL=0 STILL value
 * @property {number} WALK=1 WALK value
 * @property {number} RUN=2 RUN value
 */
$root.Activity = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "STILL"] = 0;
    values[valuesById[1] = "WALK"] = 1;
    values[valuesById[2] = "RUN"] = 2;
    return values;
})();

$root.nanopb = (function() {

    /**
     * Namespace nanopb.
     * @exports nanopb
     * @namespace
     */
    var nanopb = {};

    return nanopb;
})();

$root.SystemInfoPacket = (function() {

    /**
     * Properties of a SystemInfoPacket.
     * @exports ISystemInfoPacket
     * @interface ISystemInfoPacket
     * @property {ISystemSensorSummary|null} [systemSensorSummary] SystemInfoPacket systemSensorSummary
     * @property {ISDCardState|null} [sdcardState] SystemInfoPacket sdcardState
     * @property {IBatteryState|null} [batteryState] SystemInfoPacket batteryState
     * @property {IMetadata|null} [metadata] SystemInfoPacket metadata
     * @property {IGPSData|null} [gpsData] SystemInfoPacket gpsData
     */

    /**
     * Constructs a new SystemInfoPacket.
     * @exports SystemInfoPacket
     * @classdesc Represents a SystemInfoPacket.
     * @implements ISystemInfoPacket
     * @constructor
     * @param {ISystemInfoPacket=} [properties] Properties to set
     */
    function SystemInfoPacket(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * SystemInfoPacket systemSensorSummary.
     * @member {ISystemSensorSummary|null|undefined} systemSensorSummary
     * @memberof SystemInfoPacket
     * @instance
     */
    SystemInfoPacket.prototype.systemSensorSummary = null;

    /**
     * SystemInfoPacket sdcardState.
     * @member {ISDCardState|null|undefined} sdcardState
     * @memberof SystemInfoPacket
     * @instance
     */
    SystemInfoPacket.prototype.sdcardState = null;

    /**
     * SystemInfoPacket batteryState.
     * @member {IBatteryState|null|undefined} batteryState
     * @memberof SystemInfoPacket
     * @instance
     */
    SystemInfoPacket.prototype.batteryState = null;

    /**
     * SystemInfoPacket metadata.
     * @member {IMetadata|null|undefined} metadata
     * @memberof SystemInfoPacket
     * @instance
     */
    SystemInfoPacket.prototype.metadata = null;

    /**
     * SystemInfoPacket gpsData.
     * @member {IGPSData|null|undefined} gpsData
     * @memberof SystemInfoPacket
     * @instance
     */
    SystemInfoPacket.prototype.gpsData = null;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * SystemInfoPacket _systemSensorSummary.
     * @member {"systemSensorSummary"|undefined} _systemSensorSummary
     * @memberof SystemInfoPacket
     * @instance
     */
    Object.defineProperty(SystemInfoPacket.prototype, "_systemSensorSummary", {
        get: $util.oneOfGetter($oneOfFields = ["systemSensorSummary"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * SystemInfoPacket _sdcardState.
     * @member {"sdcardState"|undefined} _sdcardState
     * @memberof SystemInfoPacket
     * @instance
     */
    Object.defineProperty(SystemInfoPacket.prototype, "_sdcardState", {
        get: $util.oneOfGetter($oneOfFields = ["sdcardState"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * SystemInfoPacket _batteryState.
     * @member {"batteryState"|undefined} _batteryState
     * @memberof SystemInfoPacket
     * @instance
     */
    Object.defineProperty(SystemInfoPacket.prototype, "_batteryState", {
        get: $util.oneOfGetter($oneOfFields = ["batteryState"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * SystemInfoPacket _metadata.
     * @member {"metadata"|undefined} _metadata
     * @memberof SystemInfoPacket
     * @instance
     */
    Object.defineProperty(SystemInfoPacket.prototype, "_metadata", {
        get: $util.oneOfGetter($oneOfFields = ["metadata"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * SystemInfoPacket _gpsData.
     * @member {"gpsData"|undefined} _gpsData
     * @memberof SystemInfoPacket
     * @instance
     */
    Object.defineProperty(SystemInfoPacket.prototype, "_gpsData", {
        get: $util.oneOfGetter($oneOfFields = ["gpsData"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new SystemInfoPacket instance using the specified properties.
     * @function create
     * @memberof SystemInfoPacket
     * @static
     * @param {ISystemInfoPacket=} [properties] Properties to set
     * @returns {SystemInfoPacket} SystemInfoPacket instance
     */
    SystemInfoPacket.create = function create(properties) {
        return new SystemInfoPacket(properties);
    };

    /**
     * Encodes the specified SystemInfoPacket message. Does not implicitly {@link SystemInfoPacket.verify|verify} messages.
     * @function encode
     * @memberof SystemInfoPacket
     * @static
     * @param {ISystemInfoPacket} message SystemInfoPacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SystemInfoPacket.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.systemSensorSummary != null && Object.hasOwnProperty.call(message, "systemSensorSummary"))
            $root.SystemSensorSummary.encode(message.systemSensorSummary, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.sdcardState != null && Object.hasOwnProperty.call(message, "sdcardState"))
            $root.SDCardState.encode(message.sdcardState, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.batteryState != null && Object.hasOwnProperty.call(message, "batteryState"))
            $root.BatteryState.encode(message.batteryState, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
            $root.Metadata.encode(message.metadata, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.gpsData != null && Object.hasOwnProperty.call(message, "gpsData"))
            $root.GPSData.encode(message.gpsData, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified SystemInfoPacket message, length delimited. Does not implicitly {@link SystemInfoPacket.verify|verify} messages.
     * @function encodeDelimited
     * @memberof SystemInfoPacket
     * @static
     * @param {ISystemInfoPacket} message SystemInfoPacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SystemInfoPacket.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a SystemInfoPacket message from the specified reader or buffer.
     * @function decode
     * @memberof SystemInfoPacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {SystemInfoPacket} SystemInfoPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SystemInfoPacket.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.SystemInfoPacket();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.systemSensorSummary = $root.SystemSensorSummary.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    message.sdcardState = $root.SDCardState.decode(reader, reader.uint32());
                    break;
                }
            case 3: {
                    message.batteryState = $root.BatteryState.decode(reader, reader.uint32());
                    break;
                }
            case 4: {
                    message.metadata = $root.Metadata.decode(reader, reader.uint32());
                    break;
                }
            case 5: {
                    message.gpsData = $root.GPSData.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a SystemInfoPacket message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof SystemInfoPacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {SystemInfoPacket} SystemInfoPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SystemInfoPacket.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a SystemInfoPacket message.
     * @function verify
     * @memberof SystemInfoPacket
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    SystemInfoPacket.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        var properties = {};
        if (message.systemSensorSummary != null && message.hasOwnProperty("systemSensorSummary")) {
            properties._systemSensorSummary = 1;
            {
                var error = $root.SystemSensorSummary.verify(message.systemSensorSummary);
                if (error)
                    return "systemSensorSummary." + error;
            }
        }
        if (message.sdcardState != null && message.hasOwnProperty("sdcardState")) {
            properties._sdcardState = 1;
            {
                var error = $root.SDCardState.verify(message.sdcardState);
                if (error)
                    return "sdcardState." + error;
            }
        }
        if (message.batteryState != null && message.hasOwnProperty("batteryState")) {
            properties._batteryState = 1;
            {
                var error = $root.BatteryState.verify(message.batteryState);
                if (error)
                    return "batteryState." + error;
            }
        }
        if (message.metadata != null && message.hasOwnProperty("metadata")) {
            properties._metadata = 1;
            {
                var error = $root.Metadata.verify(message.metadata);
                if (error)
                    return "metadata." + error;
            }
        }
        if (message.gpsData != null && message.hasOwnProperty("gpsData")) {
            properties._gpsData = 1;
            {
                var error = $root.GPSData.verify(message.gpsData);
                if (error)
                    return "gpsData." + error;
            }
        }
        return null;
    };

    /**
     * Creates a SystemInfoPacket message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof SystemInfoPacket
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {SystemInfoPacket} SystemInfoPacket
     */
    SystemInfoPacket.fromObject = function fromObject(object) {
        if (object instanceof $root.SystemInfoPacket)
            return object;
        var message = new $root.SystemInfoPacket();
        if (object.systemSensorSummary != null) {
            if (typeof object.systemSensorSummary !== "object")
                throw TypeError(".SystemInfoPacket.systemSensorSummary: object expected");
            message.systemSensorSummary = $root.SystemSensorSummary.fromObject(object.systemSensorSummary);
        }
        if (object.sdcardState != null) {
            if (typeof object.sdcardState !== "object")
                throw TypeError(".SystemInfoPacket.sdcardState: object expected");
            message.sdcardState = $root.SDCardState.fromObject(object.sdcardState);
        }
        if (object.batteryState != null) {
            if (typeof object.batteryState !== "object")
                throw TypeError(".SystemInfoPacket.batteryState: object expected");
            message.batteryState = $root.BatteryState.fromObject(object.batteryState);
        }
        if (object.metadata != null) {
            if (typeof object.metadata !== "object")
                throw TypeError(".SystemInfoPacket.metadata: object expected");
            message.metadata = $root.Metadata.fromObject(object.metadata);
        }
        if (object.gpsData != null) {
            if (typeof object.gpsData !== "object")
                throw TypeError(".SystemInfoPacket.gpsData: object expected");
            message.gpsData = $root.GPSData.fromObject(object.gpsData);
        }
        return message;
    };

    /**
     * Creates a plain object from a SystemInfoPacket message. Also converts values to other types if specified.
     * @function toObject
     * @memberof SystemInfoPacket
     * @static
     * @param {SystemInfoPacket} message SystemInfoPacket
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    SystemInfoPacket.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (message.systemSensorSummary != null && message.hasOwnProperty("systemSensorSummary")) {
            object.systemSensorSummary = $root.SystemSensorSummary.toObject(message.systemSensorSummary, options);
            if (options.oneofs)
                object._systemSensorSummary = "systemSensorSummary";
        }
        if (message.sdcardState != null && message.hasOwnProperty("sdcardState")) {
            object.sdcardState = $root.SDCardState.toObject(message.sdcardState, options);
            if (options.oneofs)
                object._sdcardState = "sdcardState";
        }
        if (message.batteryState != null && message.hasOwnProperty("batteryState")) {
            object.batteryState = $root.BatteryState.toObject(message.batteryState, options);
            if (options.oneofs)
                object._batteryState = "batteryState";
        }
        if (message.metadata != null && message.hasOwnProperty("metadata")) {
            object.metadata = $root.Metadata.toObject(message.metadata, options);
            if (options.oneofs)
                object._metadata = "metadata";
        }
        if (message.gpsData != null && message.hasOwnProperty("gpsData")) {
            object.gpsData = $root.GPSData.toObject(message.gpsData, options);
            if (options.oneofs)
                object._gpsData = "gpsData";
        }
        return object;
    };

    /**
     * Converts this SystemInfoPacket to JSON.
     * @function toJSON
     * @memberof SystemInfoPacket
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    SystemInfoPacket.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for SystemInfoPacket
     * @function getTypeUrl
     * @memberof SystemInfoPacket
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    SystemInfoPacket.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/SystemInfoPacket";
    };

    return SystemInfoPacket;
})();

$root.Metadata = (function() {

    /**
     * Properties of a Metadata.
     * @exports IMetadata
     * @interface IMetadata
     * @property {number|null} [gpsAvgFixTime] Metadata gpsAvgFixTime
     */

    /**
     * Constructs a new Metadata.
     * @exports Metadata
     * @classdesc Represents a Metadata.
     * @implements IMetadata
     * @constructor
     * @param {IMetadata=} [properties] Properties to set
     */
    function Metadata(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Metadata gpsAvgFixTime.
     * @member {number} gpsAvgFixTime
     * @memberof Metadata
     * @instance
     */
    Metadata.prototype.gpsAvgFixTime = 0;

    /**
     * Creates a new Metadata instance using the specified properties.
     * @function create
     * @memberof Metadata
     * @static
     * @param {IMetadata=} [properties] Properties to set
     * @returns {Metadata} Metadata instance
     */
    Metadata.create = function create(properties) {
        return new Metadata(properties);
    };

    /**
     * Encodes the specified Metadata message. Does not implicitly {@link Metadata.verify|verify} messages.
     * @function encode
     * @memberof Metadata
     * @static
     * @param {IMetadata} message Metadata message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Metadata.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.gpsAvgFixTime != null && Object.hasOwnProperty.call(message, "gpsAvgFixTime"))
            writer.uint32(/* id 1, wireType 5 =*/13).float(message.gpsAvgFixTime);
        return writer;
    };

    /**
     * Encodes the specified Metadata message, length delimited. Does not implicitly {@link Metadata.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Metadata
     * @static
     * @param {IMetadata} message Metadata message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Metadata.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Metadata message from the specified reader or buffer.
     * @function decode
     * @memberof Metadata
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Metadata} Metadata
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Metadata.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Metadata();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.gpsAvgFixTime = reader.float();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Metadata message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Metadata
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Metadata} Metadata
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Metadata.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Metadata message.
     * @function verify
     * @memberof Metadata
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Metadata.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.gpsAvgFixTime != null && message.hasOwnProperty("gpsAvgFixTime"))
            if (typeof message.gpsAvgFixTime !== "number")
                return "gpsAvgFixTime: number expected";
        return null;
    };

    /**
     * Creates a Metadata message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Metadata
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Metadata} Metadata
     */
    Metadata.fromObject = function fromObject(object) {
        if (object instanceof $root.Metadata)
            return object;
        var message = new $root.Metadata();
        if (object.gpsAvgFixTime != null)
            message.gpsAvgFixTime = Number(object.gpsAvgFixTime);
        return message;
    };

    /**
     * Creates a plain object from a Metadata message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Metadata
     * @static
     * @param {Metadata} message Metadata
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Metadata.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults)
            object.gpsAvgFixTime = 0;
        if (message.gpsAvgFixTime != null && message.hasOwnProperty("gpsAvgFixTime"))
            object.gpsAvgFixTime = options.json && !isFinite(message.gpsAvgFixTime) ? String(message.gpsAvgFixTime) : message.gpsAvgFixTime;
        return object;
    };

    /**
     * Converts this Metadata to JSON.
     * @function toJSON
     * @memberof Metadata
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Metadata.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Metadata
     * @function getTypeUrl
     * @memberof Metadata
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Metadata.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Metadata";
    };

    return Metadata;
})();

$root.ConfigPacket = (function() {

    /**
     * Properties of a ConfigPacket.
     * @exports IConfigPacket
     * @interface IConfigPacket
     * @property {boolean|null} [engageSystem] ConfigPacket engageSystem
     * @property {boolean|null} [enableMicrophone] ConfigPacket enableMicrophone
     * @property {boolean|null} [enableActivity] ConfigPacket enableActivity
     * @property {boolean|null} [enableParticulate] ConfigPacket enableParticulate
     * @property {boolean|null} [enableEnvironmental] ConfigPacket enableEnvironmental
     * @property {boolean|null} [enableLight] ConfigPacket enableLight
     * @property {boolean|null} [enableMotion] ConfigPacket enableMotion
     * @property {boolean|null} [enableLora] ConfigPacket enableLora
     */

    /**
     * Constructs a new ConfigPacket.
     * @exports ConfigPacket
     * @classdesc Represents a ConfigPacket.
     * @implements IConfigPacket
     * @constructor
     * @param {IConfigPacket=} [properties] Properties to set
     */
    function ConfigPacket(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ConfigPacket engageSystem.
     * @member {boolean} engageSystem
     * @memberof ConfigPacket
     * @instance
     */
    ConfigPacket.prototype.engageSystem = false;

    /**
     * ConfigPacket enableMicrophone.
     * @member {boolean} enableMicrophone
     * @memberof ConfigPacket
     * @instance
     */
    ConfigPacket.prototype.enableMicrophone = false;

    /**
     * ConfigPacket enableActivity.
     * @member {boolean} enableActivity
     * @memberof ConfigPacket
     * @instance
     */
    ConfigPacket.prototype.enableActivity = false;

    /**
     * ConfigPacket enableParticulate.
     * @member {boolean} enableParticulate
     * @memberof ConfigPacket
     * @instance
     */
    ConfigPacket.prototype.enableParticulate = false;

    /**
     * ConfigPacket enableEnvironmental.
     * @member {boolean} enableEnvironmental
     * @memberof ConfigPacket
     * @instance
     */
    ConfigPacket.prototype.enableEnvironmental = false;

    /**
     * ConfigPacket enableLight.
     * @member {boolean} enableLight
     * @memberof ConfigPacket
     * @instance
     */
    ConfigPacket.prototype.enableLight = false;

    /**
     * ConfigPacket enableMotion.
     * @member {boolean} enableMotion
     * @memberof ConfigPacket
     * @instance
     */
    ConfigPacket.prototype.enableMotion = false;

    /**
     * ConfigPacket enableLora.
     * @member {boolean} enableLora
     * @memberof ConfigPacket
     * @instance
     */
    ConfigPacket.prototype.enableLora = false;

    /**
     * Creates a new ConfigPacket instance using the specified properties.
     * @function create
     * @memberof ConfigPacket
     * @static
     * @param {IConfigPacket=} [properties] Properties to set
     * @returns {ConfigPacket} ConfigPacket instance
     */
    ConfigPacket.create = function create(properties) {
        return new ConfigPacket(properties);
    };

    /**
     * Encodes the specified ConfigPacket message. Does not implicitly {@link ConfigPacket.verify|verify} messages.
     * @function encode
     * @memberof ConfigPacket
     * @static
     * @param {IConfigPacket} message ConfigPacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ConfigPacket.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.engageSystem != null && Object.hasOwnProperty.call(message, "engageSystem"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.engageSystem);
        if (message.enableMicrophone != null && Object.hasOwnProperty.call(message, "enableMicrophone"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.enableMicrophone);
        if (message.enableActivity != null && Object.hasOwnProperty.call(message, "enableActivity"))
            writer.uint32(/* id 3, wireType 0 =*/24).bool(message.enableActivity);
        if (message.enableParticulate != null && Object.hasOwnProperty.call(message, "enableParticulate"))
            writer.uint32(/* id 4, wireType 0 =*/32).bool(message.enableParticulate);
        if (message.enableEnvironmental != null && Object.hasOwnProperty.call(message, "enableEnvironmental"))
            writer.uint32(/* id 5, wireType 0 =*/40).bool(message.enableEnvironmental);
        if (message.enableLight != null && Object.hasOwnProperty.call(message, "enableLight"))
            writer.uint32(/* id 6, wireType 0 =*/48).bool(message.enableLight);
        if (message.enableMotion != null && Object.hasOwnProperty.call(message, "enableMotion"))
            writer.uint32(/* id 7, wireType 0 =*/56).bool(message.enableMotion);
        if (message.enableLora != null && Object.hasOwnProperty.call(message, "enableLora"))
            writer.uint32(/* id 8, wireType 0 =*/64).bool(message.enableLora);
        return writer;
    };

    /**
     * Encodes the specified ConfigPacket message, length delimited. Does not implicitly {@link ConfigPacket.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ConfigPacket
     * @static
     * @param {IConfigPacket} message ConfigPacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ConfigPacket.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ConfigPacket message from the specified reader or buffer.
     * @function decode
     * @memberof ConfigPacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ConfigPacket} ConfigPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ConfigPacket.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ConfigPacket();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.engageSystem = reader.bool();
                    break;
                }
            case 2: {
                    message.enableMicrophone = reader.bool();
                    break;
                }
            case 3: {
                    message.enableActivity = reader.bool();
                    break;
                }
            case 4: {
                    message.enableParticulate = reader.bool();
                    break;
                }
            case 5: {
                    message.enableEnvironmental = reader.bool();
                    break;
                }
            case 6: {
                    message.enableLight = reader.bool();
                    break;
                }
            case 7: {
                    message.enableMotion = reader.bool();
                    break;
                }
            case 8: {
                    message.enableLora = reader.bool();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a ConfigPacket message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ConfigPacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ConfigPacket} ConfigPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ConfigPacket.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ConfigPacket message.
     * @function verify
     * @memberof ConfigPacket
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ConfigPacket.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.engageSystem != null && message.hasOwnProperty("engageSystem"))
            if (typeof message.engageSystem !== "boolean")
                return "engageSystem: boolean expected";
        if (message.enableMicrophone != null && message.hasOwnProperty("enableMicrophone"))
            if (typeof message.enableMicrophone !== "boolean")
                return "enableMicrophone: boolean expected";
        if (message.enableActivity != null && message.hasOwnProperty("enableActivity"))
            if (typeof message.enableActivity !== "boolean")
                return "enableActivity: boolean expected";
        if (message.enableParticulate != null && message.hasOwnProperty("enableParticulate"))
            if (typeof message.enableParticulate !== "boolean")
                return "enableParticulate: boolean expected";
        if (message.enableEnvironmental != null && message.hasOwnProperty("enableEnvironmental"))
            if (typeof message.enableEnvironmental !== "boolean")
                return "enableEnvironmental: boolean expected";
        if (message.enableLight != null && message.hasOwnProperty("enableLight"))
            if (typeof message.enableLight !== "boolean")
                return "enableLight: boolean expected";
        if (message.enableMotion != null && message.hasOwnProperty("enableMotion"))
            if (typeof message.enableMotion !== "boolean")
                return "enableMotion: boolean expected";
        if (message.enableLora != null && message.hasOwnProperty("enableLora"))
            if (typeof message.enableLora !== "boolean")
                return "enableLora: boolean expected";
        return null;
    };

    /**
     * Creates a ConfigPacket message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ConfigPacket
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ConfigPacket} ConfigPacket
     */
    ConfigPacket.fromObject = function fromObject(object) {
        if (object instanceof $root.ConfigPacket)
            return object;
        var message = new $root.ConfigPacket();
        if (object.engageSystem != null)
            message.engageSystem = Boolean(object.engageSystem);
        if (object.enableMicrophone != null)
            message.enableMicrophone = Boolean(object.enableMicrophone);
        if (object.enableActivity != null)
            message.enableActivity = Boolean(object.enableActivity);
        if (object.enableParticulate != null)
            message.enableParticulate = Boolean(object.enableParticulate);
        if (object.enableEnvironmental != null)
            message.enableEnvironmental = Boolean(object.enableEnvironmental);
        if (object.enableLight != null)
            message.enableLight = Boolean(object.enableLight);
        if (object.enableMotion != null)
            message.enableMotion = Boolean(object.enableMotion);
        if (object.enableLora != null)
            message.enableLora = Boolean(object.enableLora);
        return message;
    };

    /**
     * Creates a plain object from a ConfigPacket message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ConfigPacket
     * @static
     * @param {ConfigPacket} message ConfigPacket
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ConfigPacket.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.engageSystem = false;
            object.enableMicrophone = false;
            object.enableActivity = false;
            object.enableParticulate = false;
            object.enableEnvironmental = false;
            object.enableLight = false;
            object.enableMotion = false;
            object.enableLora = false;
        }
        if (message.engageSystem != null && message.hasOwnProperty("engageSystem"))
            object.engageSystem = message.engageSystem;
        if (message.enableMicrophone != null && message.hasOwnProperty("enableMicrophone"))
            object.enableMicrophone = message.enableMicrophone;
        if (message.enableActivity != null && message.hasOwnProperty("enableActivity"))
            object.enableActivity = message.enableActivity;
        if (message.enableParticulate != null && message.hasOwnProperty("enableParticulate"))
            object.enableParticulate = message.enableParticulate;
        if (message.enableEnvironmental != null && message.hasOwnProperty("enableEnvironmental"))
            object.enableEnvironmental = message.enableEnvironmental;
        if (message.enableLight != null && message.hasOwnProperty("enableLight"))
            object.enableLight = message.enableLight;
        if (message.enableMotion != null && message.hasOwnProperty("enableMotion"))
            object.enableMotion = message.enableMotion;
        if (message.enableLora != null && message.hasOwnProperty("enableLora"))
            object.enableLora = message.enableLora;
        return object;
    };

    /**
     * Converts this ConfigPacket to JSON.
     * @function toJSON
     * @memberof ConfigPacket
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ConfigPacket.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ConfigPacket
     * @function getTypeUrl
     * @memberof ConfigPacket
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ConfigPacket.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ConfigPacket";
    };

    return ConfigPacket;
})();

$root.GPSData_2 = (function() {

    /**
     * Properties of a GPSData_2.
     * @exports IGPSData_2
     * @interface IGPSData_2
     * @property {number|null} [latitudeE7] GPSData_2 latitudeE7
     * @property {number|null} [longitudeE7] GPSData_2 longitudeE7
     * @property {number|null} [altitudeMm] GPSData_2 altitudeMm
     * @property {number|null} [timestamp] GPSData_2 timestamp
     * @property {number|null} [gpsAvgFixTimeMs] GPSData_2 gpsAvgFixTimeMs
     */

    /**
     * Constructs a new GPSData_2.
     * @exports GPSData_2
     * @classdesc Represents a GPSData_2.
     * @implements IGPSData_2
     * @constructor
     * @param {IGPSData_2=} [properties] Properties to set
     */
    function GPSData_2(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * GPSData_2 latitudeE7.
     * @member {number} latitudeE7
     * @memberof GPSData_2
     * @instance
     */
    GPSData_2.prototype.latitudeE7 = 0;

    /**
     * GPSData_2 longitudeE7.
     * @member {number} longitudeE7
     * @memberof GPSData_2
     * @instance
     */
    GPSData_2.prototype.longitudeE7 = 0;

    /**
     * GPSData_2 altitudeMm.
     * @member {number} altitudeMm
     * @memberof GPSData_2
     * @instance
     */
    GPSData_2.prototype.altitudeMm = 0;

    /**
     * GPSData_2 timestamp.
     * @member {number|null|undefined} timestamp
     * @memberof GPSData_2
     * @instance
     */
    GPSData_2.prototype.timestamp = null;

    /**
     * GPSData_2 gpsAvgFixTimeMs.
     * @member {number|null|undefined} gpsAvgFixTimeMs
     * @memberof GPSData_2
     * @instance
     */
    GPSData_2.prototype.gpsAvgFixTimeMs = null;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * GPSData_2 _timestamp.
     * @member {"timestamp"|undefined} _timestamp
     * @memberof GPSData_2
     * @instance
     */
    Object.defineProperty(GPSData_2.prototype, "_timestamp", {
        get: $util.oneOfGetter($oneOfFields = ["timestamp"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * GPSData_2 _gpsAvgFixTimeMs.
     * @member {"gpsAvgFixTimeMs"|undefined} _gpsAvgFixTimeMs
     * @memberof GPSData_2
     * @instance
     */
    Object.defineProperty(GPSData_2.prototype, "_gpsAvgFixTimeMs", {
        get: $util.oneOfGetter($oneOfFields = ["gpsAvgFixTimeMs"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new GPSData_2 instance using the specified properties.
     * @function create
     * @memberof GPSData_2
     * @static
     * @param {IGPSData_2=} [properties] Properties to set
     * @returns {GPSData_2} GPSData_2 instance
     */
    GPSData_2.create = function create(properties) {
        return new GPSData_2(properties);
    };

    /**
     * Encodes the specified GPSData_2 message. Does not implicitly {@link GPSData_2.verify|verify} messages.
     * @function encode
     * @memberof GPSData_2
     * @static
     * @param {IGPSData_2} message GPSData_2 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GPSData_2.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.latitudeE7 != null && Object.hasOwnProperty.call(message, "latitudeE7"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.latitudeE7);
        if (message.longitudeE7 != null && Object.hasOwnProperty.call(message, "longitudeE7"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.longitudeE7);
        if (message.altitudeMm != null && Object.hasOwnProperty.call(message, "altitudeMm"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.altitudeMm);
        if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.timestamp);
        if (message.gpsAvgFixTimeMs != null && Object.hasOwnProperty.call(message, "gpsAvgFixTimeMs"))
            writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.gpsAvgFixTimeMs);
        return writer;
    };

    /**
     * Encodes the specified GPSData_2 message, length delimited. Does not implicitly {@link GPSData_2.verify|verify} messages.
     * @function encodeDelimited
     * @memberof GPSData_2
     * @static
     * @param {IGPSData_2} message GPSData_2 message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GPSData_2.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a GPSData_2 message from the specified reader or buffer.
     * @function decode
     * @memberof GPSData_2
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {GPSData_2} GPSData_2
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GPSData_2.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GPSData_2();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.latitudeE7 = reader.int32();
                    break;
                }
            case 2: {
                    message.longitudeE7 = reader.int32();
                    break;
                }
            case 3: {
                    message.altitudeMm = reader.uint32();
                    break;
                }
            case 4: {
                    message.timestamp = reader.uint32();
                    break;
                }
            case 5: {
                    message.gpsAvgFixTimeMs = reader.uint32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a GPSData_2 message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof GPSData_2
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {GPSData_2} GPSData_2
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GPSData_2.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a GPSData_2 message.
     * @function verify
     * @memberof GPSData_2
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    GPSData_2.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        var properties = {};
        if (message.latitudeE7 != null && message.hasOwnProperty("latitudeE7"))
            if (!$util.isInteger(message.latitudeE7))
                return "latitudeE7: integer expected";
        if (message.longitudeE7 != null && message.hasOwnProperty("longitudeE7"))
            if (!$util.isInteger(message.longitudeE7))
                return "longitudeE7: integer expected";
        if (message.altitudeMm != null && message.hasOwnProperty("altitudeMm"))
            if (!$util.isInteger(message.altitudeMm))
                return "altitudeMm: integer expected";
        if (message.timestamp != null && message.hasOwnProperty("timestamp")) {
            properties._timestamp = 1;
            if (!$util.isInteger(message.timestamp))
                return "timestamp: integer expected";
        }
        if (message.gpsAvgFixTimeMs != null && message.hasOwnProperty("gpsAvgFixTimeMs")) {
            properties._gpsAvgFixTimeMs = 1;
            if (!$util.isInteger(message.gpsAvgFixTimeMs))
                return "gpsAvgFixTimeMs: integer expected";
        }
        return null;
    };

    /**
     * Creates a GPSData_2 message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof GPSData_2
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {GPSData_2} GPSData_2
     */
    GPSData_2.fromObject = function fromObject(object) {
        if (object instanceof $root.GPSData_2)
            return object;
        var message = new $root.GPSData_2();
        if (object.latitudeE7 != null)
            message.latitudeE7 = object.latitudeE7 | 0;
        if (object.longitudeE7 != null)
            message.longitudeE7 = object.longitudeE7 | 0;
        if (object.altitudeMm != null)
            message.altitudeMm = object.altitudeMm >>> 0;
        if (object.timestamp != null)
            message.timestamp = object.timestamp >>> 0;
        if (object.gpsAvgFixTimeMs != null)
            message.gpsAvgFixTimeMs = object.gpsAvgFixTimeMs >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a GPSData_2 message. Also converts values to other types if specified.
     * @function toObject
     * @memberof GPSData_2
     * @static
     * @param {GPSData_2} message GPSData_2
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    GPSData_2.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.latitudeE7 = 0;
            object.longitudeE7 = 0;
            object.altitudeMm = 0;
        }
        if (message.latitudeE7 != null && message.hasOwnProperty("latitudeE7"))
            object.latitudeE7 = message.latitudeE7;
        if (message.longitudeE7 != null && message.hasOwnProperty("longitudeE7"))
            object.longitudeE7 = message.longitudeE7;
        if (message.altitudeMm != null && message.hasOwnProperty("altitudeMm"))
            object.altitudeMm = message.altitudeMm;
        if (message.timestamp != null && message.hasOwnProperty("timestamp")) {
            object.timestamp = message.timestamp;
            if (options.oneofs)
                object._timestamp = "timestamp";
        }
        if (message.gpsAvgFixTimeMs != null && message.hasOwnProperty("gpsAvgFixTimeMs")) {
            object.gpsAvgFixTimeMs = message.gpsAvgFixTimeMs;
            if (options.oneofs)
                object._gpsAvgFixTimeMs = "gpsAvgFixTimeMs";
        }
        return object;
    };

    /**
     * Converts this GPSData_2 to JSON.
     * @function toJSON
     * @memberof GPSData_2
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    GPSData_2.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for GPSData_2
     * @function getTypeUrl
     * @memberof GPSData_2
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    GPSData_2.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/GPSData_2";
    };

    return GPSData_2;
})();

$root.SystemSensorSummary = (function() {

    /**
     * Properties of a SystemSensorSummary.
     * @exports ISystemSensorSummary
     * @interface ISystemSensorSummary
     * @property {number|null} [temperature] SystemSensorSummary temperature
     * @property {number|null} [humidity] SystemSensorSummary humidity
     * @property {number|null} [pressure] SystemSensorSummary pressure
     * @property {number|null} [gas] SystemSensorSummary gas
     * @property {number|null} [pm1] SystemSensorSummary pm1
     * @property {number|null} [pm2_5] SystemSensorSummary pm2_5
     * @property {number|null} [pm10] SystemSensorSummary pm10
     * @property {number|null} [light] SystemSensorSummary light
     * @property {number|null} [steps] SystemSensorSummary steps
     * @property {boolean|null} [particulateObstructed] SystemSensorSummary particulateObstructed
     * @property {boolean|null} [particulateOutsideDetectionLimits] SystemSensorSummary particulateOutsideDetectionLimits
     */

    /**
     * Constructs a new SystemSensorSummary.
     * @exports SystemSensorSummary
     * @classdesc Represents a SystemSensorSummary.
     * @implements ISystemSensorSummary
     * @constructor
     * @param {ISystemSensorSummary=} [properties] Properties to set
     */
    function SystemSensorSummary(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * SystemSensorSummary temperature.
     * @member {number} temperature
     * @memberof SystemSensorSummary
     * @instance
     */
    SystemSensorSummary.prototype.temperature = 0;

    /**
     * SystemSensorSummary humidity.
     * @member {number} humidity
     * @memberof SystemSensorSummary
     * @instance
     */
    SystemSensorSummary.prototype.humidity = 0;

    /**
     * SystemSensorSummary pressure.
     * @member {number} pressure
     * @memberof SystemSensorSummary
     * @instance
     */
    SystemSensorSummary.prototype.pressure = 0;

    /**
     * SystemSensorSummary gas.
     * @member {number} gas
     * @memberof SystemSensorSummary
     * @instance
     */
    SystemSensorSummary.prototype.gas = 0;

    /**
     * SystemSensorSummary pm1.
     * @member {number} pm1
     * @memberof SystemSensorSummary
     * @instance
     */
    SystemSensorSummary.prototype.pm1 = 0;

    /**
     * SystemSensorSummary pm2_5.
     * @member {number} pm2_5
     * @memberof SystemSensorSummary
     * @instance
     */
    SystemSensorSummary.prototype.pm2_5 = 0;

    /**
     * SystemSensorSummary pm10.
     * @member {number} pm10
     * @memberof SystemSensorSummary
     * @instance
     */
    SystemSensorSummary.prototype.pm10 = 0;

    /**
     * SystemSensorSummary light.
     * @member {number} light
     * @memberof SystemSensorSummary
     * @instance
     */
    SystemSensorSummary.prototype.light = 0;

    /**
     * SystemSensorSummary steps.
     * @member {number} steps
     * @memberof SystemSensorSummary
     * @instance
     */
    SystemSensorSummary.prototype.steps = 0;

    /**
     * SystemSensorSummary particulateObstructed.
     * @member {boolean} particulateObstructed
     * @memberof SystemSensorSummary
     * @instance
     */
    SystemSensorSummary.prototype.particulateObstructed = false;

    /**
     * SystemSensorSummary particulateOutsideDetectionLimits.
     * @member {boolean} particulateOutsideDetectionLimits
     * @memberof SystemSensorSummary
     * @instance
     */
    SystemSensorSummary.prototype.particulateOutsideDetectionLimits = false;

    /**
     * Creates a new SystemSensorSummary instance using the specified properties.
     * @function create
     * @memberof SystemSensorSummary
     * @static
     * @param {ISystemSensorSummary=} [properties] Properties to set
     * @returns {SystemSensorSummary} SystemSensorSummary instance
     */
    SystemSensorSummary.create = function create(properties) {
        return new SystemSensorSummary(properties);
    };

    /**
     * Encodes the specified SystemSensorSummary message. Does not implicitly {@link SystemSensorSummary.verify|verify} messages.
     * @function encode
     * @memberof SystemSensorSummary
     * @static
     * @param {ISystemSensorSummary} message SystemSensorSummary message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SystemSensorSummary.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.temperature != null && Object.hasOwnProperty.call(message, "temperature"))
            writer.uint32(/* id 1, wireType 5 =*/13).float(message.temperature);
        if (message.humidity != null && Object.hasOwnProperty.call(message, "humidity"))
            writer.uint32(/* id 2, wireType 5 =*/21).float(message.humidity);
        if (message.pressure != null && Object.hasOwnProperty.call(message, "pressure"))
            writer.uint32(/* id 3, wireType 5 =*/29).float(message.pressure);
        if (message.gas != null && Object.hasOwnProperty.call(message, "gas"))
            writer.uint32(/* id 4, wireType 5 =*/37).float(message.gas);
        if (message.pm1 != null && Object.hasOwnProperty.call(message, "pm1"))
            writer.uint32(/* id 5, wireType 5 =*/45).float(message.pm1);
        if (message.pm2_5 != null && Object.hasOwnProperty.call(message, "pm2_5"))
            writer.uint32(/* id 6, wireType 5 =*/53).float(message.pm2_5);
        if (message.pm10 != null && Object.hasOwnProperty.call(message, "pm10"))
            writer.uint32(/* id 7, wireType 5 =*/61).float(message.pm10);
        if (message.light != null && Object.hasOwnProperty.call(message, "light"))
            writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.light);
        if (message.steps != null && Object.hasOwnProperty.call(message, "steps"))
            writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.steps);
        if (message.particulateObstructed != null && Object.hasOwnProperty.call(message, "particulateObstructed"))
            writer.uint32(/* id 10, wireType 0 =*/80).bool(message.particulateObstructed);
        if (message.particulateOutsideDetectionLimits != null && Object.hasOwnProperty.call(message, "particulateOutsideDetectionLimits"))
            writer.uint32(/* id 11, wireType 0 =*/88).bool(message.particulateOutsideDetectionLimits);
        return writer;
    };

    /**
     * Encodes the specified SystemSensorSummary message, length delimited. Does not implicitly {@link SystemSensorSummary.verify|verify} messages.
     * @function encodeDelimited
     * @memberof SystemSensorSummary
     * @static
     * @param {ISystemSensorSummary} message SystemSensorSummary message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SystemSensorSummary.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a SystemSensorSummary message from the specified reader or buffer.
     * @function decode
     * @memberof SystemSensorSummary
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {SystemSensorSummary} SystemSensorSummary
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SystemSensorSummary.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.SystemSensorSummary();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.temperature = reader.float();
                    break;
                }
            case 2: {
                    message.humidity = reader.float();
                    break;
                }
            case 3: {
                    message.pressure = reader.float();
                    break;
                }
            case 4: {
                    message.gas = reader.float();
                    break;
                }
            case 5: {
                    message.pm1 = reader.float();
                    break;
                }
            case 6: {
                    message.pm2_5 = reader.float();
                    break;
                }
            case 7: {
                    message.pm10 = reader.float();
                    break;
                }
            case 8: {
                    message.light = reader.uint32();
                    break;
                }
            case 9: {
                    message.steps = reader.uint32();
                    break;
                }
            case 10: {
                    message.particulateObstructed = reader.bool();
                    break;
                }
            case 11: {
                    message.particulateOutsideDetectionLimits = reader.bool();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a SystemSensorSummary message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof SystemSensorSummary
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {SystemSensorSummary} SystemSensorSummary
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SystemSensorSummary.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a SystemSensorSummary message.
     * @function verify
     * @memberof SystemSensorSummary
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    SystemSensorSummary.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.temperature != null && message.hasOwnProperty("temperature"))
            if (typeof message.temperature !== "number")
                return "temperature: number expected";
        if (message.humidity != null && message.hasOwnProperty("humidity"))
            if (typeof message.humidity !== "number")
                return "humidity: number expected";
        if (message.pressure != null && message.hasOwnProperty("pressure"))
            if (typeof message.pressure !== "number")
                return "pressure: number expected";
        if (message.gas != null && message.hasOwnProperty("gas"))
            if (typeof message.gas !== "number")
                return "gas: number expected";
        if (message.pm1 != null && message.hasOwnProperty("pm1"))
            if (typeof message.pm1 !== "number")
                return "pm1: number expected";
        if (message.pm2_5 != null && message.hasOwnProperty("pm2_5"))
            if (typeof message.pm2_5 !== "number")
                return "pm2_5: number expected";
        if (message.pm10 != null && message.hasOwnProperty("pm10"))
            if (typeof message.pm10 !== "number")
                return "pm10: number expected";
        if (message.light != null && message.hasOwnProperty("light"))
            if (!$util.isInteger(message.light))
                return "light: integer expected";
        if (message.steps != null && message.hasOwnProperty("steps"))
            if (!$util.isInteger(message.steps))
                return "steps: integer expected";
        if (message.particulateObstructed != null && message.hasOwnProperty("particulateObstructed"))
            if (typeof message.particulateObstructed !== "boolean")
                return "particulateObstructed: boolean expected";
        if (message.particulateOutsideDetectionLimits != null && message.hasOwnProperty("particulateOutsideDetectionLimits"))
            if (typeof message.particulateOutsideDetectionLimits !== "boolean")
                return "particulateOutsideDetectionLimits: boolean expected";
        return null;
    };

    /**
     * Creates a SystemSensorSummary message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof SystemSensorSummary
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {SystemSensorSummary} SystemSensorSummary
     */
    SystemSensorSummary.fromObject = function fromObject(object) {
        if (object instanceof $root.SystemSensorSummary)
            return object;
        var message = new $root.SystemSensorSummary();
        if (object.temperature != null)
            message.temperature = Number(object.temperature);
        if (object.humidity != null)
            message.humidity = Number(object.humidity);
        if (object.pressure != null)
            message.pressure = Number(object.pressure);
        if (object.gas != null)
            message.gas = Number(object.gas);
        if (object.pm1 != null)
            message.pm1 = Number(object.pm1);
        if (object.pm2_5 != null)
            message.pm2_5 = Number(object.pm2_5);
        if (object.pm10 != null)
            message.pm10 = Number(object.pm10);
        if (object.light != null)
            message.light = object.light >>> 0;
        if (object.steps != null)
            message.steps = object.steps >>> 0;
        if (object.particulateObstructed != null)
            message.particulateObstructed = Boolean(object.particulateObstructed);
        if (object.particulateOutsideDetectionLimits != null)
            message.particulateOutsideDetectionLimits = Boolean(object.particulateOutsideDetectionLimits);
        return message;
    };

    /**
     * Creates a plain object from a SystemSensorSummary message. Also converts values to other types if specified.
     * @function toObject
     * @memberof SystemSensorSummary
     * @static
     * @param {SystemSensorSummary} message SystemSensorSummary
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    SystemSensorSummary.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.temperature = 0;
            object.humidity = 0;
            object.pressure = 0;
            object.gas = 0;
            object.pm1 = 0;
            object.pm2_5 = 0;
            object.pm10 = 0;
            object.light = 0;
            object.steps = 0;
            object.particulateObstructed = false;
            object.particulateOutsideDetectionLimits = false;
        }
        if (message.temperature != null && message.hasOwnProperty("temperature"))
            object.temperature = options.json && !isFinite(message.temperature) ? String(message.temperature) : message.temperature;
        if (message.humidity != null && message.hasOwnProperty("humidity"))
            object.humidity = options.json && !isFinite(message.humidity) ? String(message.humidity) : message.humidity;
        if (message.pressure != null && message.hasOwnProperty("pressure"))
            object.pressure = options.json && !isFinite(message.pressure) ? String(message.pressure) : message.pressure;
        if (message.gas != null && message.hasOwnProperty("gas"))
            object.gas = options.json && !isFinite(message.gas) ? String(message.gas) : message.gas;
        if (message.pm1 != null && message.hasOwnProperty("pm1"))
            object.pm1 = options.json && !isFinite(message.pm1) ? String(message.pm1) : message.pm1;
        if (message.pm2_5 != null && message.hasOwnProperty("pm2_5"))
            object.pm2_5 = options.json && !isFinite(message.pm2_5) ? String(message.pm2_5) : message.pm2_5;
        if (message.pm10 != null && message.hasOwnProperty("pm10"))
            object.pm10 = options.json && !isFinite(message.pm10) ? String(message.pm10) : message.pm10;
        if (message.light != null && message.hasOwnProperty("light"))
            object.light = message.light;
        if (message.steps != null && message.hasOwnProperty("steps"))
            object.steps = message.steps;
        if (message.particulateObstructed != null && message.hasOwnProperty("particulateObstructed"))
            object.particulateObstructed = message.particulateObstructed;
        if (message.particulateOutsideDetectionLimits != null && message.hasOwnProperty("particulateOutsideDetectionLimits"))
            object.particulateOutsideDetectionLimits = message.particulateOutsideDetectionLimits;
        return object;
    };

    /**
     * Converts this SystemSensorSummary to JSON.
     * @function toJSON
     * @memberof SystemSensorSummary
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    SystemSensorSummary.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for SystemSensorSummary
     * @function getTypeUrl
     * @memberof SystemSensorSummary
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    SystemSensorSummary.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/SystemSensorSummary";
    };

    return SystemSensorSummary;
})();

$root.AckPacket = (function() {

    /**
     * Properties of an AckPacket.
     * @exports IAckPacket
     * @interface IAckPacket
     */

    /**
     * Constructs a new AckPacket.
     * @exports AckPacket
     * @classdesc Represents an AckPacket.
     * @implements IAckPacket
     * @constructor
     * @param {IAckPacket=} [properties] Properties to set
     */
    function AckPacket(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new AckPacket instance using the specified properties.
     * @function create
     * @memberof AckPacket
     * @static
     * @param {IAckPacket=} [properties] Properties to set
     * @returns {AckPacket} AckPacket instance
     */
    AckPacket.create = function create(properties) {
        return new AckPacket(properties);
    };

    /**
     * Encodes the specified AckPacket message. Does not implicitly {@link AckPacket.verify|verify} messages.
     * @function encode
     * @memberof AckPacket
     * @static
     * @param {IAckPacket} message AckPacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AckPacket.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified AckPacket message, length delimited. Does not implicitly {@link AckPacket.verify|verify} messages.
     * @function encodeDelimited
     * @memberof AckPacket
     * @static
     * @param {IAckPacket} message AckPacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AckPacket.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an AckPacket message from the specified reader or buffer.
     * @function decode
     * @memberof AckPacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {AckPacket} AckPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AckPacket.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.AckPacket();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an AckPacket message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof AckPacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {AckPacket} AckPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AckPacket.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an AckPacket message.
     * @function verify
     * @memberof AckPacket
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    AckPacket.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates an AckPacket message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof AckPacket
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {AckPacket} AckPacket
     */
    AckPacket.fromObject = function fromObject(object) {
        if (object instanceof $root.AckPacket)
            return object;
        return new $root.AckPacket();
    };

    /**
     * Creates a plain object from an AckPacket message. Also converts values to other types if specified.
     * @function toObject
     * @memberof AckPacket
     * @static
     * @param {AckPacket} message AckPacket
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    AckPacket.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this AckPacket to JSON.
     * @function toJSON
     * @memberof AckPacket
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    AckPacket.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for AckPacket
     * @function getTypeUrl
     * @memberof AckPacket
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    AckPacket.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/AckPacket";
    };

    return AckPacket;
})();

$root.RadioInfo = (function() {

    /**
     * Properties of a RadioInfo.
     * @exports IRadioInfo
     * @interface IRadioInfo
     * @property {number|null} [rssi] RadioInfo rssi
     * @property {number|null} [snr] RadioInfo snr
     * @property {number|null} [rssiEst] RadioInfo rssiEst
     */

    /**
     * Constructs a new RadioInfo.
     * @exports RadioInfo
     * @classdesc Represents a RadioInfo.
     * @implements IRadioInfo
     * @constructor
     * @param {IRadioInfo=} [properties] Properties to set
     */
    function RadioInfo(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * RadioInfo rssi.
     * @member {number} rssi
     * @memberof RadioInfo
     * @instance
     */
    RadioInfo.prototype.rssi = 0;

    /**
     * RadioInfo snr.
     * @member {number} snr
     * @memberof RadioInfo
     * @instance
     */
    RadioInfo.prototype.snr = 0;

    /**
     * RadioInfo rssiEst.
     * @member {number} rssiEst
     * @memberof RadioInfo
     * @instance
     */
    RadioInfo.prototype.rssiEst = 0;

    /**
     * Creates a new RadioInfo instance using the specified properties.
     * @function create
     * @memberof RadioInfo
     * @static
     * @param {IRadioInfo=} [properties] Properties to set
     * @returns {RadioInfo} RadioInfo instance
     */
    RadioInfo.create = function create(properties) {
        return new RadioInfo(properties);
    };

    /**
     * Encodes the specified RadioInfo message. Does not implicitly {@link RadioInfo.verify|verify} messages.
     * @function encode
     * @memberof RadioInfo
     * @static
     * @param {IRadioInfo} message RadioInfo message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RadioInfo.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.rssi != null && Object.hasOwnProperty.call(message, "rssi"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.rssi);
        if (message.snr != null && Object.hasOwnProperty.call(message, "snr"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.snr);
        if (message.rssiEst != null && Object.hasOwnProperty.call(message, "rssiEst"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.rssiEst);
        return writer;
    };

    /**
     * Encodes the specified RadioInfo message, length delimited. Does not implicitly {@link RadioInfo.verify|verify} messages.
     * @function encodeDelimited
     * @memberof RadioInfo
     * @static
     * @param {IRadioInfo} message RadioInfo message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RadioInfo.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RadioInfo message from the specified reader or buffer.
     * @function decode
     * @memberof RadioInfo
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {RadioInfo} RadioInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RadioInfo.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.RadioInfo();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.rssi = reader.int32();
                    break;
                }
            case 2: {
                    message.snr = reader.int32();
                    break;
                }
            case 3: {
                    message.rssiEst = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a RadioInfo message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof RadioInfo
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {RadioInfo} RadioInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RadioInfo.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RadioInfo message.
     * @function verify
     * @memberof RadioInfo
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RadioInfo.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.rssi != null && message.hasOwnProperty("rssi"))
            if (!$util.isInteger(message.rssi))
                return "rssi: integer expected";
        if (message.snr != null && message.hasOwnProperty("snr"))
            if (!$util.isInteger(message.snr))
                return "snr: integer expected";
        if (message.rssiEst != null && message.hasOwnProperty("rssiEst"))
            if (!$util.isInteger(message.rssiEst))
                return "rssiEst: integer expected";
        return null;
    };

    /**
     * Creates a RadioInfo message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof RadioInfo
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {RadioInfo} RadioInfo
     */
    RadioInfo.fromObject = function fromObject(object) {
        if (object instanceof $root.RadioInfo)
            return object;
        var message = new $root.RadioInfo();
        if (object.rssi != null)
            message.rssi = object.rssi | 0;
        if (object.snr != null)
            message.snr = object.snr | 0;
        if (object.rssiEst != null)
            message.rssiEst = object.rssiEst | 0;
        return message;
    };

    /**
     * Creates a plain object from a RadioInfo message. Also converts values to other types if specified.
     * @function toObject
     * @memberof RadioInfo
     * @static
     * @param {RadioInfo} message RadioInfo
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RadioInfo.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.rssi = 0;
            object.snr = 0;
            object.rssiEst = 0;
        }
        if (message.rssi != null && message.hasOwnProperty("rssi"))
            object.rssi = message.rssi;
        if (message.snr != null && message.hasOwnProperty("snr"))
            object.snr = message.snr;
        if (message.rssiEst != null && message.hasOwnProperty("rssiEst"))
            object.rssiEst = message.rssiEst;
        return object;
    };

    /**
     * Converts this RadioInfo to JSON.
     * @function toJSON
     * @memberof RadioInfo
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RadioInfo.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for RadioInfo
     * @function getTypeUrl
     * @memberof RadioInfo
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    RadioInfo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/RadioInfo";
    };

    return RadioInfo;
})();

$root.AccAxis = (function() {

    /**
     * Properties of an AccAxis.
     * @exports IAccAxis
     * @interface IAccAxis
     * @property {number|null} [x] AccAxis x
     * @property {number|null} [y] AccAxis y
     * @property {number|null} [z] AccAxis z
     */

    /**
     * Constructs a new AccAxis.
     * @exports AccAxis
     * @classdesc Represents an AccAxis.
     * @implements IAccAxis
     * @constructor
     * @param {IAccAxis=} [properties] Properties to set
     */
    function AccAxis(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * AccAxis x.
     * @member {number} x
     * @memberof AccAxis
     * @instance
     */
    AccAxis.prototype.x = 0;

    /**
     * AccAxis y.
     * @member {number} y
     * @memberof AccAxis
     * @instance
     */
    AccAxis.prototype.y = 0;

    /**
     * AccAxis z.
     * @member {number} z
     * @memberof AccAxis
     * @instance
     */
    AccAxis.prototype.z = 0;

    /**
     * Creates a new AccAxis instance using the specified properties.
     * @function create
     * @memberof AccAxis
     * @static
     * @param {IAccAxis=} [properties] Properties to set
     * @returns {AccAxis} AccAxis instance
     */
    AccAxis.create = function create(properties) {
        return new AccAxis(properties);
    };

    /**
     * Encodes the specified AccAxis message. Does not implicitly {@link AccAxis.verify|verify} messages.
     * @function encode
     * @memberof AccAxis
     * @static
     * @param {IAccAxis} message AccAxis message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AccAxis.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.x != null && Object.hasOwnProperty.call(message, "x"))
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.x);
        if (message.y != null && Object.hasOwnProperty.call(message, "y"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.y);
        if (message.z != null && Object.hasOwnProperty.call(message, "z"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.z);
        return writer;
    };

    /**
     * Encodes the specified AccAxis message, length delimited. Does not implicitly {@link AccAxis.verify|verify} messages.
     * @function encodeDelimited
     * @memberof AccAxis
     * @static
     * @param {IAccAxis} message AccAxis message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AccAxis.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an AccAxis message from the specified reader or buffer.
     * @function decode
     * @memberof AccAxis
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {AccAxis} AccAxis
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AccAxis.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.AccAxis();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.x = reader.uint32();
                    break;
                }
            case 2: {
                    message.y = reader.uint32();
                    break;
                }
            case 3: {
                    message.z = reader.uint32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an AccAxis message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof AccAxis
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {AccAxis} AccAxis
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AccAxis.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an AccAxis message.
     * @function verify
     * @memberof AccAxis
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    AccAxis.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.x != null && message.hasOwnProperty("x"))
            if (!$util.isInteger(message.x))
                return "x: integer expected";
        if (message.y != null && message.hasOwnProperty("y"))
            if (!$util.isInteger(message.y))
                return "y: integer expected";
        if (message.z != null && message.hasOwnProperty("z"))
            if (!$util.isInteger(message.z))
                return "z: integer expected";
        return null;
    };

    /**
     * Creates an AccAxis message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof AccAxis
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {AccAxis} AccAxis
     */
    AccAxis.fromObject = function fromObject(object) {
        if (object instanceof $root.AccAxis)
            return object;
        var message = new $root.AccAxis();
        if (object.x != null)
            message.x = object.x >>> 0;
        if (object.y != null)
            message.y = object.y >>> 0;
        if (object.z != null)
            message.z = object.z >>> 0;
        return message;
    };

    /**
     * Creates a plain object from an AccAxis message. Also converts values to other types if specified.
     * @function toObject
     * @memberof AccAxis
     * @static
     * @param {AccAxis} message AccAxis
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    AccAxis.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.x = 0;
            object.y = 0;
            object.z = 0;
        }
        if (message.x != null && message.hasOwnProperty("x"))
            object.x = message.x;
        if (message.y != null && message.hasOwnProperty("y"))
            object.y = message.y;
        if (message.z != null && message.hasOwnProperty("z"))
            object.z = message.z;
        return object;
    };

    /**
     * Converts this AccAxis to JSON.
     * @function toJSON
     * @memberof AccAxis
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    AccAxis.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for AccAxis
     * @function getTypeUrl
     * @memberof AccAxis
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    AccAxis.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/AccAxis";
    };

    return AccAxis;
})();

$root.AccStats = (function() {

    /**
     * Properties of an AccStats.
     * @exports IAccStats
     * @interface IAccStats
     * @property {number|null} [ODBAMeanX100] AccStats ODBAMeanX100
     * @property {number|null} [ODBAMaxX100] AccStats ODBAMaxX100
     * @property {number|null} [VeDBAMeanX100] AccStats VeDBAMeanX100
     * @property {number|null} [VeDBAMaxX100] AccStats VeDBAMaxX100
     * @property {IAccAxis|null} [StdDevX100] AccStats StdDevX100
     * @property {IAccAxis|null} [MeanX100] AccStats MeanX100
     */

    /**
     * Constructs a new AccStats.
     * @exports AccStats
     * @classdesc Represents an AccStats.
     * @implements IAccStats
     * @constructor
     * @param {IAccStats=} [properties] Properties to set
     */
    function AccStats(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * AccStats ODBAMeanX100.
     * @member {number} ODBAMeanX100
     * @memberof AccStats
     * @instance
     */
    AccStats.prototype.ODBAMeanX100 = 0;

    /**
     * AccStats ODBAMaxX100.
     * @member {number} ODBAMaxX100
     * @memberof AccStats
     * @instance
     */
    AccStats.prototype.ODBAMaxX100 = 0;

    /**
     * AccStats VeDBAMeanX100.
     * @member {number} VeDBAMeanX100
     * @memberof AccStats
     * @instance
     */
    AccStats.prototype.VeDBAMeanX100 = 0;

    /**
     * AccStats VeDBAMaxX100.
     * @member {number} VeDBAMaxX100
     * @memberof AccStats
     * @instance
     */
    AccStats.prototype.VeDBAMaxX100 = 0;

    /**
     * AccStats StdDevX100.
     * @member {IAccAxis|null|undefined} StdDevX100
     * @memberof AccStats
     * @instance
     */
    AccStats.prototype.StdDevX100 = null;

    /**
     * AccStats MeanX100.
     * @member {IAccAxis|null|undefined} MeanX100
     * @memberof AccStats
     * @instance
     */
    AccStats.prototype.MeanX100 = null;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * AccStats _StdDevX100.
     * @member {"StdDevX100"|undefined} _StdDevX100
     * @memberof AccStats
     * @instance
     */
    Object.defineProperty(AccStats.prototype, "_StdDevX100", {
        get: $util.oneOfGetter($oneOfFields = ["StdDevX100"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * AccStats _MeanX100.
     * @member {"MeanX100"|undefined} _MeanX100
     * @memberof AccStats
     * @instance
     */
    Object.defineProperty(AccStats.prototype, "_MeanX100", {
        get: $util.oneOfGetter($oneOfFields = ["MeanX100"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new AccStats instance using the specified properties.
     * @function create
     * @memberof AccStats
     * @static
     * @param {IAccStats=} [properties] Properties to set
     * @returns {AccStats} AccStats instance
     */
    AccStats.create = function create(properties) {
        return new AccStats(properties);
    };

    /**
     * Encodes the specified AccStats message. Does not implicitly {@link AccStats.verify|verify} messages.
     * @function encode
     * @memberof AccStats
     * @static
     * @param {IAccStats} message AccStats message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AccStats.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.ODBAMeanX100 != null && Object.hasOwnProperty.call(message, "ODBAMeanX100"))
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.ODBAMeanX100);
        if (message.ODBAMaxX100 != null && Object.hasOwnProperty.call(message, "ODBAMaxX100"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.ODBAMaxX100);
        if (message.VeDBAMeanX100 != null && Object.hasOwnProperty.call(message, "VeDBAMeanX100"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.VeDBAMeanX100);
        if (message.VeDBAMaxX100 != null && Object.hasOwnProperty.call(message, "VeDBAMaxX100"))
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.VeDBAMaxX100);
        if (message.StdDevX100 != null && Object.hasOwnProperty.call(message, "StdDevX100"))
            $root.AccAxis.encode(message.StdDevX100, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        if (message.MeanX100 != null && Object.hasOwnProperty.call(message, "MeanX100"))
            $root.AccAxis.encode(message.MeanX100, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified AccStats message, length delimited. Does not implicitly {@link AccStats.verify|verify} messages.
     * @function encodeDelimited
     * @memberof AccStats
     * @static
     * @param {IAccStats} message AccStats message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AccStats.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an AccStats message from the specified reader or buffer.
     * @function decode
     * @memberof AccStats
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {AccStats} AccStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AccStats.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.AccStats();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.ODBAMeanX100 = reader.uint32();
                    break;
                }
            case 2: {
                    message.ODBAMaxX100 = reader.uint32();
                    break;
                }
            case 3: {
                    message.VeDBAMeanX100 = reader.uint32();
                    break;
                }
            case 4: {
                    message.VeDBAMaxX100 = reader.uint32();
                    break;
                }
            case 5: {
                    message.StdDevX100 = $root.AccAxis.decode(reader, reader.uint32());
                    break;
                }
            case 6: {
                    message.MeanX100 = $root.AccAxis.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an AccStats message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof AccStats
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {AccStats} AccStats
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AccStats.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an AccStats message.
     * @function verify
     * @memberof AccStats
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    AccStats.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        var properties = {};
        if (message.ODBAMeanX100 != null && message.hasOwnProperty("ODBAMeanX100"))
            if (!$util.isInteger(message.ODBAMeanX100))
                return "ODBAMeanX100: integer expected";
        if (message.ODBAMaxX100 != null && message.hasOwnProperty("ODBAMaxX100"))
            if (!$util.isInteger(message.ODBAMaxX100))
                return "ODBAMaxX100: integer expected";
        if (message.VeDBAMeanX100 != null && message.hasOwnProperty("VeDBAMeanX100"))
            if (!$util.isInteger(message.VeDBAMeanX100))
                return "VeDBAMeanX100: integer expected";
        if (message.VeDBAMaxX100 != null && message.hasOwnProperty("VeDBAMaxX100"))
            if (!$util.isInteger(message.VeDBAMaxX100))
                return "VeDBAMaxX100: integer expected";
        if (message.StdDevX100 != null && message.hasOwnProperty("StdDevX100")) {
            properties._StdDevX100 = 1;
            {
                var error = $root.AccAxis.verify(message.StdDevX100);
                if (error)
                    return "StdDevX100." + error;
            }
        }
        if (message.MeanX100 != null && message.hasOwnProperty("MeanX100")) {
            properties._MeanX100 = 1;
            {
                var error = $root.AccAxis.verify(message.MeanX100);
                if (error)
                    return "MeanX100." + error;
            }
        }
        return null;
    };

    /**
     * Creates an AccStats message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof AccStats
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {AccStats} AccStats
     */
    AccStats.fromObject = function fromObject(object) {
        if (object instanceof $root.AccStats)
            return object;
        var message = new $root.AccStats();
        if (object.ODBAMeanX100 != null)
            message.ODBAMeanX100 = object.ODBAMeanX100 >>> 0;
        if (object.ODBAMaxX100 != null)
            message.ODBAMaxX100 = object.ODBAMaxX100 >>> 0;
        if (object.VeDBAMeanX100 != null)
            message.VeDBAMeanX100 = object.VeDBAMeanX100 >>> 0;
        if (object.VeDBAMaxX100 != null)
            message.VeDBAMaxX100 = object.VeDBAMaxX100 >>> 0;
        if (object.StdDevX100 != null) {
            if (typeof object.StdDevX100 !== "object")
                throw TypeError(".AccStats.StdDevX100: object expected");
            message.StdDevX100 = $root.AccAxis.fromObject(object.StdDevX100);
        }
        if (object.MeanX100 != null) {
            if (typeof object.MeanX100 !== "object")
                throw TypeError(".AccStats.MeanX100: object expected");
            message.MeanX100 = $root.AccAxis.fromObject(object.MeanX100);
        }
        return message;
    };

    /**
     * Creates a plain object from an AccStats message. Also converts values to other types if specified.
     * @function toObject
     * @memberof AccStats
     * @static
     * @param {AccStats} message AccStats
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    AccStats.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.ODBAMeanX100 = 0;
            object.ODBAMaxX100 = 0;
            object.VeDBAMeanX100 = 0;
            object.VeDBAMaxX100 = 0;
        }
        if (message.ODBAMeanX100 != null && message.hasOwnProperty("ODBAMeanX100"))
            object.ODBAMeanX100 = message.ODBAMeanX100;
        if (message.ODBAMaxX100 != null && message.hasOwnProperty("ODBAMaxX100"))
            object.ODBAMaxX100 = message.ODBAMaxX100;
        if (message.VeDBAMeanX100 != null && message.hasOwnProperty("VeDBAMeanX100"))
            object.VeDBAMeanX100 = message.VeDBAMeanX100;
        if (message.VeDBAMaxX100 != null && message.hasOwnProperty("VeDBAMaxX100"))
            object.VeDBAMaxX100 = message.VeDBAMaxX100;
        if (message.StdDevX100 != null && message.hasOwnProperty("StdDevX100")) {
            object.StdDevX100 = $root.AccAxis.toObject(message.StdDevX100, options);
            if (options.oneofs)
                object._StdDevX100 = "StdDevX100";
        }
        if (message.MeanX100 != null && message.hasOwnProperty("MeanX100")) {
            object.MeanX100 = $root.AccAxis.toObject(message.MeanX100, options);
            if (options.oneofs)
                object._MeanX100 = "MeanX100";
        }
        return object;
    };

    /**
     * Converts this AccStats to JSON.
     * @function toJSON
     * @memberof AccStats
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    AccStats.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for AccStats
     * @function getTypeUrl
     * @memberof AccStats
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    AccStats.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/AccStats";
    };

    return AccStats;
})();

$root.EnvData = (function() {

    /**
     * Properties of an EnvData.
     * @exports IEnvData
     * @interface IEnvData
     * @property {number|null} [temperatureX10] EnvData temperatureX10
     * @property {number|null} [humidityX10] EnvData humidityX10
     * @property {number|null} [gas] EnvData gas
     * @property {number|null} [pressure] EnvData pressure
     * @property {number|null} [light] EnvData light
     * @property {number|null} [timestamp] EnvData timestamp
     */

    /**
     * Constructs a new EnvData.
     * @exports EnvData
     * @classdesc Represents an EnvData.
     * @implements IEnvData
     * @constructor
     * @param {IEnvData=} [properties] Properties to set
     */
    function EnvData(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * EnvData temperatureX10.
     * @member {number|null|undefined} temperatureX10
     * @memberof EnvData
     * @instance
     */
    EnvData.prototype.temperatureX10 = null;

    /**
     * EnvData humidityX10.
     * @member {number|null|undefined} humidityX10
     * @memberof EnvData
     * @instance
     */
    EnvData.prototype.humidityX10 = null;

    /**
     * EnvData gas.
     * @member {number|null|undefined} gas
     * @memberof EnvData
     * @instance
     */
    EnvData.prototype.gas = null;

    /**
     * EnvData pressure.
     * @member {number|null|undefined} pressure
     * @memberof EnvData
     * @instance
     */
    EnvData.prototype.pressure = null;

    /**
     * EnvData light.
     * @member {number|null|undefined} light
     * @memberof EnvData
     * @instance
     */
    EnvData.prototype.light = null;

    /**
     * EnvData timestamp.
     * @member {number|null|undefined} timestamp
     * @memberof EnvData
     * @instance
     */
    EnvData.prototype.timestamp = null;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * EnvData _temperatureX10.
     * @member {"temperatureX10"|undefined} _temperatureX10
     * @memberof EnvData
     * @instance
     */
    Object.defineProperty(EnvData.prototype, "_temperatureX10", {
        get: $util.oneOfGetter($oneOfFields = ["temperatureX10"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * EnvData _humidityX10.
     * @member {"humidityX10"|undefined} _humidityX10
     * @memberof EnvData
     * @instance
     */
    Object.defineProperty(EnvData.prototype, "_humidityX10", {
        get: $util.oneOfGetter($oneOfFields = ["humidityX10"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * EnvData _gas.
     * @member {"gas"|undefined} _gas
     * @memberof EnvData
     * @instance
     */
    Object.defineProperty(EnvData.prototype, "_gas", {
        get: $util.oneOfGetter($oneOfFields = ["gas"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * EnvData _pressure.
     * @member {"pressure"|undefined} _pressure
     * @memberof EnvData
     * @instance
     */
    Object.defineProperty(EnvData.prototype, "_pressure", {
        get: $util.oneOfGetter($oneOfFields = ["pressure"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * EnvData _light.
     * @member {"light"|undefined} _light
     * @memberof EnvData
     * @instance
     */
    Object.defineProperty(EnvData.prototype, "_light", {
        get: $util.oneOfGetter($oneOfFields = ["light"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * EnvData _timestamp.
     * @member {"timestamp"|undefined} _timestamp
     * @memberof EnvData
     * @instance
     */
    Object.defineProperty(EnvData.prototype, "_timestamp", {
        get: $util.oneOfGetter($oneOfFields = ["timestamp"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new EnvData instance using the specified properties.
     * @function create
     * @memberof EnvData
     * @static
     * @param {IEnvData=} [properties] Properties to set
     * @returns {EnvData} EnvData instance
     */
    EnvData.create = function create(properties) {
        return new EnvData(properties);
    };

    /**
     * Encodes the specified EnvData message. Does not implicitly {@link EnvData.verify|verify} messages.
     * @function encode
     * @memberof EnvData
     * @static
     * @param {IEnvData} message EnvData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    EnvData.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.temperatureX10 != null && Object.hasOwnProperty.call(message, "temperatureX10"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.temperatureX10);
        if (message.humidityX10 != null && Object.hasOwnProperty.call(message, "humidityX10"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.humidityX10);
        if (message.gas != null && Object.hasOwnProperty.call(message, "gas"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.gas);
        if (message.pressure != null && Object.hasOwnProperty.call(message, "pressure"))
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.pressure);
        if (message.light != null && Object.hasOwnProperty.call(message, "light"))
            writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.light);
        if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
            writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.timestamp);
        return writer;
    };

    /**
     * Encodes the specified EnvData message, length delimited. Does not implicitly {@link EnvData.verify|verify} messages.
     * @function encodeDelimited
     * @memberof EnvData
     * @static
     * @param {IEnvData} message EnvData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    EnvData.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an EnvData message from the specified reader or buffer.
     * @function decode
     * @memberof EnvData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {EnvData} EnvData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    EnvData.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.EnvData();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.temperatureX10 = reader.int32();
                    break;
                }
            case 2: {
                    message.humidityX10 = reader.uint32();
                    break;
                }
            case 3: {
                    message.gas = reader.uint32();
                    break;
                }
            case 4: {
                    message.pressure = reader.uint32();
                    break;
                }
            case 5: {
                    message.light = reader.uint32();
                    break;
                }
            case 6: {
                    message.timestamp = reader.uint32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an EnvData message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof EnvData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {EnvData} EnvData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    EnvData.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an EnvData message.
     * @function verify
     * @memberof EnvData
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    EnvData.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        var properties = {};
        if (message.temperatureX10 != null && message.hasOwnProperty("temperatureX10")) {
            properties._temperatureX10 = 1;
            if (!$util.isInteger(message.temperatureX10))
                return "temperatureX10: integer expected";
        }
        if (message.humidityX10 != null && message.hasOwnProperty("humidityX10")) {
            properties._humidityX10 = 1;
            if (!$util.isInteger(message.humidityX10))
                return "humidityX10: integer expected";
        }
        if (message.gas != null && message.hasOwnProperty("gas")) {
            properties._gas = 1;
            if (!$util.isInteger(message.gas))
                return "gas: integer expected";
        }
        if (message.pressure != null && message.hasOwnProperty("pressure")) {
            properties._pressure = 1;
            if (!$util.isInteger(message.pressure))
                return "pressure: integer expected";
        }
        if (message.light != null && message.hasOwnProperty("light")) {
            properties._light = 1;
            if (!$util.isInteger(message.light))
                return "light: integer expected";
        }
        if (message.timestamp != null && message.hasOwnProperty("timestamp")) {
            properties._timestamp = 1;
            if (!$util.isInteger(message.timestamp))
                return "timestamp: integer expected";
        }
        return null;
    };

    /**
     * Creates an EnvData message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof EnvData
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {EnvData} EnvData
     */
    EnvData.fromObject = function fromObject(object) {
        if (object instanceof $root.EnvData)
            return object;
        var message = new $root.EnvData();
        if (object.temperatureX10 != null)
            message.temperatureX10 = object.temperatureX10 | 0;
        if (object.humidityX10 != null)
            message.humidityX10 = object.humidityX10 >>> 0;
        if (object.gas != null)
            message.gas = object.gas >>> 0;
        if (object.pressure != null)
            message.pressure = object.pressure >>> 0;
        if (object.light != null)
            message.light = object.light >>> 0;
        if (object.timestamp != null)
            message.timestamp = object.timestamp >>> 0;
        return message;
    };

    /**
     * Creates a plain object from an EnvData message. Also converts values to other types if specified.
     * @function toObject
     * @memberof EnvData
     * @static
     * @param {EnvData} message EnvData
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    EnvData.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (message.temperatureX10 != null && message.hasOwnProperty("temperatureX10")) {
            object.temperatureX10 = message.temperatureX10;
            if (options.oneofs)
                object._temperatureX10 = "temperatureX10";
        }
        if (message.humidityX10 != null && message.hasOwnProperty("humidityX10")) {
            object.humidityX10 = message.humidityX10;
            if (options.oneofs)
                object._humidityX10 = "humidityX10";
        }
        if (message.gas != null && message.hasOwnProperty("gas")) {
            object.gas = message.gas;
            if (options.oneofs)
                object._gas = "gas";
        }
        if (message.pressure != null && message.hasOwnProperty("pressure")) {
            object.pressure = message.pressure;
            if (options.oneofs)
                object._pressure = "pressure";
        }
        if (message.light != null && message.hasOwnProperty("light")) {
            object.light = message.light;
            if (options.oneofs)
                object._light = "light";
        }
        if (message.timestamp != null && message.hasOwnProperty("timestamp")) {
            object.timestamp = message.timestamp;
            if (options.oneofs)
                object._timestamp = "timestamp";
        }
        return object;
    };

    /**
     * Converts this EnvData to JSON.
     * @function toJSON
     * @memberof EnvData
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    EnvData.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for EnvData
     * @function getTypeUrl
     * @memberof EnvData
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    EnvData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/EnvData";
    };

    return EnvData;
})();

$root.ParticulateData = (function() {

    /**
     * Properties of a ParticulateData.
     * @exports IParticulateData
     * @interface IParticulateData
     * @property {number|null} [pm1] ParticulateData pm1
     * @property {number|null} [pm2_5] ParticulateData pm2_5
     * @property {number|null} [pm10] ParticulateData pm10
     * @property {number|null} [timestamp] ParticulateData timestamp
     */

    /**
     * Constructs a new ParticulateData.
     * @exports ParticulateData
     * @classdesc Represents a ParticulateData.
     * @implements IParticulateData
     * @constructor
     * @param {IParticulateData=} [properties] Properties to set
     */
    function ParticulateData(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ParticulateData pm1.
     * @member {number} pm1
     * @memberof ParticulateData
     * @instance
     */
    ParticulateData.prototype.pm1 = 0;

    /**
     * ParticulateData pm2_5.
     * @member {number} pm2_5
     * @memberof ParticulateData
     * @instance
     */
    ParticulateData.prototype.pm2_5 = 0;

    /**
     * ParticulateData pm10.
     * @member {number} pm10
     * @memberof ParticulateData
     * @instance
     */
    ParticulateData.prototype.pm10 = 0;

    /**
     * ParticulateData timestamp.
     * @member {number|null|undefined} timestamp
     * @memberof ParticulateData
     * @instance
     */
    ParticulateData.prototype.timestamp = null;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * ParticulateData _timestamp.
     * @member {"timestamp"|undefined} _timestamp
     * @memberof ParticulateData
     * @instance
     */
    Object.defineProperty(ParticulateData.prototype, "_timestamp", {
        get: $util.oneOfGetter($oneOfFields = ["timestamp"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new ParticulateData instance using the specified properties.
     * @function create
     * @memberof ParticulateData
     * @static
     * @param {IParticulateData=} [properties] Properties to set
     * @returns {ParticulateData} ParticulateData instance
     */
    ParticulateData.create = function create(properties) {
        return new ParticulateData(properties);
    };

    /**
     * Encodes the specified ParticulateData message. Does not implicitly {@link ParticulateData.verify|verify} messages.
     * @function encode
     * @memberof ParticulateData
     * @static
     * @param {IParticulateData} message ParticulateData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ParticulateData.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.pm1 != null && Object.hasOwnProperty.call(message, "pm1"))
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.pm1);
        if (message.pm2_5 != null && Object.hasOwnProperty.call(message, "pm2_5"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.pm2_5);
        if (message.pm10 != null && Object.hasOwnProperty.call(message, "pm10"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.pm10);
        if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.timestamp);
        return writer;
    };

    /**
     * Encodes the specified ParticulateData message, length delimited. Does not implicitly {@link ParticulateData.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ParticulateData
     * @static
     * @param {IParticulateData} message ParticulateData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ParticulateData.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ParticulateData message from the specified reader or buffer.
     * @function decode
     * @memberof ParticulateData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ParticulateData} ParticulateData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ParticulateData.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ParticulateData();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.pm1 = reader.uint32();
                    break;
                }
            case 2: {
                    message.pm2_5 = reader.uint32();
                    break;
                }
            case 3: {
                    message.pm10 = reader.uint32();
                    break;
                }
            case 4: {
                    message.timestamp = reader.uint32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a ParticulateData message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ParticulateData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ParticulateData} ParticulateData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ParticulateData.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ParticulateData message.
     * @function verify
     * @memberof ParticulateData
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ParticulateData.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        var properties = {};
        if (message.pm1 != null && message.hasOwnProperty("pm1"))
            if (!$util.isInteger(message.pm1))
                return "pm1: integer expected";
        if (message.pm2_5 != null && message.hasOwnProperty("pm2_5"))
            if (!$util.isInteger(message.pm2_5))
                return "pm2_5: integer expected";
        if (message.pm10 != null && message.hasOwnProperty("pm10"))
            if (!$util.isInteger(message.pm10))
                return "pm10: integer expected";
        if (message.timestamp != null && message.hasOwnProperty("timestamp")) {
            properties._timestamp = 1;
            if (!$util.isInteger(message.timestamp))
                return "timestamp: integer expected";
        }
        return null;
    };

    /**
     * Creates a ParticulateData message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ParticulateData
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ParticulateData} ParticulateData
     */
    ParticulateData.fromObject = function fromObject(object) {
        if (object instanceof $root.ParticulateData)
            return object;
        var message = new $root.ParticulateData();
        if (object.pm1 != null)
            message.pm1 = object.pm1 >>> 0;
        if (object.pm2_5 != null)
            message.pm2_5 = object.pm2_5 >>> 0;
        if (object.pm10 != null)
            message.pm10 = object.pm10 >>> 0;
        if (object.timestamp != null)
            message.timestamp = object.timestamp >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a ParticulateData message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ParticulateData
     * @static
     * @param {ParticulateData} message ParticulateData
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ParticulateData.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.pm1 = 0;
            object.pm2_5 = 0;
            object.pm10 = 0;
        }
        if (message.pm1 != null && message.hasOwnProperty("pm1"))
            object.pm1 = message.pm1;
        if (message.pm2_5 != null && message.hasOwnProperty("pm2_5"))
            object.pm2_5 = message.pm2_5;
        if (message.pm10 != null && message.hasOwnProperty("pm10"))
            object.pm10 = message.pm10;
        if (message.timestamp != null && message.hasOwnProperty("timestamp")) {
            object.timestamp = message.timestamp;
            if (options.oneofs)
                object._timestamp = "timestamp";
        }
        return object;
    };

    /**
     * Converts this ParticulateData to JSON.
     * @function toJSON
     * @memberof ParticulateData
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ParticulateData.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ParticulateData
     * @function getTypeUrl
     * @memberof ParticulateData
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ParticulateData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ParticulateData";
    };

    return ParticulateData;
})();

$root.ErrorFlags = (function() {

    /**
     * Properties of an ErrorFlags.
     * @exports IErrorFlags
     * @interface IErrorFlags
     * @property {number|null} [flag] ErrorFlags flag
     */

    /**
     * Constructs a new ErrorFlags.
     * @exports ErrorFlags
     * @classdesc Represents an ErrorFlags.
     * @implements IErrorFlags
     * @constructor
     * @param {IErrorFlags=} [properties] Properties to set
     */
    function ErrorFlags(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ErrorFlags flag.
     * @member {number} flag
     * @memberof ErrorFlags
     * @instance
     */
    ErrorFlags.prototype.flag = 0;

    /**
     * Creates a new ErrorFlags instance using the specified properties.
     * @function create
     * @memberof ErrorFlags
     * @static
     * @param {IErrorFlags=} [properties] Properties to set
     * @returns {ErrorFlags} ErrorFlags instance
     */
    ErrorFlags.create = function create(properties) {
        return new ErrorFlags(properties);
    };

    /**
     * Encodes the specified ErrorFlags message. Does not implicitly {@link ErrorFlags.verify|verify} messages.
     * @function encode
     * @memberof ErrorFlags
     * @static
     * @param {IErrorFlags} message ErrorFlags message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ErrorFlags.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.flag != null && Object.hasOwnProperty.call(message, "flag"))
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.flag);
        return writer;
    };

    /**
     * Encodes the specified ErrorFlags message, length delimited. Does not implicitly {@link ErrorFlags.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ErrorFlags
     * @static
     * @param {IErrorFlags} message ErrorFlags message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ErrorFlags.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an ErrorFlags message from the specified reader or buffer.
     * @function decode
     * @memberof ErrorFlags
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ErrorFlags} ErrorFlags
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ErrorFlags.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ErrorFlags();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.flag = reader.uint32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an ErrorFlags message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ErrorFlags
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ErrorFlags} ErrorFlags
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ErrorFlags.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an ErrorFlags message.
     * @function verify
     * @memberof ErrorFlags
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ErrorFlags.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.flag != null && message.hasOwnProperty("flag"))
            if (!$util.isInteger(message.flag))
                return "flag: integer expected";
        return null;
    };

    /**
     * Creates an ErrorFlags message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ErrorFlags
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ErrorFlags} ErrorFlags
     */
    ErrorFlags.fromObject = function fromObject(object) {
        if (object instanceof $root.ErrorFlags)
            return object;
        var message = new $root.ErrorFlags();
        if (object.flag != null)
            message.flag = object.flag >>> 0;
        return message;
    };

    /**
     * Creates a plain object from an ErrorFlags message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ErrorFlags
     * @static
     * @param {ErrorFlags} message ErrorFlags
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ErrorFlags.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults)
            object.flag = 0;
        if (message.flag != null && message.hasOwnProperty("flag"))
            object.flag = message.flag;
        return object;
    };

    /**
     * Converts this ErrorFlags to JSON.
     * @function toJSON
     * @memberof ErrorFlags
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ErrorFlags.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ErrorFlags
     * @function getTypeUrl
     * @memberof ErrorFlags
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ErrorFlags.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ErrorFlags";
    };

    return ErrorFlags;
})();

$root.Deployment = (function() {

    /**
     * Properties of a Deployment.
     * @exports IDeployment
     * @interface IDeployment
     * @property {IParticulateData|null} [particulateData] Deployment particulateData
     * @property {IEnvData|null} [envData] Deployment envData
     * @property {number|null} [spaceRemainingMb] Deployment spaceRemainingMb
     * @property {number|null} [batteryPercentageX10] Deployment batteryPercentageX10
     * @property {IAccStats|null} [accStats] Deployment accStats
     * @property {number|null} [steps] Deployment steps
     * @property {IGPSData_2|null} [gpsData] Deployment gpsData
     * @property {IErrorFlags|null} [errorFlags] Deployment errorFlags
     */

    /**
     * Constructs a new Deployment.
     * @exports Deployment
     * @classdesc Represents a Deployment.
     * @implements IDeployment
     * @constructor
     * @param {IDeployment=} [properties] Properties to set
     */
    function Deployment(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Deployment particulateData.
     * @member {IParticulateData|null|undefined} particulateData
     * @memberof Deployment
     * @instance
     */
    Deployment.prototype.particulateData = null;

    /**
     * Deployment envData.
     * @member {IEnvData|null|undefined} envData
     * @memberof Deployment
     * @instance
     */
    Deployment.prototype.envData = null;

    /**
     * Deployment spaceRemainingMb.
     * @member {number|null|undefined} spaceRemainingMb
     * @memberof Deployment
     * @instance
     */
    Deployment.prototype.spaceRemainingMb = null;

    /**
     * Deployment batteryPercentageX10.
     * @member {number} batteryPercentageX10
     * @memberof Deployment
     * @instance
     */
    Deployment.prototype.batteryPercentageX10 = 0;

    /**
     * Deployment accStats.
     * @member {IAccStats|null|undefined} accStats
     * @memberof Deployment
     * @instance
     */
    Deployment.prototype.accStats = null;

    /**
     * Deployment steps.
     * @member {number|null|undefined} steps
     * @memberof Deployment
     * @instance
     */
    Deployment.prototype.steps = null;

    /**
     * Deployment gpsData.
     * @member {IGPSData_2|null|undefined} gpsData
     * @memberof Deployment
     * @instance
     */
    Deployment.prototype.gpsData = null;

    /**
     * Deployment errorFlags.
     * @member {IErrorFlags|null|undefined} errorFlags
     * @memberof Deployment
     * @instance
     */
    Deployment.prototype.errorFlags = null;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * Deployment _particulateData.
     * @member {"particulateData"|undefined} _particulateData
     * @memberof Deployment
     * @instance
     */
    Object.defineProperty(Deployment.prototype, "_particulateData", {
        get: $util.oneOfGetter($oneOfFields = ["particulateData"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Deployment _envData.
     * @member {"envData"|undefined} _envData
     * @memberof Deployment
     * @instance
     */
    Object.defineProperty(Deployment.prototype, "_envData", {
        get: $util.oneOfGetter($oneOfFields = ["envData"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Deployment _spaceRemainingMb.
     * @member {"spaceRemainingMb"|undefined} _spaceRemainingMb
     * @memberof Deployment
     * @instance
     */
    Object.defineProperty(Deployment.prototype, "_spaceRemainingMb", {
        get: $util.oneOfGetter($oneOfFields = ["spaceRemainingMb"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Deployment _accStats.
     * @member {"accStats"|undefined} _accStats
     * @memberof Deployment
     * @instance
     */
    Object.defineProperty(Deployment.prototype, "_accStats", {
        get: $util.oneOfGetter($oneOfFields = ["accStats"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Deployment _steps.
     * @member {"steps"|undefined} _steps
     * @memberof Deployment
     * @instance
     */
    Object.defineProperty(Deployment.prototype, "_steps", {
        get: $util.oneOfGetter($oneOfFields = ["steps"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Deployment _gpsData.
     * @member {"gpsData"|undefined} _gpsData
     * @memberof Deployment
     * @instance
     */
    Object.defineProperty(Deployment.prototype, "_gpsData", {
        get: $util.oneOfGetter($oneOfFields = ["gpsData"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Deployment _errorFlags.
     * @member {"errorFlags"|undefined} _errorFlags
     * @memberof Deployment
     * @instance
     */
    Object.defineProperty(Deployment.prototype, "_errorFlags", {
        get: $util.oneOfGetter($oneOfFields = ["errorFlags"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new Deployment instance using the specified properties.
     * @function create
     * @memberof Deployment
     * @static
     * @param {IDeployment=} [properties] Properties to set
     * @returns {Deployment} Deployment instance
     */
    Deployment.create = function create(properties) {
        return new Deployment(properties);
    };

    /**
     * Encodes the specified Deployment message. Does not implicitly {@link Deployment.verify|verify} messages.
     * @function encode
     * @memberof Deployment
     * @static
     * @param {IDeployment} message Deployment message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Deployment.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.particulateData != null && Object.hasOwnProperty.call(message, "particulateData"))
            $root.ParticulateData.encode(message.particulateData, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.envData != null && Object.hasOwnProperty.call(message, "envData"))
            $root.EnvData.encode(message.envData, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.spaceRemainingMb != null && Object.hasOwnProperty.call(message, "spaceRemainingMb"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.spaceRemainingMb);
        if (message.batteryPercentageX10 != null && Object.hasOwnProperty.call(message, "batteryPercentageX10"))
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.batteryPercentageX10);
        if (message.accStats != null && Object.hasOwnProperty.call(message, "accStats"))
            $root.AccStats.encode(message.accStats, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        if (message.steps != null && Object.hasOwnProperty.call(message, "steps"))
            writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.steps);
        if (message.gpsData != null && Object.hasOwnProperty.call(message, "gpsData"))
            $root.GPSData_2.encode(message.gpsData, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
        if (message.errorFlags != null && Object.hasOwnProperty.call(message, "errorFlags"))
            $root.ErrorFlags.encode(message.errorFlags, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Deployment message, length delimited. Does not implicitly {@link Deployment.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Deployment
     * @static
     * @param {IDeployment} message Deployment message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Deployment.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Deployment message from the specified reader or buffer.
     * @function decode
     * @memberof Deployment
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Deployment} Deployment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Deployment.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Deployment();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.particulateData = $root.ParticulateData.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    message.envData = $root.EnvData.decode(reader, reader.uint32());
                    break;
                }
            case 3: {
                    message.spaceRemainingMb = reader.uint32();
                    break;
                }
            case 4: {
                    message.batteryPercentageX10 = reader.uint32();
                    break;
                }
            case 5: {
                    message.accStats = $root.AccStats.decode(reader, reader.uint32());
                    break;
                }
            case 6: {
                    message.steps = reader.uint32();
                    break;
                }
            case 7: {
                    message.gpsData = $root.GPSData_2.decode(reader, reader.uint32());
                    break;
                }
            case 8: {
                    message.errorFlags = $root.ErrorFlags.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Deployment message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Deployment
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Deployment} Deployment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Deployment.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Deployment message.
     * @function verify
     * @memberof Deployment
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Deployment.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        var properties = {};
        if (message.particulateData != null && message.hasOwnProperty("particulateData")) {
            properties._particulateData = 1;
            {
                var error = $root.ParticulateData.verify(message.particulateData);
                if (error)
                    return "particulateData." + error;
            }
        }
        if (message.envData != null && message.hasOwnProperty("envData")) {
            properties._envData = 1;
            {
                var error = $root.EnvData.verify(message.envData);
                if (error)
                    return "envData." + error;
            }
        }
        if (message.spaceRemainingMb != null && message.hasOwnProperty("spaceRemainingMb")) {
            properties._spaceRemainingMb = 1;
            if (!$util.isInteger(message.spaceRemainingMb))
                return "spaceRemainingMb: integer expected";
        }
        if (message.batteryPercentageX10 != null && message.hasOwnProperty("batteryPercentageX10"))
            if (!$util.isInteger(message.batteryPercentageX10))
                return "batteryPercentageX10: integer expected";
        if (message.accStats != null && message.hasOwnProperty("accStats")) {
            properties._accStats = 1;
            {
                var error = $root.AccStats.verify(message.accStats);
                if (error)
                    return "accStats." + error;
            }
        }
        if (message.steps != null && message.hasOwnProperty("steps")) {
            properties._steps = 1;
            if (!$util.isInteger(message.steps))
                return "steps: integer expected";
        }
        if (message.gpsData != null && message.hasOwnProperty("gpsData")) {
            properties._gpsData = 1;
            {
                var error = $root.GPSData_2.verify(message.gpsData);
                if (error)
                    return "gpsData." + error;
            }
        }
        if (message.errorFlags != null && message.hasOwnProperty("errorFlags")) {
            properties._errorFlags = 1;
            {
                var error = $root.ErrorFlags.verify(message.errorFlags);
                if (error)
                    return "errorFlags." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Deployment message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Deployment
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Deployment} Deployment
     */
    Deployment.fromObject = function fromObject(object) {
        if (object instanceof $root.Deployment)
            return object;
        var message = new $root.Deployment();
        if (object.particulateData != null) {
            if (typeof object.particulateData !== "object")
                throw TypeError(".Deployment.particulateData: object expected");
            message.particulateData = $root.ParticulateData.fromObject(object.particulateData);
        }
        if (object.envData != null) {
            if (typeof object.envData !== "object")
                throw TypeError(".Deployment.envData: object expected");
            message.envData = $root.EnvData.fromObject(object.envData);
        }
        if (object.spaceRemainingMb != null)
            message.spaceRemainingMb = object.spaceRemainingMb >>> 0;
        if (object.batteryPercentageX10 != null)
            message.batteryPercentageX10 = object.batteryPercentageX10 >>> 0;
        if (object.accStats != null) {
            if (typeof object.accStats !== "object")
                throw TypeError(".Deployment.accStats: object expected");
            message.accStats = $root.AccStats.fromObject(object.accStats);
        }
        if (object.steps != null)
            message.steps = object.steps >>> 0;
        if (object.gpsData != null) {
            if (typeof object.gpsData !== "object")
                throw TypeError(".Deployment.gpsData: object expected");
            message.gpsData = $root.GPSData_2.fromObject(object.gpsData);
        }
        if (object.errorFlags != null) {
            if (typeof object.errorFlags !== "object")
                throw TypeError(".Deployment.errorFlags: object expected");
            message.errorFlags = $root.ErrorFlags.fromObject(object.errorFlags);
        }
        return message;
    };

    /**
     * Creates a plain object from a Deployment message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Deployment
     * @static
     * @param {Deployment} message Deployment
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Deployment.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults)
            object.batteryPercentageX10 = 0;
        if (message.particulateData != null && message.hasOwnProperty("particulateData")) {
            object.particulateData = $root.ParticulateData.toObject(message.particulateData, options);
            if (options.oneofs)
                object._particulateData = "particulateData";
        }
        if (message.envData != null && message.hasOwnProperty("envData")) {
            object.envData = $root.EnvData.toObject(message.envData, options);
            if (options.oneofs)
                object._envData = "envData";
        }
        if (message.spaceRemainingMb != null && message.hasOwnProperty("spaceRemainingMb")) {
            object.spaceRemainingMb = message.spaceRemainingMb;
            if (options.oneofs)
                object._spaceRemainingMb = "spaceRemainingMb";
        }
        if (message.batteryPercentageX10 != null && message.hasOwnProperty("batteryPercentageX10"))
            object.batteryPercentageX10 = message.batteryPercentageX10;
        if (message.accStats != null && message.hasOwnProperty("accStats")) {
            object.accStats = $root.AccStats.toObject(message.accStats, options);
            if (options.oneofs)
                object._accStats = "accStats";
        }
        if (message.steps != null && message.hasOwnProperty("steps")) {
            object.steps = message.steps;
            if (options.oneofs)
                object._steps = "steps";
        }
        if (message.gpsData != null && message.hasOwnProperty("gpsData")) {
            object.gpsData = $root.GPSData_2.toObject(message.gpsData, options);
            if (options.oneofs)
                object._gpsData = "gpsData";
        }
        if (message.errorFlags != null && message.hasOwnProperty("errorFlags")) {
            object.errorFlags = $root.ErrorFlags.toObject(message.errorFlags, options);
            if (options.oneofs)
                object._errorFlags = "errorFlags";
        }
        return object;
    };

    /**
     * Converts this Deployment to JSON.
     * @function toJSON
     * @memberof Deployment
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Deployment.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Deployment
     * @function getTypeUrl
     * @memberof Deployment
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Deployment.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Deployment";
    };

    return Deployment;
})();

$root.MessagePacket = (function() {

    /**
     * Properties of a MessagePacket.
     * @exports IMessagePacket
     * @interface IMessagePacket
     * @property {IPacketHeader|null} [header] MessagePacket header
     * @property {ISystemInfoPacket|null} [systemInfoPacket] MessagePacket systemInfoPacket
     * @property {IConfigPacket|null} [configPacket] MessagePacket configPacket
     * @property {IAckPacket|null} [ackPacket] MessagePacket ackPacket
     * @property {IDeployment|null} [systemDeploymentPacket] MessagePacket systemDeploymentPacket
     * @property {IRadioInfo|null} [radioInfo] MessagePacket radioInfo
     */

    /**
     * Constructs a new MessagePacket.
     * @exports MessagePacket
     * @classdesc Represents a MessagePacket.
     * @implements IMessagePacket
     * @constructor
     * @param {IMessagePacket=} [properties] Properties to set
     */
    function MessagePacket(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * MessagePacket header.
     * @member {IPacketHeader|null|undefined} header
     * @memberof MessagePacket
     * @instance
     */
    MessagePacket.prototype.header = null;

    /**
     * MessagePacket systemInfoPacket.
     * @member {ISystemInfoPacket|null|undefined} systemInfoPacket
     * @memberof MessagePacket
     * @instance
     */
    MessagePacket.prototype.systemInfoPacket = null;

    /**
     * MessagePacket configPacket.
     * @member {IConfigPacket|null|undefined} configPacket
     * @memberof MessagePacket
     * @instance
     */
    MessagePacket.prototype.configPacket = null;

    /**
     * MessagePacket ackPacket.
     * @member {IAckPacket|null|undefined} ackPacket
     * @memberof MessagePacket
     * @instance
     */
    MessagePacket.prototype.ackPacket = null;

    /**
     * MessagePacket systemDeploymentPacket.
     * @member {IDeployment|null|undefined} systemDeploymentPacket
     * @memberof MessagePacket
     * @instance
     */
    MessagePacket.prototype.systemDeploymentPacket = null;

    /**
     * MessagePacket radioInfo.
     * @member {IRadioInfo|null|undefined} radioInfo
     * @memberof MessagePacket
     * @instance
     */
    MessagePacket.prototype.radioInfo = null;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * MessagePacket payload.
     * @member {"systemInfoPacket"|"configPacket"|"ackPacket"|"systemDeploymentPacket"|undefined} payload
     * @memberof MessagePacket
     * @instance
     */
    Object.defineProperty(MessagePacket.prototype, "payload", {
        get: $util.oneOfGetter($oneOfFields = ["systemInfoPacket", "configPacket", "ackPacket", "systemDeploymentPacket"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * MessagePacket _radioInfo.
     * @member {"radioInfo"|undefined} _radioInfo
     * @memberof MessagePacket
     * @instance
     */
    Object.defineProperty(MessagePacket.prototype, "_radioInfo", {
        get: $util.oneOfGetter($oneOfFields = ["radioInfo"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new MessagePacket instance using the specified properties.
     * @function create
     * @memberof MessagePacket
     * @static
     * @param {IMessagePacket=} [properties] Properties to set
     * @returns {MessagePacket} MessagePacket instance
     */
    MessagePacket.create = function create(properties) {
        return new MessagePacket(properties);
    };

    /**
     * Encodes the specified MessagePacket message. Does not implicitly {@link MessagePacket.verify|verify} messages.
     * @function encode
     * @memberof MessagePacket
     * @static
     * @param {IMessagePacket} message MessagePacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MessagePacket.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.header != null && Object.hasOwnProperty.call(message, "header"))
            $root.PacketHeader.encode(message.header, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.systemInfoPacket != null && Object.hasOwnProperty.call(message, "systemInfoPacket"))
            $root.SystemInfoPacket.encode(message.systemInfoPacket, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.configPacket != null && Object.hasOwnProperty.call(message, "configPacket"))
            $root.ConfigPacket.encode(message.configPacket, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.ackPacket != null && Object.hasOwnProperty.call(message, "ackPacket"))
            $root.AckPacket.encode(message.ackPacket, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.systemDeploymentPacket != null && Object.hasOwnProperty.call(message, "systemDeploymentPacket"))
            $root.Deployment.encode(message.systemDeploymentPacket, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        if (message.radioInfo != null && Object.hasOwnProperty.call(message, "radioInfo"))
            $root.RadioInfo.encode(message.radioInfo, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified MessagePacket message, length delimited. Does not implicitly {@link MessagePacket.verify|verify} messages.
     * @function encodeDelimited
     * @memberof MessagePacket
     * @static
     * @param {IMessagePacket} message MessagePacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MessagePacket.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a MessagePacket message from the specified reader or buffer.
     * @function decode
     * @memberof MessagePacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {MessagePacket} MessagePacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MessagePacket.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.MessagePacket();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.header = $root.PacketHeader.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    message.systemInfoPacket = $root.SystemInfoPacket.decode(reader, reader.uint32());
                    break;
                }
            case 3: {
                    message.configPacket = $root.ConfigPacket.decode(reader, reader.uint32());
                    break;
                }
            case 4: {
                    message.ackPacket = $root.AckPacket.decode(reader, reader.uint32());
                    break;
                }
            case 5: {
                    message.systemDeploymentPacket = $root.Deployment.decode(reader, reader.uint32());
                    break;
                }
            case 6: {
                    message.radioInfo = $root.RadioInfo.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a MessagePacket message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof MessagePacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {MessagePacket} MessagePacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MessagePacket.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a MessagePacket message.
     * @function verify
     * @memberof MessagePacket
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    MessagePacket.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        var properties = {};
        if (message.header != null && message.hasOwnProperty("header")) {
            var error = $root.PacketHeader.verify(message.header);
            if (error)
                return "header." + error;
        }
        if (message.systemInfoPacket != null && message.hasOwnProperty("systemInfoPacket")) {
            properties.payload = 1;
            {
                var error = $root.SystemInfoPacket.verify(message.systemInfoPacket);
                if (error)
                    return "systemInfoPacket." + error;
            }
        }
        if (message.configPacket != null && message.hasOwnProperty("configPacket")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                var error = $root.ConfigPacket.verify(message.configPacket);
                if (error)
                    return "configPacket." + error;
            }
        }
        if (message.ackPacket != null && message.hasOwnProperty("ackPacket")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                var error = $root.AckPacket.verify(message.ackPacket);
                if (error)
                    return "ackPacket." + error;
            }
        }
        if (message.systemDeploymentPacket != null && message.hasOwnProperty("systemDeploymentPacket")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                var error = $root.Deployment.verify(message.systemDeploymentPacket);
                if (error)
                    return "systemDeploymentPacket." + error;
            }
        }
        if (message.radioInfo != null && message.hasOwnProperty("radioInfo")) {
            properties._radioInfo = 1;
            {
                var error = $root.RadioInfo.verify(message.radioInfo);
                if (error)
                    return "radioInfo." + error;
            }
        }
        return null;
    };

    /**
     * Creates a MessagePacket message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof MessagePacket
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {MessagePacket} MessagePacket
     */
    MessagePacket.fromObject = function fromObject(object) {
        if (object instanceof $root.MessagePacket)
            return object;
        var message = new $root.MessagePacket();
        if (object.header != null) {
            if (typeof object.header !== "object")
                throw TypeError(".MessagePacket.header: object expected");
            message.header = $root.PacketHeader.fromObject(object.header);
        }
        if (object.systemInfoPacket != null) {
            if (typeof object.systemInfoPacket !== "object")
                throw TypeError(".MessagePacket.systemInfoPacket: object expected");
            message.systemInfoPacket = $root.SystemInfoPacket.fromObject(object.systemInfoPacket);
        }
        if (object.configPacket != null) {
            if (typeof object.configPacket !== "object")
                throw TypeError(".MessagePacket.configPacket: object expected");
            message.configPacket = $root.ConfigPacket.fromObject(object.configPacket);
        }
        if (object.ackPacket != null) {
            if (typeof object.ackPacket !== "object")
                throw TypeError(".MessagePacket.ackPacket: object expected");
            message.ackPacket = $root.AckPacket.fromObject(object.ackPacket);
        }
        if (object.systemDeploymentPacket != null) {
            if (typeof object.systemDeploymentPacket !== "object")
                throw TypeError(".MessagePacket.systemDeploymentPacket: object expected");
            message.systemDeploymentPacket = $root.Deployment.fromObject(object.systemDeploymentPacket);
        }
        if (object.radioInfo != null) {
            if (typeof object.radioInfo !== "object")
                throw TypeError(".MessagePacket.radioInfo: object expected");
            message.radioInfo = $root.RadioInfo.fromObject(object.radioInfo);
        }
        return message;
    };

    /**
     * Creates a plain object from a MessagePacket message. Also converts values to other types if specified.
     * @function toObject
     * @memberof MessagePacket
     * @static
     * @param {MessagePacket} message MessagePacket
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    MessagePacket.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults)
            object.header = null;
        if (message.header != null && message.hasOwnProperty("header"))
            object.header = $root.PacketHeader.toObject(message.header, options);
        if (message.systemInfoPacket != null && message.hasOwnProperty("systemInfoPacket")) {
            object.systemInfoPacket = $root.SystemInfoPacket.toObject(message.systemInfoPacket, options);
            if (options.oneofs)
                object.payload = "systemInfoPacket";
        }
        if (message.configPacket != null && message.hasOwnProperty("configPacket")) {
            object.configPacket = $root.ConfigPacket.toObject(message.configPacket, options);
            if (options.oneofs)
                object.payload = "configPacket";
        }
        if (message.ackPacket != null && message.hasOwnProperty("ackPacket")) {
            object.ackPacket = $root.AckPacket.toObject(message.ackPacket, options);
            if (options.oneofs)
                object.payload = "ackPacket";
        }
        if (message.systemDeploymentPacket != null && message.hasOwnProperty("systemDeploymentPacket")) {
            object.systemDeploymentPacket = $root.Deployment.toObject(message.systemDeploymentPacket, options);
            if (options.oneofs)
                object.payload = "systemDeploymentPacket";
        }
        if (message.radioInfo != null && message.hasOwnProperty("radioInfo")) {
            object.radioInfo = $root.RadioInfo.toObject(message.radioInfo, options);
            if (options.oneofs)
                object._radioInfo = "radioInfo";
        }
        return object;
    };

    /**
     * Converts this MessagePacket to JSON.
     * @function toJSON
     * @memberof MessagePacket
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    MessagePacket.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for MessagePacket
     * @function getTypeUrl
     * @memberof MessagePacket
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    MessagePacket.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/MessagePacket";
    };

    return MessagePacket;
})();

$root.TimeWindow = (function() {

    /**
     * Properties of a TimeWindow.
     * @exports ITimeWindow
     * @interface ITimeWindow
     * @property {number|null} [startHour] TimeWindow startHour
     * @property {number|null} [endHour] TimeWindow endHour
     */

    /**
     * Constructs a new TimeWindow.
     * @exports TimeWindow
     * @classdesc Represents a TimeWindow.
     * @implements ITimeWindow
     * @constructor
     * @param {ITimeWindow=} [properties] Properties to set
     */
    function TimeWindow(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * TimeWindow startHour.
     * @member {number} startHour
     * @memberof TimeWindow
     * @instance
     */
    TimeWindow.prototype.startHour = 0;

    /**
     * TimeWindow endHour.
     * @member {number} endHour
     * @memberof TimeWindow
     * @instance
     */
    TimeWindow.prototype.endHour = 0;

    /**
     * Creates a new TimeWindow instance using the specified properties.
     * @function create
     * @memberof TimeWindow
     * @static
     * @param {ITimeWindow=} [properties] Properties to set
     * @returns {TimeWindow} TimeWindow instance
     */
    TimeWindow.create = function create(properties) {
        return new TimeWindow(properties);
    };

    /**
     * Encodes the specified TimeWindow message. Does not implicitly {@link TimeWindow.verify|verify} messages.
     * @function encode
     * @memberof TimeWindow
     * @static
     * @param {ITimeWindow} message TimeWindow message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TimeWindow.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.startHour != null && Object.hasOwnProperty.call(message, "startHour"))
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.startHour);
        if (message.endHour != null && Object.hasOwnProperty.call(message, "endHour"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.endHour);
        return writer;
    };

    /**
     * Encodes the specified TimeWindow message, length delimited. Does not implicitly {@link TimeWindow.verify|verify} messages.
     * @function encodeDelimited
     * @memberof TimeWindow
     * @static
     * @param {ITimeWindow} message TimeWindow message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TimeWindow.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a TimeWindow message from the specified reader or buffer.
     * @function decode
     * @memberof TimeWindow
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {TimeWindow} TimeWindow
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TimeWindow.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.TimeWindow();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.startHour = reader.uint32();
                    break;
                }
            case 2: {
                    message.endHour = reader.uint32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a TimeWindow message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof TimeWindow
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {TimeWindow} TimeWindow
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TimeWindow.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a TimeWindow message.
     * @function verify
     * @memberof TimeWindow
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    TimeWindow.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.startHour != null && message.hasOwnProperty("startHour"))
            if (!$util.isInteger(message.startHour))
                return "startHour: integer expected";
        if (message.endHour != null && message.hasOwnProperty("endHour"))
            if (!$util.isInteger(message.endHour))
                return "endHour: integer expected";
        return null;
    };

    /**
     * Creates a TimeWindow message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof TimeWindow
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {TimeWindow} TimeWindow
     */
    TimeWindow.fromObject = function fromObject(object) {
        if (object instanceof $root.TimeWindow)
            return object;
        var message = new $root.TimeWindow();
        if (object.startHour != null)
            message.startHour = object.startHour >>> 0;
        if (object.endHour != null)
            message.endHour = object.endHour >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a TimeWindow message. Also converts values to other types if specified.
     * @function toObject
     * @memberof TimeWindow
     * @static
     * @param {TimeWindow} message TimeWindow
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    TimeWindow.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.startHour = 0;
            object.endHour = 0;
        }
        if (message.startHour != null && message.hasOwnProperty("startHour"))
            object.startHour = message.startHour;
        if (message.endHour != null && message.hasOwnProperty("endHour"))
            object.endHour = message.endHour;
        return object;
    };

    /**
     * Converts this TimeWindow to JSON.
     * @function toJSON
     * @memberof TimeWindow
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    TimeWindow.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for TimeWindow
     * @function getTypeUrl
     * @memberof TimeWindow
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    TimeWindow.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/TimeWindow";
    };

    return TimeWindow;
})();

$root.SamplingConfig = (function() {

    /**
     * Properties of a SamplingConfig.
     * @exports ISamplingConfig
     * @interface ISamplingConfig
     * @property {boolean|null} [enabled] SamplingConfig enabled
     * @property {number|null} [sampleIntervalMin] SamplingConfig sampleIntervalMin
     */

    /**
     * Constructs a new SamplingConfig.
     * @exports SamplingConfig
     * @classdesc Represents a SamplingConfig.
     * @implements ISamplingConfig
     * @constructor
     * @param {ISamplingConfig=} [properties] Properties to set
     */
    function SamplingConfig(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * SamplingConfig enabled.
     * @member {boolean} enabled
     * @memberof SamplingConfig
     * @instance
     */
    SamplingConfig.prototype.enabled = false;

    /**
     * SamplingConfig sampleIntervalMin.
     * @member {number} sampleIntervalMin
     * @memberof SamplingConfig
     * @instance
     */
    SamplingConfig.prototype.sampleIntervalMin = 0;

    /**
     * Creates a new SamplingConfig instance using the specified properties.
     * @function create
     * @memberof SamplingConfig
     * @static
     * @param {ISamplingConfig=} [properties] Properties to set
     * @returns {SamplingConfig} SamplingConfig instance
     */
    SamplingConfig.create = function create(properties) {
        return new SamplingConfig(properties);
    };

    /**
     * Encodes the specified SamplingConfig message. Does not implicitly {@link SamplingConfig.verify|verify} messages.
     * @function encode
     * @memberof SamplingConfig
     * @static
     * @param {ISamplingConfig} message SamplingConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SamplingConfig.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.enabled != null && Object.hasOwnProperty.call(message, "enabled"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.enabled);
        if (message.sampleIntervalMin != null && Object.hasOwnProperty.call(message, "sampleIntervalMin"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.sampleIntervalMin);
        return writer;
    };

    /**
     * Encodes the specified SamplingConfig message, length delimited. Does not implicitly {@link SamplingConfig.verify|verify} messages.
     * @function encodeDelimited
     * @memberof SamplingConfig
     * @static
     * @param {ISamplingConfig} message SamplingConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SamplingConfig.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a SamplingConfig message from the specified reader or buffer.
     * @function decode
     * @memberof SamplingConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {SamplingConfig} SamplingConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SamplingConfig.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.SamplingConfig();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.enabled = reader.bool();
                    break;
                }
            case 2: {
                    message.sampleIntervalMin = reader.uint32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a SamplingConfig message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof SamplingConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {SamplingConfig} SamplingConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SamplingConfig.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a SamplingConfig message.
     * @function verify
     * @memberof SamplingConfig
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    SamplingConfig.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            if (typeof message.enabled !== "boolean")
                return "enabled: boolean expected";
        if (message.sampleIntervalMin != null && message.hasOwnProperty("sampleIntervalMin"))
            if (!$util.isInteger(message.sampleIntervalMin))
                return "sampleIntervalMin: integer expected";
        return null;
    };

    /**
     * Creates a SamplingConfig message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof SamplingConfig
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {SamplingConfig} SamplingConfig
     */
    SamplingConfig.fromObject = function fromObject(object) {
        if (object instanceof $root.SamplingConfig)
            return object;
        var message = new $root.SamplingConfig();
        if (object.enabled != null)
            message.enabled = Boolean(object.enabled);
        if (object.sampleIntervalMin != null)
            message.sampleIntervalMin = object.sampleIntervalMin >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a SamplingConfig message. Also converts values to other types if specified.
     * @function toObject
     * @memberof SamplingConfig
     * @static
     * @param {SamplingConfig} message SamplingConfig
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    SamplingConfig.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.enabled = false;
            object.sampleIntervalMin = 0;
        }
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            object.enabled = message.enabled;
        if (message.sampleIntervalMin != null && message.hasOwnProperty("sampleIntervalMin"))
            object.sampleIntervalMin = message.sampleIntervalMin;
        return object;
    };

    /**
     * Converts this SamplingConfig to JSON.
     * @function toJSON
     * @memberof SamplingConfig
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    SamplingConfig.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for SamplingConfig
     * @function getTypeUrl
     * @memberof SamplingConfig
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    SamplingConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/SamplingConfig";
    };

    return SamplingConfig;
})();

$root.GPSConfig = (function() {

    /**
     * Properties of a GPSConfig.
     * @exports IGPSConfig
     * @interface IGPSConfig
     * @property {boolean|null} [enabled] GPSConfig enabled
     * @property {number|null} [sampleIntervalMin] GPSConfig sampleIntervalMin
     * @property {number|null} [accuracy] GPSConfig accuracy
     */

    /**
     * Constructs a new GPSConfig.
     * @exports GPSConfig
     * @classdesc Represents a GPSConfig.
     * @implements IGPSConfig
     * @constructor
     * @param {IGPSConfig=} [properties] Properties to set
     */
    function GPSConfig(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * GPSConfig enabled.
     * @member {boolean} enabled
     * @memberof GPSConfig
     * @instance
     */
    GPSConfig.prototype.enabled = false;

    /**
     * GPSConfig sampleIntervalMin.
     * @member {number} sampleIntervalMin
     * @memberof GPSConfig
     * @instance
     */
    GPSConfig.prototype.sampleIntervalMin = 0;

    /**
     * GPSConfig accuracy.
     * @member {number} accuracy
     * @memberof GPSConfig
     * @instance
     */
    GPSConfig.prototype.accuracy = 0;

    /**
     * Creates a new GPSConfig instance using the specified properties.
     * @function create
     * @memberof GPSConfig
     * @static
     * @param {IGPSConfig=} [properties] Properties to set
     * @returns {GPSConfig} GPSConfig instance
     */
    GPSConfig.create = function create(properties) {
        return new GPSConfig(properties);
    };

    /**
     * Encodes the specified GPSConfig message. Does not implicitly {@link GPSConfig.verify|verify} messages.
     * @function encode
     * @memberof GPSConfig
     * @static
     * @param {IGPSConfig} message GPSConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GPSConfig.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.enabled != null && Object.hasOwnProperty.call(message, "enabled"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.enabled);
        if (message.sampleIntervalMin != null && Object.hasOwnProperty.call(message, "sampleIntervalMin"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.sampleIntervalMin);
        if (message.accuracy != null && Object.hasOwnProperty.call(message, "accuracy"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.accuracy);
        return writer;
    };

    /**
     * Encodes the specified GPSConfig message, length delimited. Does not implicitly {@link GPSConfig.verify|verify} messages.
     * @function encodeDelimited
     * @memberof GPSConfig
     * @static
     * @param {IGPSConfig} message GPSConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GPSConfig.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a GPSConfig message from the specified reader or buffer.
     * @function decode
     * @memberof GPSConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {GPSConfig} GPSConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GPSConfig.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GPSConfig();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.enabled = reader.bool();
                    break;
                }
            case 2: {
                    message.sampleIntervalMin = reader.uint32();
                    break;
                }
            case 3: {
                    message.accuracy = reader.uint32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a GPSConfig message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof GPSConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {GPSConfig} GPSConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GPSConfig.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a GPSConfig message.
     * @function verify
     * @memberof GPSConfig
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    GPSConfig.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            if (typeof message.enabled !== "boolean")
                return "enabled: boolean expected";
        if (message.sampleIntervalMin != null && message.hasOwnProperty("sampleIntervalMin"))
            if (!$util.isInteger(message.sampleIntervalMin))
                return "sampleIntervalMin: integer expected";
        if (message.accuracy != null && message.hasOwnProperty("accuracy"))
            if (!$util.isInteger(message.accuracy))
                return "accuracy: integer expected";
        return null;
    };

    /**
     * Creates a GPSConfig message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof GPSConfig
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {GPSConfig} GPSConfig
     */
    GPSConfig.fromObject = function fromObject(object) {
        if (object instanceof $root.GPSConfig)
            return object;
        var message = new $root.GPSConfig();
        if (object.enabled != null)
            message.enabled = Boolean(object.enabled);
        if (object.sampleIntervalMin != null)
            message.sampleIntervalMin = object.sampleIntervalMin >>> 0;
        if (object.accuracy != null)
            message.accuracy = object.accuracy >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a GPSConfig message. Also converts values to other types if specified.
     * @function toObject
     * @memberof GPSConfig
     * @static
     * @param {GPSConfig} message GPSConfig
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    GPSConfig.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.enabled = false;
            object.sampleIntervalMin = 0;
            object.accuracy = 0;
        }
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            object.enabled = message.enabled;
        if (message.sampleIntervalMin != null && message.hasOwnProperty("sampleIntervalMin"))
            object.sampleIntervalMin = message.sampleIntervalMin;
        if (message.accuracy != null && message.hasOwnProperty("accuracy"))
            object.accuracy = message.accuracy;
        return object;
    };

    /**
     * Converts this GPSConfig to JSON.
     * @function toJSON
     * @memberof GPSConfig
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    GPSConfig.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for GPSConfig
     * @function getTypeUrl
     * @memberof GPSConfig
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    GPSConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/GPSConfig";
    };

    return GPSConfig;
})();

/**
 * RadioRegion enum.
 * @exports RadioRegion
 * @enum {number}
 * @property {number} REGION_US915=0 REGION_US915 value
 * @property {number} REGION_AU915=1 REGION_AU915 value
 * @property {number} REGION_EU868=2 REGION_EU868 value
 */
$root.RadioRegion = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "REGION_US915"] = 0;
    values[valuesById[1] = "REGION_AU915"] = 1;
    values[valuesById[2] = "REGION_EU868"] = 2;
    return values;
})();

/**
 * RadioAuth enum.
 * @exports RadioAuth
 * @enum {number}
 * @property {number} AUTH_OTAA=0 AUTH_OTAA value
 * @property {number} AUTH_ABP=1 AUTH_ABP value
 */
$root.RadioAuth = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "AUTH_OTAA"] = 0;
    values[valuesById[1] = "AUTH_ABP"] = 1;
    return values;
})();

$root.RadioOTAA = (function() {

    /**
     * Properties of a RadioOTAA.
     * @exports IRadioOTAA
     * @interface IRadioOTAA
     * @property {Uint8Array|null} [devEui] RadioOTAA devEui
     * @property {Uint8Array|null} [joinEui] RadioOTAA joinEui
     * @property {Uint8Array|null} [appKey] RadioOTAA appKey
     * @property {Uint8Array|null} [nwkKey] RadioOTAA nwkKey
     */

    /**
     * Constructs a new RadioOTAA.
     * @exports RadioOTAA
     * @classdesc Represents a RadioOTAA.
     * @implements IRadioOTAA
     * @constructor
     * @param {IRadioOTAA=} [properties] Properties to set
     */
    function RadioOTAA(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * RadioOTAA devEui.
     * @member {Uint8Array} devEui
     * @memberof RadioOTAA
     * @instance
     */
    RadioOTAA.prototype.devEui = $util.newBuffer([]);

    /**
     * RadioOTAA joinEui.
     * @member {Uint8Array} joinEui
     * @memberof RadioOTAA
     * @instance
     */
    RadioOTAA.prototype.joinEui = $util.newBuffer([]);

    /**
     * RadioOTAA appKey.
     * @member {Uint8Array} appKey
     * @memberof RadioOTAA
     * @instance
     */
    RadioOTAA.prototype.appKey = $util.newBuffer([]);

    /**
     * RadioOTAA nwkKey.
     * @member {Uint8Array} nwkKey
     * @memberof RadioOTAA
     * @instance
     */
    RadioOTAA.prototype.nwkKey = $util.newBuffer([]);

    /**
     * Creates a new RadioOTAA instance using the specified properties.
     * @function create
     * @memberof RadioOTAA
     * @static
     * @param {IRadioOTAA=} [properties] Properties to set
     * @returns {RadioOTAA} RadioOTAA instance
     */
    RadioOTAA.create = function create(properties) {
        return new RadioOTAA(properties);
    };

    /**
     * Encodes the specified RadioOTAA message. Does not implicitly {@link RadioOTAA.verify|verify} messages.
     * @function encode
     * @memberof RadioOTAA
     * @static
     * @param {IRadioOTAA} message RadioOTAA message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RadioOTAA.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.devEui != null && Object.hasOwnProperty.call(message, "devEui"))
            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.devEui);
        if (message.joinEui != null && Object.hasOwnProperty.call(message, "joinEui"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.joinEui);
        if (message.appKey != null && Object.hasOwnProperty.call(message, "appKey"))
            writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.appKey);
        if (message.nwkKey != null && Object.hasOwnProperty.call(message, "nwkKey"))
            writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.nwkKey);
        return writer;
    };

    /**
     * Encodes the specified RadioOTAA message, length delimited. Does not implicitly {@link RadioOTAA.verify|verify} messages.
     * @function encodeDelimited
     * @memberof RadioOTAA
     * @static
     * @param {IRadioOTAA} message RadioOTAA message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RadioOTAA.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RadioOTAA message from the specified reader or buffer.
     * @function decode
     * @memberof RadioOTAA
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {RadioOTAA} RadioOTAA
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RadioOTAA.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.RadioOTAA();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.devEui = reader.bytes();
                    break;
                }
            case 2: {
                    message.joinEui = reader.bytes();
                    break;
                }
            case 3: {
                    message.appKey = reader.bytes();
                    break;
                }
            case 4: {
                    message.nwkKey = reader.bytes();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a RadioOTAA message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof RadioOTAA
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {RadioOTAA} RadioOTAA
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RadioOTAA.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RadioOTAA message.
     * @function verify
     * @memberof RadioOTAA
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RadioOTAA.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.devEui != null && message.hasOwnProperty("devEui"))
            if (!(message.devEui && typeof message.devEui.length === "number" || $util.isString(message.devEui)))
                return "devEui: buffer expected";
        if (message.joinEui != null && message.hasOwnProperty("joinEui"))
            if (!(message.joinEui && typeof message.joinEui.length === "number" || $util.isString(message.joinEui)))
                return "joinEui: buffer expected";
        if (message.appKey != null && message.hasOwnProperty("appKey"))
            if (!(message.appKey && typeof message.appKey.length === "number" || $util.isString(message.appKey)))
                return "appKey: buffer expected";
        if (message.nwkKey != null && message.hasOwnProperty("nwkKey"))
            if (!(message.nwkKey && typeof message.nwkKey.length === "number" || $util.isString(message.nwkKey)))
                return "nwkKey: buffer expected";
        return null;
    };

    /**
     * Creates a RadioOTAA message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof RadioOTAA
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {RadioOTAA} RadioOTAA
     */
    RadioOTAA.fromObject = function fromObject(object) {
        if (object instanceof $root.RadioOTAA)
            return object;
        var message = new $root.RadioOTAA();
        if (object.devEui != null)
            if (typeof object.devEui === "string")
                $util.base64.decode(object.devEui, message.devEui = $util.newBuffer($util.base64.length(object.devEui)), 0);
            else if (object.devEui.length >= 0)
                message.devEui = object.devEui;
        if (object.joinEui != null)
            if (typeof object.joinEui === "string")
                $util.base64.decode(object.joinEui, message.joinEui = $util.newBuffer($util.base64.length(object.joinEui)), 0);
            else if (object.joinEui.length >= 0)
                message.joinEui = object.joinEui;
        if (object.appKey != null)
            if (typeof object.appKey === "string")
                $util.base64.decode(object.appKey, message.appKey = $util.newBuffer($util.base64.length(object.appKey)), 0);
            else if (object.appKey.length >= 0)
                message.appKey = object.appKey;
        if (object.nwkKey != null)
            if (typeof object.nwkKey === "string")
                $util.base64.decode(object.nwkKey, message.nwkKey = $util.newBuffer($util.base64.length(object.nwkKey)), 0);
            else if (object.nwkKey.length >= 0)
                message.nwkKey = object.nwkKey;
        return message;
    };

    /**
     * Creates a plain object from a RadioOTAA message. Also converts values to other types if specified.
     * @function toObject
     * @memberof RadioOTAA
     * @static
     * @param {RadioOTAA} message RadioOTAA
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RadioOTAA.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            if (options.bytes === String)
                object.devEui = "";
            else {
                object.devEui = [];
                if (options.bytes !== Array)
                    object.devEui = $util.newBuffer(object.devEui);
            }
            if (options.bytes === String)
                object.joinEui = "";
            else {
                object.joinEui = [];
                if (options.bytes !== Array)
                    object.joinEui = $util.newBuffer(object.joinEui);
            }
            if (options.bytes === String)
                object.appKey = "";
            else {
                object.appKey = [];
                if (options.bytes !== Array)
                    object.appKey = $util.newBuffer(object.appKey);
            }
            if (options.bytes === String)
                object.nwkKey = "";
            else {
                object.nwkKey = [];
                if (options.bytes !== Array)
                    object.nwkKey = $util.newBuffer(object.nwkKey);
            }
        }
        if (message.devEui != null && message.hasOwnProperty("devEui"))
            object.devEui = options.bytes === String ? $util.base64.encode(message.devEui, 0, message.devEui.length) : options.bytes === Array ? Array.prototype.slice.call(message.devEui) : message.devEui;
        if (message.joinEui != null && message.hasOwnProperty("joinEui"))
            object.joinEui = options.bytes === String ? $util.base64.encode(message.joinEui, 0, message.joinEui.length) : options.bytes === Array ? Array.prototype.slice.call(message.joinEui) : message.joinEui;
        if (message.appKey != null && message.hasOwnProperty("appKey"))
            object.appKey = options.bytes === String ? $util.base64.encode(message.appKey, 0, message.appKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.appKey) : message.appKey;
        if (message.nwkKey != null && message.hasOwnProperty("nwkKey"))
            object.nwkKey = options.bytes === String ? $util.base64.encode(message.nwkKey, 0, message.nwkKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.nwkKey) : message.nwkKey;
        return object;
    };

    /**
     * Converts this RadioOTAA to JSON.
     * @function toJSON
     * @memberof RadioOTAA
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RadioOTAA.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for RadioOTAA
     * @function getTypeUrl
     * @memberof RadioOTAA
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    RadioOTAA.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/RadioOTAA";
    };

    return RadioOTAA;
})();

$root.RadioABP = (function() {

    /**
     * Properties of a RadioABP.
     * @exports IRadioABP
     * @interface IRadioABP
     * @property {Uint8Array|null} [devAddr] RadioABP devAddr
     * @property {Uint8Array|null} [nwkSKey] RadioABP nwkSKey
     * @property {Uint8Array|null} [appSKey] RadioABP appSKey
     * @property {Uint8Array|null} [fNwkSIntKey] RadioABP fNwkSIntKey
     * @property {Uint8Array|null} [sNwkSIntKey] RadioABP sNwkSIntKey
     */

    /**
     * Constructs a new RadioABP.
     * @exports RadioABP
     * @classdesc Represents a RadioABP.
     * @implements IRadioABP
     * @constructor
     * @param {IRadioABP=} [properties] Properties to set
     */
    function RadioABP(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * RadioABP devAddr.
     * @member {Uint8Array} devAddr
     * @memberof RadioABP
     * @instance
     */
    RadioABP.prototype.devAddr = $util.newBuffer([]);

    /**
     * RadioABP nwkSKey.
     * @member {Uint8Array} nwkSKey
     * @memberof RadioABP
     * @instance
     */
    RadioABP.prototype.nwkSKey = $util.newBuffer([]);

    /**
     * RadioABP appSKey.
     * @member {Uint8Array} appSKey
     * @memberof RadioABP
     * @instance
     */
    RadioABP.prototype.appSKey = $util.newBuffer([]);

    /**
     * RadioABP fNwkSIntKey.
     * @member {Uint8Array} fNwkSIntKey
     * @memberof RadioABP
     * @instance
     */
    RadioABP.prototype.fNwkSIntKey = $util.newBuffer([]);

    /**
     * RadioABP sNwkSIntKey.
     * @member {Uint8Array} sNwkSIntKey
     * @memberof RadioABP
     * @instance
     */
    RadioABP.prototype.sNwkSIntKey = $util.newBuffer([]);

    /**
     * Creates a new RadioABP instance using the specified properties.
     * @function create
     * @memberof RadioABP
     * @static
     * @param {IRadioABP=} [properties] Properties to set
     * @returns {RadioABP} RadioABP instance
     */
    RadioABP.create = function create(properties) {
        return new RadioABP(properties);
    };

    /**
     * Encodes the specified RadioABP message. Does not implicitly {@link RadioABP.verify|verify} messages.
     * @function encode
     * @memberof RadioABP
     * @static
     * @param {IRadioABP} message RadioABP message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RadioABP.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.devAddr != null && Object.hasOwnProperty.call(message, "devAddr"))
            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.devAddr);
        if (message.nwkSKey != null && Object.hasOwnProperty.call(message, "nwkSKey"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.nwkSKey);
        if (message.appSKey != null && Object.hasOwnProperty.call(message, "appSKey"))
            writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.appSKey);
        if (message.fNwkSIntKey != null && Object.hasOwnProperty.call(message, "fNwkSIntKey"))
            writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.fNwkSIntKey);
        if (message.sNwkSIntKey != null && Object.hasOwnProperty.call(message, "sNwkSIntKey"))
            writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.sNwkSIntKey);
        return writer;
    };

    /**
     * Encodes the specified RadioABP message, length delimited. Does not implicitly {@link RadioABP.verify|verify} messages.
     * @function encodeDelimited
     * @memberof RadioABP
     * @static
     * @param {IRadioABP} message RadioABP message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RadioABP.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RadioABP message from the specified reader or buffer.
     * @function decode
     * @memberof RadioABP
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {RadioABP} RadioABP
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RadioABP.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.RadioABP();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.devAddr = reader.bytes();
                    break;
                }
            case 2: {
                    message.nwkSKey = reader.bytes();
                    break;
                }
            case 3: {
                    message.appSKey = reader.bytes();
                    break;
                }
            case 4: {
                    message.fNwkSIntKey = reader.bytes();
                    break;
                }
            case 5: {
                    message.sNwkSIntKey = reader.bytes();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a RadioABP message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof RadioABP
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {RadioABP} RadioABP
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RadioABP.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RadioABP message.
     * @function verify
     * @memberof RadioABP
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RadioABP.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.devAddr != null && message.hasOwnProperty("devAddr"))
            if (!(message.devAddr && typeof message.devAddr.length === "number" || $util.isString(message.devAddr)))
                return "devAddr: buffer expected";
        if (message.nwkSKey != null && message.hasOwnProperty("nwkSKey"))
            if (!(message.nwkSKey && typeof message.nwkSKey.length === "number" || $util.isString(message.nwkSKey)))
                return "nwkSKey: buffer expected";
        if (message.appSKey != null && message.hasOwnProperty("appSKey"))
            if (!(message.appSKey && typeof message.appSKey.length === "number" || $util.isString(message.appSKey)))
                return "appSKey: buffer expected";
        if (message.fNwkSIntKey != null && message.hasOwnProperty("fNwkSIntKey"))
            if (!(message.fNwkSIntKey && typeof message.fNwkSIntKey.length === "number" || $util.isString(message.fNwkSIntKey)))
                return "fNwkSIntKey: buffer expected";
        if (message.sNwkSIntKey != null && message.hasOwnProperty("sNwkSIntKey"))
            if (!(message.sNwkSIntKey && typeof message.sNwkSIntKey.length === "number" || $util.isString(message.sNwkSIntKey)))
                return "sNwkSIntKey: buffer expected";
        return null;
    };

    /**
     * Creates a RadioABP message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof RadioABP
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {RadioABP} RadioABP
     */
    RadioABP.fromObject = function fromObject(object) {
        if (object instanceof $root.RadioABP)
            return object;
        var message = new $root.RadioABP();
        if (object.devAddr != null)
            if (typeof object.devAddr === "string")
                $util.base64.decode(object.devAddr, message.devAddr = $util.newBuffer($util.base64.length(object.devAddr)), 0);
            else if (object.devAddr.length >= 0)
                message.devAddr = object.devAddr;
        if (object.nwkSKey != null)
            if (typeof object.nwkSKey === "string")
                $util.base64.decode(object.nwkSKey, message.nwkSKey = $util.newBuffer($util.base64.length(object.nwkSKey)), 0);
            else if (object.nwkSKey.length >= 0)
                message.nwkSKey = object.nwkSKey;
        if (object.appSKey != null)
            if (typeof object.appSKey === "string")
                $util.base64.decode(object.appSKey, message.appSKey = $util.newBuffer($util.base64.length(object.appSKey)), 0);
            else if (object.appSKey.length >= 0)
                message.appSKey = object.appSKey;
        if (object.fNwkSIntKey != null)
            if (typeof object.fNwkSIntKey === "string")
                $util.base64.decode(object.fNwkSIntKey, message.fNwkSIntKey = $util.newBuffer($util.base64.length(object.fNwkSIntKey)), 0);
            else if (object.fNwkSIntKey.length >= 0)
                message.fNwkSIntKey = object.fNwkSIntKey;
        if (object.sNwkSIntKey != null)
            if (typeof object.sNwkSIntKey === "string")
                $util.base64.decode(object.sNwkSIntKey, message.sNwkSIntKey = $util.newBuffer($util.base64.length(object.sNwkSIntKey)), 0);
            else if (object.sNwkSIntKey.length >= 0)
                message.sNwkSIntKey = object.sNwkSIntKey;
        return message;
    };

    /**
     * Creates a plain object from a RadioABP message. Also converts values to other types if specified.
     * @function toObject
     * @memberof RadioABP
     * @static
     * @param {RadioABP} message RadioABP
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RadioABP.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            if (options.bytes === String)
                object.devAddr = "";
            else {
                object.devAddr = [];
                if (options.bytes !== Array)
                    object.devAddr = $util.newBuffer(object.devAddr);
            }
            if (options.bytes === String)
                object.nwkSKey = "";
            else {
                object.nwkSKey = [];
                if (options.bytes !== Array)
                    object.nwkSKey = $util.newBuffer(object.nwkSKey);
            }
            if (options.bytes === String)
                object.appSKey = "";
            else {
                object.appSKey = [];
                if (options.bytes !== Array)
                    object.appSKey = $util.newBuffer(object.appSKey);
            }
            if (options.bytes === String)
                object.fNwkSIntKey = "";
            else {
                object.fNwkSIntKey = [];
                if (options.bytes !== Array)
                    object.fNwkSIntKey = $util.newBuffer(object.fNwkSIntKey);
            }
            if (options.bytes === String)
                object.sNwkSIntKey = "";
            else {
                object.sNwkSIntKey = [];
                if (options.bytes !== Array)
                    object.sNwkSIntKey = $util.newBuffer(object.sNwkSIntKey);
            }
        }
        if (message.devAddr != null && message.hasOwnProperty("devAddr"))
            object.devAddr = options.bytes === String ? $util.base64.encode(message.devAddr, 0, message.devAddr.length) : options.bytes === Array ? Array.prototype.slice.call(message.devAddr) : message.devAddr;
        if (message.nwkSKey != null && message.hasOwnProperty("nwkSKey"))
            object.nwkSKey = options.bytes === String ? $util.base64.encode(message.nwkSKey, 0, message.nwkSKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.nwkSKey) : message.nwkSKey;
        if (message.appSKey != null && message.hasOwnProperty("appSKey"))
            object.appSKey = options.bytes === String ? $util.base64.encode(message.appSKey, 0, message.appSKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.appSKey) : message.appSKey;
        if (message.fNwkSIntKey != null && message.hasOwnProperty("fNwkSIntKey"))
            object.fNwkSIntKey = options.bytes === String ? $util.base64.encode(message.fNwkSIntKey, 0, message.fNwkSIntKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.fNwkSIntKey) : message.fNwkSIntKey;
        if (message.sNwkSIntKey != null && message.hasOwnProperty("sNwkSIntKey"))
            object.sNwkSIntKey = options.bytes === String ? $util.base64.encode(message.sNwkSIntKey, 0, message.sNwkSIntKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.sNwkSIntKey) : message.sNwkSIntKey;
        return object;
    };

    /**
     * Converts this RadioABP to JSON.
     * @function toJSON
     * @memberof RadioABP
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RadioABP.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for RadioABP
     * @function getTypeUrl
     * @memberof RadioABP
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    RadioABP.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/RadioABP";
    };

    return RadioABP;
})();

/**
 * RadioSpreadingFactor enum.
 * @exports RadioSpreadingFactor
 * @enum {number}
 * @property {number} SF7=0 SF7 value
 * @property {number} SF8=1 SF8 value
 * @property {number} SF9=2 SF9 value
 * @property {number} SF10=3 SF10 value
 * @property {number} SF11=4 SF11 value
 * @property {number} SF12=5 SF12 value
 */
$root.RadioSpreadingFactor = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "SF7"] = 0;
    values[valuesById[1] = "SF8"] = 1;
    values[valuesById[2] = "SF9"] = 2;
    values[valuesById[3] = "SF10"] = 3;
    values[valuesById[4] = "SF11"] = 4;
    values[valuesById[5] = "SF12"] = 5;
    return values;
})();

/**
 * RadioBandwidth enum.
 * @exports RadioBandwidth
 * @enum {number}
 * @property {number} bw_125=0 bw_125 value
 * @property {number} bw_250=1 bw_250 value
 * @property {number} bw_500=2 bw_500 value
 */
$root.RadioBandwidth = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "bw_125"] = 0;
    values[valuesById[1] = "bw_250"] = 1;
    values[valuesById[2] = "bw_500"] = 2;
    return values;
})();

/**
 * RadioCodingRate enum.
 * @exports RadioCodingRate
 * @enum {number}
 * @property {number} cr_4_5=0 cr_4_5 value
 * @property {number} cr_4_6=1 cr_4_6 value
 * @property {number} cr_4_7=2 cr_4_7 value
 * @property {number} cr_4_8=3 cr_4_8 value
 */
$root.RadioCodingRate = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "cr_4_5"] = 0;
    values[valuesById[1] = "cr_4_6"] = 1;
    values[valuesById[2] = "cr_4_7"] = 2;
    values[valuesById[3] = "cr_4_8"] = 3;
    return values;
})();

$root.LoRaWANConfig = (function() {

    /**
     * Properties of a LoRaWANConfig.
     * @exports ILoRaWANConfig
     * @interface ILoRaWANConfig
     * @property {RadioRegion|null} [region] LoRaWANConfig region
     * @property {RadioAuth|null} [auth] LoRaWANConfig auth
     * @property {IRadioOTAA|null} [otaa] LoRaWANConfig otaa
     * @property {IRadioABP|null} [abp] LoRaWANConfig abp
     * @property {number|null} [transmitIntervalMin] LoRaWANConfig transmitIntervalMin
     * @property {boolean|null} [txOnlyOnNewGpsFix] LoRaWANConfig txOnlyOnNewGpsFix
     * @property {number|null} [txPowerDbm] LoRaWANConfig txPowerDbm
     */

    /**
     * Constructs a new LoRaWANConfig.
     * @exports LoRaWANConfig
     * @classdesc Represents a LoRaWANConfig.
     * @implements ILoRaWANConfig
     * @constructor
     * @param {ILoRaWANConfig=} [properties] Properties to set
     */
    function LoRaWANConfig(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * LoRaWANConfig region.
     * @member {RadioRegion} region
     * @memberof LoRaWANConfig
     * @instance
     */
    LoRaWANConfig.prototype.region = 0;

    /**
     * LoRaWANConfig auth.
     * @member {RadioAuth} auth
     * @memberof LoRaWANConfig
     * @instance
     */
    LoRaWANConfig.prototype.auth = 0;

    /**
     * LoRaWANConfig otaa.
     * @member {IRadioOTAA|null|undefined} otaa
     * @memberof LoRaWANConfig
     * @instance
     */
    LoRaWANConfig.prototype.otaa = null;

    /**
     * LoRaWANConfig abp.
     * @member {IRadioABP|null|undefined} abp
     * @memberof LoRaWANConfig
     * @instance
     */
    LoRaWANConfig.prototype.abp = null;

    /**
     * LoRaWANConfig transmitIntervalMin.
     * @member {number} transmitIntervalMin
     * @memberof LoRaWANConfig
     * @instance
     */
    LoRaWANConfig.prototype.transmitIntervalMin = 0;

    /**
     * LoRaWANConfig txOnlyOnNewGpsFix.
     * @member {boolean} txOnlyOnNewGpsFix
     * @memberof LoRaWANConfig
     * @instance
     */
    LoRaWANConfig.prototype.txOnlyOnNewGpsFix = false;

    /**
     * LoRaWANConfig txPowerDbm.
     * @member {number} txPowerDbm
     * @memberof LoRaWANConfig
     * @instance
     */
    LoRaWANConfig.prototype.txPowerDbm = 0;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * LoRaWANConfig credentials.
     * @member {"otaa"|"abp"|undefined} credentials
     * @memberof LoRaWANConfig
     * @instance
     */
    Object.defineProperty(LoRaWANConfig.prototype, "credentials", {
        get: $util.oneOfGetter($oneOfFields = ["otaa", "abp"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new LoRaWANConfig instance using the specified properties.
     * @function create
     * @memberof LoRaWANConfig
     * @static
     * @param {ILoRaWANConfig=} [properties] Properties to set
     * @returns {LoRaWANConfig} LoRaWANConfig instance
     */
    LoRaWANConfig.create = function create(properties) {
        return new LoRaWANConfig(properties);
    };

    /**
     * Encodes the specified LoRaWANConfig message. Does not implicitly {@link LoRaWANConfig.verify|verify} messages.
     * @function encode
     * @memberof LoRaWANConfig
     * @static
     * @param {ILoRaWANConfig} message LoRaWANConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LoRaWANConfig.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.region != null && Object.hasOwnProperty.call(message, "region"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.region);
        if (message.auth != null && Object.hasOwnProperty.call(message, "auth"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.auth);
        if (message.otaa != null && Object.hasOwnProperty.call(message, "otaa"))
            $root.RadioOTAA.encode(message.otaa, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.abp != null && Object.hasOwnProperty.call(message, "abp"))
            $root.RadioABP.encode(message.abp, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.transmitIntervalMin != null && Object.hasOwnProperty.call(message, "transmitIntervalMin"))
            writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.transmitIntervalMin);
        if (message.txOnlyOnNewGpsFix != null && Object.hasOwnProperty.call(message, "txOnlyOnNewGpsFix"))
            writer.uint32(/* id 6, wireType 0 =*/48).bool(message.txOnlyOnNewGpsFix);
        if (message.txPowerDbm != null && Object.hasOwnProperty.call(message, "txPowerDbm"))
            writer.uint32(/* id 7, wireType 0 =*/56).int32(message.txPowerDbm);
        return writer;
    };

    /**
     * Encodes the specified LoRaWANConfig message, length delimited. Does not implicitly {@link LoRaWANConfig.verify|verify} messages.
     * @function encodeDelimited
     * @memberof LoRaWANConfig
     * @static
     * @param {ILoRaWANConfig} message LoRaWANConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LoRaWANConfig.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a LoRaWANConfig message from the specified reader or buffer.
     * @function decode
     * @memberof LoRaWANConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {LoRaWANConfig} LoRaWANConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LoRaWANConfig.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.LoRaWANConfig();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.region = reader.int32();
                    break;
                }
            case 2: {
                    message.auth = reader.int32();
                    break;
                }
            case 3: {
                    message.otaa = $root.RadioOTAA.decode(reader, reader.uint32());
                    break;
                }
            case 4: {
                    message.abp = $root.RadioABP.decode(reader, reader.uint32());
                    break;
                }
            case 5: {
                    message.transmitIntervalMin = reader.uint32();
                    break;
                }
            case 6: {
                    message.txOnlyOnNewGpsFix = reader.bool();
                    break;
                }
            case 7: {
                    message.txPowerDbm = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a LoRaWANConfig message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof LoRaWANConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {LoRaWANConfig} LoRaWANConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LoRaWANConfig.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a LoRaWANConfig message.
     * @function verify
     * @memberof LoRaWANConfig
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    LoRaWANConfig.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        var properties = {};
        if (message.region != null && message.hasOwnProperty("region"))
            switch (message.region) {
            default:
                return "region: enum value expected";
            case 0:
            case 1:
            case 2:
                break;
            }
        if (message.auth != null && message.hasOwnProperty("auth"))
            switch (message.auth) {
            default:
                return "auth: enum value expected";
            case 0:
            case 1:
                break;
            }
        if (message.otaa != null && message.hasOwnProperty("otaa")) {
            properties.credentials = 1;
            {
                var error = $root.RadioOTAA.verify(message.otaa);
                if (error)
                    return "otaa." + error;
            }
        }
        if (message.abp != null && message.hasOwnProperty("abp")) {
            if (properties.credentials === 1)
                return "credentials: multiple values";
            properties.credentials = 1;
            {
                var error = $root.RadioABP.verify(message.abp);
                if (error)
                    return "abp." + error;
            }
        }
        if (message.transmitIntervalMin != null && message.hasOwnProperty("transmitIntervalMin"))
            if (!$util.isInteger(message.transmitIntervalMin))
                return "transmitIntervalMin: integer expected";
        if (message.txOnlyOnNewGpsFix != null && message.hasOwnProperty("txOnlyOnNewGpsFix"))
            if (typeof message.txOnlyOnNewGpsFix !== "boolean")
                return "txOnlyOnNewGpsFix: boolean expected";
        if (message.txPowerDbm != null && message.hasOwnProperty("txPowerDbm"))
            if (!$util.isInteger(message.txPowerDbm))
                return "txPowerDbm: integer expected";
        return null;
    };

    /**
     * Creates a LoRaWANConfig message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof LoRaWANConfig
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {LoRaWANConfig} LoRaWANConfig
     */
    LoRaWANConfig.fromObject = function fromObject(object) {
        if (object instanceof $root.LoRaWANConfig)
            return object;
        var message = new $root.LoRaWANConfig();
        switch (object.region) {
        default:
            if (typeof object.region === "number") {
                message.region = object.region;
                break;
            }
            break;
        case "REGION_US915":
        case 0:
            message.region = 0;
            break;
        case "REGION_AU915":
        case 1:
            message.region = 1;
            break;
        case "REGION_EU868":
        case 2:
            message.region = 2;
            break;
        }
        switch (object.auth) {
        default:
            if (typeof object.auth === "number") {
                message.auth = object.auth;
                break;
            }
            break;
        case "AUTH_OTAA":
        case 0:
            message.auth = 0;
            break;
        case "AUTH_ABP":
        case 1:
            message.auth = 1;
            break;
        }
        if (object.otaa != null) {
            if (typeof object.otaa !== "object")
                throw TypeError(".LoRaWANConfig.otaa: object expected");
            message.otaa = $root.RadioOTAA.fromObject(object.otaa);
        }
        if (object.abp != null) {
            if (typeof object.abp !== "object")
                throw TypeError(".LoRaWANConfig.abp: object expected");
            message.abp = $root.RadioABP.fromObject(object.abp);
        }
        if (object.transmitIntervalMin != null)
            message.transmitIntervalMin = object.transmitIntervalMin >>> 0;
        if (object.txOnlyOnNewGpsFix != null)
            message.txOnlyOnNewGpsFix = Boolean(object.txOnlyOnNewGpsFix);
        if (object.txPowerDbm != null)
            message.txPowerDbm = object.txPowerDbm | 0;
        return message;
    };

    /**
     * Creates a plain object from a LoRaWANConfig message. Also converts values to other types if specified.
     * @function toObject
     * @memberof LoRaWANConfig
     * @static
     * @param {LoRaWANConfig} message LoRaWANConfig
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    LoRaWANConfig.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.region = options.enums === String ? "REGION_US915" : 0;
            object.auth = options.enums === String ? "AUTH_OTAA" : 0;
            object.transmitIntervalMin = 0;
            object.txOnlyOnNewGpsFix = false;
            object.txPowerDbm = 0;
        }
        if (message.region != null && message.hasOwnProperty("region"))
            object.region = options.enums === String ? $root.RadioRegion[message.region] === undefined ? message.region : $root.RadioRegion[message.region] : message.region;
        if (message.auth != null && message.hasOwnProperty("auth"))
            object.auth = options.enums === String ? $root.RadioAuth[message.auth] === undefined ? message.auth : $root.RadioAuth[message.auth] : message.auth;
        if (message.otaa != null && message.hasOwnProperty("otaa")) {
            object.otaa = $root.RadioOTAA.toObject(message.otaa, options);
            if (options.oneofs)
                object.credentials = "otaa";
        }
        if (message.abp != null && message.hasOwnProperty("abp")) {
            object.abp = $root.RadioABP.toObject(message.abp, options);
            if (options.oneofs)
                object.credentials = "abp";
        }
        if (message.transmitIntervalMin != null && message.hasOwnProperty("transmitIntervalMin"))
            object.transmitIntervalMin = message.transmitIntervalMin;
        if (message.txOnlyOnNewGpsFix != null && message.hasOwnProperty("txOnlyOnNewGpsFix"))
            object.txOnlyOnNewGpsFix = message.txOnlyOnNewGpsFix;
        if (message.txPowerDbm != null && message.hasOwnProperty("txPowerDbm"))
            object.txPowerDbm = message.txPowerDbm;
        return object;
    };

    /**
     * Converts this LoRaWANConfig to JSON.
     * @function toJSON
     * @memberof LoRaWANConfig
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    LoRaWANConfig.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for LoRaWANConfig
     * @function getTypeUrl
     * @memberof LoRaWANConfig
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    LoRaWANConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/LoRaWANConfig";
    };

    return LoRaWANConfig;
})();

$root.LoRaConfig = (function() {

    /**
     * Properties of a LoRaConfig.
     * @exports ILoRaConfig
     * @interface ILoRaConfig
     * @property {RadioSpreadingFactor|null} [radioSpreadingFactor] LoRaConfig radioSpreadingFactor
     * @property {RadioBandwidth|null} [radioBandwidth] LoRaConfig radioBandwidth
     * @property {RadioCodingRate|null} [radioCodingRate] LoRaConfig radioCodingRate
     * @property {number|null} [txPowerDbm] LoRaConfig txPowerDbm
     * @property {number|null} [syncWord] LoRaConfig syncWord
     */

    /**
     * Constructs a new LoRaConfig.
     * @exports LoRaConfig
     * @classdesc Represents a LoRaConfig.
     * @implements ILoRaConfig
     * @constructor
     * @param {ILoRaConfig=} [properties] Properties to set
     */
    function LoRaConfig(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * LoRaConfig radioSpreadingFactor.
     * @member {RadioSpreadingFactor} radioSpreadingFactor
     * @memberof LoRaConfig
     * @instance
     */
    LoRaConfig.prototype.radioSpreadingFactor = 0;

    /**
     * LoRaConfig radioBandwidth.
     * @member {RadioBandwidth} radioBandwidth
     * @memberof LoRaConfig
     * @instance
     */
    LoRaConfig.prototype.radioBandwidth = 0;

    /**
     * LoRaConfig radioCodingRate.
     * @member {RadioCodingRate} radioCodingRate
     * @memberof LoRaConfig
     * @instance
     */
    LoRaConfig.prototype.radioCodingRate = 0;

    /**
     * LoRaConfig txPowerDbm.
     * @member {number} txPowerDbm
     * @memberof LoRaConfig
     * @instance
     */
    LoRaConfig.prototype.txPowerDbm = 0;

    /**
     * LoRaConfig syncWord.
     * @member {number} syncWord
     * @memberof LoRaConfig
     * @instance
     */
    LoRaConfig.prototype.syncWord = 0;

    /**
     * Creates a new LoRaConfig instance using the specified properties.
     * @function create
     * @memberof LoRaConfig
     * @static
     * @param {ILoRaConfig=} [properties] Properties to set
     * @returns {LoRaConfig} LoRaConfig instance
     */
    LoRaConfig.create = function create(properties) {
        return new LoRaConfig(properties);
    };

    /**
     * Encodes the specified LoRaConfig message. Does not implicitly {@link LoRaConfig.verify|verify} messages.
     * @function encode
     * @memberof LoRaConfig
     * @static
     * @param {ILoRaConfig} message LoRaConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LoRaConfig.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.radioSpreadingFactor != null && Object.hasOwnProperty.call(message, "radioSpreadingFactor"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.radioSpreadingFactor);
        if (message.radioBandwidth != null && Object.hasOwnProperty.call(message, "radioBandwidth"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.radioBandwidth);
        if (message.radioCodingRate != null && Object.hasOwnProperty.call(message, "radioCodingRate"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.radioCodingRate);
        if (message.txPowerDbm != null && Object.hasOwnProperty.call(message, "txPowerDbm"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.txPowerDbm);
        if (message.syncWord != null && Object.hasOwnProperty.call(message, "syncWord"))
            writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.syncWord);
        return writer;
    };

    /**
     * Encodes the specified LoRaConfig message, length delimited. Does not implicitly {@link LoRaConfig.verify|verify} messages.
     * @function encodeDelimited
     * @memberof LoRaConfig
     * @static
     * @param {ILoRaConfig} message LoRaConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LoRaConfig.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a LoRaConfig message from the specified reader or buffer.
     * @function decode
     * @memberof LoRaConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {LoRaConfig} LoRaConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LoRaConfig.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.LoRaConfig();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.radioSpreadingFactor = reader.int32();
                    break;
                }
            case 2: {
                    message.radioBandwidth = reader.int32();
                    break;
                }
            case 3: {
                    message.radioCodingRate = reader.int32();
                    break;
                }
            case 4: {
                    message.txPowerDbm = reader.int32();
                    break;
                }
            case 5: {
                    message.syncWord = reader.uint32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a LoRaConfig message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof LoRaConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {LoRaConfig} LoRaConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LoRaConfig.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a LoRaConfig message.
     * @function verify
     * @memberof LoRaConfig
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    LoRaConfig.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.radioSpreadingFactor != null && message.hasOwnProperty("radioSpreadingFactor"))
            switch (message.radioSpreadingFactor) {
            default:
                return "radioSpreadingFactor: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                break;
            }
        if (message.radioBandwidth != null && message.hasOwnProperty("radioBandwidth"))
            switch (message.radioBandwidth) {
            default:
                return "radioBandwidth: enum value expected";
            case 0:
            case 1:
            case 2:
                break;
            }
        if (message.radioCodingRate != null && message.hasOwnProperty("radioCodingRate"))
            switch (message.radioCodingRate) {
            default:
                return "radioCodingRate: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
                break;
            }
        if (message.txPowerDbm != null && message.hasOwnProperty("txPowerDbm"))
            if (!$util.isInteger(message.txPowerDbm))
                return "txPowerDbm: integer expected";
        if (message.syncWord != null && message.hasOwnProperty("syncWord"))
            if (!$util.isInteger(message.syncWord))
                return "syncWord: integer expected";
        return null;
    };

    /**
     * Creates a LoRaConfig message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof LoRaConfig
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {LoRaConfig} LoRaConfig
     */
    LoRaConfig.fromObject = function fromObject(object) {
        if (object instanceof $root.LoRaConfig)
            return object;
        var message = new $root.LoRaConfig();
        switch (object.radioSpreadingFactor) {
        default:
            if (typeof object.radioSpreadingFactor === "number") {
                message.radioSpreadingFactor = object.radioSpreadingFactor;
                break;
            }
            break;
        case "SF7":
        case 0:
            message.radioSpreadingFactor = 0;
            break;
        case "SF8":
        case 1:
            message.radioSpreadingFactor = 1;
            break;
        case "SF9":
        case 2:
            message.radioSpreadingFactor = 2;
            break;
        case "SF10":
        case 3:
            message.radioSpreadingFactor = 3;
            break;
        case "SF11":
        case 4:
            message.radioSpreadingFactor = 4;
            break;
        case "SF12":
        case 5:
            message.radioSpreadingFactor = 5;
            break;
        }
        switch (object.radioBandwidth) {
        default:
            if (typeof object.radioBandwidth === "number") {
                message.radioBandwidth = object.radioBandwidth;
                break;
            }
            break;
        case "bw_125":
        case 0:
            message.radioBandwidth = 0;
            break;
        case "bw_250":
        case 1:
            message.radioBandwidth = 1;
            break;
        case "bw_500":
        case 2:
            message.radioBandwidth = 2;
            break;
        }
        switch (object.radioCodingRate) {
        default:
            if (typeof object.radioCodingRate === "number") {
                message.radioCodingRate = object.radioCodingRate;
                break;
            }
            break;
        case "cr_4_5":
        case 0:
            message.radioCodingRate = 0;
            break;
        case "cr_4_6":
        case 1:
            message.radioCodingRate = 1;
            break;
        case "cr_4_7":
        case 2:
            message.radioCodingRate = 2;
            break;
        case "cr_4_8":
        case 3:
            message.radioCodingRate = 3;
            break;
        }
        if (object.txPowerDbm != null)
            message.txPowerDbm = object.txPowerDbm | 0;
        if (object.syncWord != null)
            message.syncWord = object.syncWord >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a LoRaConfig message. Also converts values to other types if specified.
     * @function toObject
     * @memberof LoRaConfig
     * @static
     * @param {LoRaConfig} message LoRaConfig
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    LoRaConfig.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.radioSpreadingFactor = options.enums === String ? "SF7" : 0;
            object.radioBandwidth = options.enums === String ? "bw_125" : 0;
            object.radioCodingRate = options.enums === String ? "cr_4_5" : 0;
            object.txPowerDbm = 0;
            object.syncWord = 0;
        }
        if (message.radioSpreadingFactor != null && message.hasOwnProperty("radioSpreadingFactor"))
            object.radioSpreadingFactor = options.enums === String ? $root.RadioSpreadingFactor[message.radioSpreadingFactor] === undefined ? message.radioSpreadingFactor : $root.RadioSpreadingFactor[message.radioSpreadingFactor] : message.radioSpreadingFactor;
        if (message.radioBandwidth != null && message.hasOwnProperty("radioBandwidth"))
            object.radioBandwidth = options.enums === String ? $root.RadioBandwidth[message.radioBandwidth] === undefined ? message.radioBandwidth : $root.RadioBandwidth[message.radioBandwidth] : message.radioBandwidth;
        if (message.radioCodingRate != null && message.hasOwnProperty("radioCodingRate"))
            object.radioCodingRate = options.enums === String ? $root.RadioCodingRate[message.radioCodingRate] === undefined ? message.radioCodingRate : $root.RadioCodingRate[message.radioCodingRate] : message.radioCodingRate;
        if (message.txPowerDbm != null && message.hasOwnProperty("txPowerDbm"))
            object.txPowerDbm = message.txPowerDbm;
        if (message.syncWord != null && message.hasOwnProperty("syncWord"))
            object.syncWord = message.syncWord;
        return object;
    };

    /**
     * Converts this LoRaConfig to JSON.
     * @function toJSON
     * @memberof LoRaConfig
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    LoRaConfig.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for LoRaConfig
     * @function getTypeUrl
     * @memberof LoRaConfig
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    LoRaConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/LoRaConfig";
    };

    return LoRaConfig;
})();

$root.LostMode_config = (function() {

    /**
     * Properties of a LostMode_config.
     * @exports ILostMode_config
     * @interface ILostMode_config
     * @property {number|null} [activationEpoch] LostMode_config activationEpoch
     * @property {number|null} [transmitIntervalMin] LostMode_config transmitIntervalMin
     * @property {number|null} [txPowerDbm] LostMode_config txPowerDbm
     */

    /**
     * Constructs a new LostMode_config.
     * @exports LostMode_config
     * @classdesc Represents a LostMode_config.
     * @implements ILostMode_config
     * @constructor
     * @param {ILostMode_config=} [properties] Properties to set
     */
    function LostMode_config(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * LostMode_config activationEpoch.
     * @member {number} activationEpoch
     * @memberof LostMode_config
     * @instance
     */
    LostMode_config.prototype.activationEpoch = 0;

    /**
     * LostMode_config transmitIntervalMin.
     * @member {number} transmitIntervalMin
     * @memberof LostMode_config
     * @instance
     */
    LostMode_config.prototype.transmitIntervalMin = 0;

    /**
     * LostMode_config txPowerDbm.
     * @member {number} txPowerDbm
     * @memberof LostMode_config
     * @instance
     */
    LostMode_config.prototype.txPowerDbm = 0;

    /**
     * Creates a new LostMode_config instance using the specified properties.
     * @function create
     * @memberof LostMode_config
     * @static
     * @param {ILostMode_config=} [properties] Properties to set
     * @returns {LostMode_config} LostMode_config instance
     */
    LostMode_config.create = function create(properties) {
        return new LostMode_config(properties);
    };

    /**
     * Encodes the specified LostMode_config message. Does not implicitly {@link LostMode_config.verify|verify} messages.
     * @function encode
     * @memberof LostMode_config
     * @static
     * @param {ILostMode_config} message LostMode_config message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LostMode_config.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.activationEpoch != null && Object.hasOwnProperty.call(message, "activationEpoch"))
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.activationEpoch);
        if (message.transmitIntervalMin != null && Object.hasOwnProperty.call(message, "transmitIntervalMin"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.transmitIntervalMin);
        if (message.txPowerDbm != null && Object.hasOwnProperty.call(message, "txPowerDbm"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.txPowerDbm);
        return writer;
    };

    /**
     * Encodes the specified LostMode_config message, length delimited. Does not implicitly {@link LostMode_config.verify|verify} messages.
     * @function encodeDelimited
     * @memberof LostMode_config
     * @static
     * @param {ILostMode_config} message LostMode_config message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LostMode_config.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a LostMode_config message from the specified reader or buffer.
     * @function decode
     * @memberof LostMode_config
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {LostMode_config} LostMode_config
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LostMode_config.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.LostMode_config();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.activationEpoch = reader.uint32();
                    break;
                }
            case 2: {
                    message.transmitIntervalMin = reader.uint32();
                    break;
                }
            case 3: {
                    message.txPowerDbm = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a LostMode_config message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof LostMode_config
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {LostMode_config} LostMode_config
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LostMode_config.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a LostMode_config message.
     * @function verify
     * @memberof LostMode_config
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    LostMode_config.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.activationEpoch != null && message.hasOwnProperty("activationEpoch"))
            if (!$util.isInteger(message.activationEpoch))
                return "activationEpoch: integer expected";
        if (message.transmitIntervalMin != null && message.hasOwnProperty("transmitIntervalMin"))
            if (!$util.isInteger(message.transmitIntervalMin))
                return "transmitIntervalMin: integer expected";
        if (message.txPowerDbm != null && message.hasOwnProperty("txPowerDbm"))
            if (!$util.isInteger(message.txPowerDbm))
                return "txPowerDbm: integer expected";
        return null;
    };

    /**
     * Creates a LostMode_config message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof LostMode_config
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {LostMode_config} LostMode_config
     */
    LostMode_config.fromObject = function fromObject(object) {
        if (object instanceof $root.LostMode_config)
            return object;
        var message = new $root.LostMode_config();
        if (object.activationEpoch != null)
            message.activationEpoch = object.activationEpoch >>> 0;
        if (object.transmitIntervalMin != null)
            message.transmitIntervalMin = object.transmitIntervalMin >>> 0;
        if (object.txPowerDbm != null)
            message.txPowerDbm = object.txPowerDbm | 0;
        return message;
    };

    /**
     * Creates a plain object from a LostMode_config message. Also converts values to other types if specified.
     * @function toObject
     * @memberof LostMode_config
     * @static
     * @param {LostMode_config} message LostMode_config
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    LostMode_config.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.activationEpoch = 0;
            object.transmitIntervalMin = 0;
            object.txPowerDbm = 0;
        }
        if (message.activationEpoch != null && message.hasOwnProperty("activationEpoch"))
            object.activationEpoch = message.activationEpoch;
        if (message.transmitIntervalMin != null && message.hasOwnProperty("transmitIntervalMin"))
            object.transmitIntervalMin = message.transmitIntervalMin;
        if (message.txPowerDbm != null && message.hasOwnProperty("txPowerDbm"))
            object.txPowerDbm = message.txPowerDbm;
        return object;
    };

    /**
     * Converts this LostMode_config to JSON.
     * @function toJSON
     * @memberof LostMode_config
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    LostMode_config.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for LostMode_config
     * @function getTypeUrl
     * @memberof LostMode_config
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    LostMode_config.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/LostMode_config";
    };

    return LostMode_config;
})();

$root.RadioConfigPacket = (function() {

    /**
     * Properties of a RadioConfigPacket.
     * @exports IRadioConfigPacket
     * @interface IRadioConfigPacket
     * @property {ILoRaWANConfig|null} [loRaWANConfig] RadioConfigPacket loRaWANConfig
     * @property {ILoRaConfig|null} [loRaConfig] RadioConfigPacket loRaConfig
     * @property {boolean|null} [lostModeEnabled] RadioConfigPacket lostModeEnabled
     * @property {ILostMode_config|null} [lostModeConfig] RadioConfigPacket lostModeConfig
     */

    /**
     * Constructs a new RadioConfigPacket.
     * @exports RadioConfigPacket
     * @classdesc Represents a RadioConfigPacket.
     * @implements IRadioConfigPacket
     * @constructor
     * @param {IRadioConfigPacket=} [properties] Properties to set
     */
    function RadioConfigPacket(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * RadioConfigPacket loRaWANConfig.
     * @member {ILoRaWANConfig|null|undefined} loRaWANConfig
     * @memberof RadioConfigPacket
     * @instance
     */
    RadioConfigPacket.prototype.loRaWANConfig = null;

    /**
     * RadioConfigPacket loRaConfig.
     * @member {ILoRaConfig|null|undefined} loRaConfig
     * @memberof RadioConfigPacket
     * @instance
     */
    RadioConfigPacket.prototype.loRaConfig = null;

    /**
     * RadioConfigPacket lostModeEnabled.
     * @member {boolean} lostModeEnabled
     * @memberof RadioConfigPacket
     * @instance
     */
    RadioConfigPacket.prototype.lostModeEnabled = false;

    /**
     * RadioConfigPacket lostModeConfig.
     * @member {ILostMode_config|null|undefined} lostModeConfig
     * @memberof RadioConfigPacket
     * @instance
     */
    RadioConfigPacket.prototype.lostModeConfig = null;

    /**
     * Creates a new RadioConfigPacket instance using the specified properties.
     * @function create
     * @memberof RadioConfigPacket
     * @static
     * @param {IRadioConfigPacket=} [properties] Properties to set
     * @returns {RadioConfigPacket} RadioConfigPacket instance
     */
    RadioConfigPacket.create = function create(properties) {
        return new RadioConfigPacket(properties);
    };

    /**
     * Encodes the specified RadioConfigPacket message. Does not implicitly {@link RadioConfigPacket.verify|verify} messages.
     * @function encode
     * @memberof RadioConfigPacket
     * @static
     * @param {IRadioConfigPacket} message RadioConfigPacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RadioConfigPacket.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.loRaWANConfig != null && Object.hasOwnProperty.call(message, "loRaWANConfig"))
            $root.LoRaWANConfig.encode(message.loRaWANConfig, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.loRaConfig != null && Object.hasOwnProperty.call(message, "loRaConfig"))
            $root.LoRaConfig.encode(message.loRaConfig, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.lostModeEnabled != null && Object.hasOwnProperty.call(message, "lostModeEnabled"))
            writer.uint32(/* id 3, wireType 0 =*/24).bool(message.lostModeEnabled);
        if (message.lostModeConfig != null && Object.hasOwnProperty.call(message, "lostModeConfig"))
            $root.LostMode_config.encode(message.lostModeConfig, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified RadioConfigPacket message, length delimited. Does not implicitly {@link RadioConfigPacket.verify|verify} messages.
     * @function encodeDelimited
     * @memberof RadioConfigPacket
     * @static
     * @param {IRadioConfigPacket} message RadioConfigPacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RadioConfigPacket.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RadioConfigPacket message from the specified reader or buffer.
     * @function decode
     * @memberof RadioConfigPacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {RadioConfigPacket} RadioConfigPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RadioConfigPacket.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.RadioConfigPacket();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.loRaWANConfig = $root.LoRaWANConfig.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    message.loRaConfig = $root.LoRaConfig.decode(reader, reader.uint32());
                    break;
                }
            case 3: {
                    message.lostModeEnabled = reader.bool();
                    break;
                }
            case 4: {
                    message.lostModeConfig = $root.LostMode_config.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a RadioConfigPacket message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof RadioConfigPacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {RadioConfigPacket} RadioConfigPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RadioConfigPacket.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RadioConfigPacket message.
     * @function verify
     * @memberof RadioConfigPacket
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RadioConfigPacket.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.loRaWANConfig != null && message.hasOwnProperty("loRaWANConfig")) {
            var error = $root.LoRaWANConfig.verify(message.loRaWANConfig);
            if (error)
                return "loRaWANConfig." + error;
        }
        if (message.loRaConfig != null && message.hasOwnProperty("loRaConfig")) {
            var error = $root.LoRaConfig.verify(message.loRaConfig);
            if (error)
                return "loRaConfig." + error;
        }
        if (message.lostModeEnabled != null && message.hasOwnProperty("lostModeEnabled"))
            if (typeof message.lostModeEnabled !== "boolean")
                return "lostModeEnabled: boolean expected";
        if (message.lostModeConfig != null && message.hasOwnProperty("lostModeConfig")) {
            var error = $root.LostMode_config.verify(message.lostModeConfig);
            if (error)
                return "lostModeConfig." + error;
        }
        return null;
    };

    /**
     * Creates a RadioConfigPacket message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof RadioConfigPacket
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {RadioConfigPacket} RadioConfigPacket
     */
    RadioConfigPacket.fromObject = function fromObject(object) {
        if (object instanceof $root.RadioConfigPacket)
            return object;
        var message = new $root.RadioConfigPacket();
        if (object.loRaWANConfig != null) {
            if (typeof object.loRaWANConfig !== "object")
                throw TypeError(".RadioConfigPacket.loRaWANConfig: object expected");
            message.loRaWANConfig = $root.LoRaWANConfig.fromObject(object.loRaWANConfig);
        }
        if (object.loRaConfig != null) {
            if (typeof object.loRaConfig !== "object")
                throw TypeError(".RadioConfigPacket.loRaConfig: object expected");
            message.loRaConfig = $root.LoRaConfig.fromObject(object.loRaConfig);
        }
        if (object.lostModeEnabled != null)
            message.lostModeEnabled = Boolean(object.lostModeEnabled);
        if (object.lostModeConfig != null) {
            if (typeof object.lostModeConfig !== "object")
                throw TypeError(".RadioConfigPacket.lostModeConfig: object expected");
            message.lostModeConfig = $root.LostMode_config.fromObject(object.lostModeConfig);
        }
        return message;
    };

    /**
     * Creates a plain object from a RadioConfigPacket message. Also converts values to other types if specified.
     * @function toObject
     * @memberof RadioConfigPacket
     * @static
     * @param {RadioConfigPacket} message RadioConfigPacket
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RadioConfigPacket.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.loRaWANConfig = null;
            object.loRaConfig = null;
            object.lostModeEnabled = false;
            object.lostModeConfig = null;
        }
        if (message.loRaWANConfig != null && message.hasOwnProperty("loRaWANConfig"))
            object.loRaWANConfig = $root.LoRaWANConfig.toObject(message.loRaWANConfig, options);
        if (message.loRaConfig != null && message.hasOwnProperty("loRaConfig"))
            object.loRaConfig = $root.LoRaConfig.toObject(message.loRaConfig, options);
        if (message.lostModeEnabled != null && message.hasOwnProperty("lostModeEnabled"))
            object.lostModeEnabled = message.lostModeEnabled;
        if (message.lostModeConfig != null && message.hasOwnProperty("lostModeConfig"))
            object.lostModeConfig = $root.LostMode_config.toObject(message.lostModeConfig, options);
        return object;
    };

    /**
     * Converts this RadioConfigPacket to JSON.
     * @function toJSON
     * @memberof RadioConfigPacket
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RadioConfigPacket.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for RadioConfigPacket
     * @function getTypeUrl
     * @memberof RadioConfigPacket
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    RadioConfigPacket.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/RadioConfigPacket";
    };

    return RadioConfigPacket;
})();

$root.MicrophoneConfig = (function() {

    /**
     * Properties of a MicrophoneConfig.
     * @exports IMicrophoneConfig
     * @interface IMicrophoneConfig
     * @property {boolean|null} [enabled] MicrophoneConfig enabled
     * @property {boolean|null} [continuousMode] MicrophoneConfig continuousMode
     * @property {number|null} [sampleLengthMin] MicrophoneConfig sampleLengthMin
     * @property {number|null} [sampleWindowMin] MicrophoneConfig sampleWindowMin
     */

    /**
     * Constructs a new MicrophoneConfig.
     * @exports MicrophoneConfig
     * @classdesc Represents a MicrophoneConfig.
     * @implements IMicrophoneConfig
     * @constructor
     * @param {IMicrophoneConfig=} [properties] Properties to set
     */
    function MicrophoneConfig(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * MicrophoneConfig enabled.
     * @member {boolean} enabled
     * @memberof MicrophoneConfig
     * @instance
     */
    MicrophoneConfig.prototype.enabled = false;

    /**
     * MicrophoneConfig continuousMode.
     * @member {boolean} continuousMode
     * @memberof MicrophoneConfig
     * @instance
     */
    MicrophoneConfig.prototype.continuousMode = false;

    /**
     * MicrophoneConfig sampleLengthMin.
     * @member {number} sampleLengthMin
     * @memberof MicrophoneConfig
     * @instance
     */
    MicrophoneConfig.prototype.sampleLengthMin = 0;

    /**
     * MicrophoneConfig sampleWindowMin.
     * @member {number} sampleWindowMin
     * @memberof MicrophoneConfig
     * @instance
     */
    MicrophoneConfig.prototype.sampleWindowMin = 0;

    /**
     * Creates a new MicrophoneConfig instance using the specified properties.
     * @function create
     * @memberof MicrophoneConfig
     * @static
     * @param {IMicrophoneConfig=} [properties] Properties to set
     * @returns {MicrophoneConfig} MicrophoneConfig instance
     */
    MicrophoneConfig.create = function create(properties) {
        return new MicrophoneConfig(properties);
    };

    /**
     * Encodes the specified MicrophoneConfig message. Does not implicitly {@link MicrophoneConfig.verify|verify} messages.
     * @function encode
     * @memberof MicrophoneConfig
     * @static
     * @param {IMicrophoneConfig} message MicrophoneConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MicrophoneConfig.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.enabled != null && Object.hasOwnProperty.call(message, "enabled"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.enabled);
        if (message.continuousMode != null && Object.hasOwnProperty.call(message, "continuousMode"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.continuousMode);
        if (message.sampleLengthMin != null && Object.hasOwnProperty.call(message, "sampleLengthMin"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.sampleLengthMin);
        if (message.sampleWindowMin != null && Object.hasOwnProperty.call(message, "sampleWindowMin"))
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.sampleWindowMin);
        return writer;
    };

    /**
     * Encodes the specified MicrophoneConfig message, length delimited. Does not implicitly {@link MicrophoneConfig.verify|verify} messages.
     * @function encodeDelimited
     * @memberof MicrophoneConfig
     * @static
     * @param {IMicrophoneConfig} message MicrophoneConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MicrophoneConfig.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a MicrophoneConfig message from the specified reader or buffer.
     * @function decode
     * @memberof MicrophoneConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {MicrophoneConfig} MicrophoneConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MicrophoneConfig.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.MicrophoneConfig();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.enabled = reader.bool();
                    break;
                }
            case 2: {
                    message.continuousMode = reader.bool();
                    break;
                }
            case 3: {
                    message.sampleLengthMin = reader.uint32();
                    break;
                }
            case 4: {
                    message.sampleWindowMin = reader.uint32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a MicrophoneConfig message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof MicrophoneConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {MicrophoneConfig} MicrophoneConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MicrophoneConfig.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a MicrophoneConfig message.
     * @function verify
     * @memberof MicrophoneConfig
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    MicrophoneConfig.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            if (typeof message.enabled !== "boolean")
                return "enabled: boolean expected";
        if (message.continuousMode != null && message.hasOwnProperty("continuousMode"))
            if (typeof message.continuousMode !== "boolean")
                return "continuousMode: boolean expected";
        if (message.sampleLengthMin != null && message.hasOwnProperty("sampleLengthMin"))
            if (!$util.isInteger(message.sampleLengthMin))
                return "sampleLengthMin: integer expected";
        if (message.sampleWindowMin != null && message.hasOwnProperty("sampleWindowMin"))
            if (!$util.isInteger(message.sampleWindowMin))
                return "sampleWindowMin: integer expected";
        return null;
    };

    /**
     * Creates a MicrophoneConfig message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof MicrophoneConfig
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {MicrophoneConfig} MicrophoneConfig
     */
    MicrophoneConfig.fromObject = function fromObject(object) {
        if (object instanceof $root.MicrophoneConfig)
            return object;
        var message = new $root.MicrophoneConfig();
        if (object.enabled != null)
            message.enabled = Boolean(object.enabled);
        if (object.continuousMode != null)
            message.continuousMode = Boolean(object.continuousMode);
        if (object.sampleLengthMin != null)
            message.sampleLengthMin = object.sampleLengthMin >>> 0;
        if (object.sampleWindowMin != null)
            message.sampleWindowMin = object.sampleWindowMin >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a MicrophoneConfig message. Also converts values to other types if specified.
     * @function toObject
     * @memberof MicrophoneConfig
     * @static
     * @param {MicrophoneConfig} message MicrophoneConfig
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    MicrophoneConfig.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.enabled = false;
            object.continuousMode = false;
            object.sampleLengthMin = 0;
            object.sampleWindowMin = 0;
        }
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            object.enabled = message.enabled;
        if (message.continuousMode != null && message.hasOwnProperty("continuousMode"))
            object.continuousMode = message.continuousMode;
        if (message.sampleLengthMin != null && message.hasOwnProperty("sampleLengthMin"))
            object.sampleLengthMin = message.sampleLengthMin;
        if (message.sampleWindowMin != null && message.hasOwnProperty("sampleWindowMin"))
            object.sampleWindowMin = message.sampleWindowMin;
        return object;
    };

    /**
     * Converts this MicrophoneConfig to JSON.
     * @function toJSON
     * @memberof MicrophoneConfig
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    MicrophoneConfig.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for MicrophoneConfig
     * @function getTypeUrl
     * @memberof MicrophoneConfig
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    MicrophoneConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/MicrophoneConfig";
    };

    return MicrophoneConfig;
})();

/**
 * AccelSampleRate enum.
 * @exports AccelSampleRate
 * @enum {number}
 * @property {number} ACCEL_25HZ=0 ACCEL_25HZ value
 * @property {number} ACCEL_50HZ=1 ACCEL_50HZ value
 */
$root.AccelSampleRate = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "ACCEL_25HZ"] = 0;
    values[valuesById[1] = "ACCEL_50HZ"] = 1;
    return values;
})();

/**
 * AccelSensitivity enum.
 * @exports AccelSensitivity
 * @enum {number}
 * @property {number} ACCEL_2G=0 ACCEL_2G value
 * @property {number} ACCEL_4G=1 ACCEL_4G value
 * @property {number} ACCEL_8G=2 ACCEL_8G value
 */
$root.AccelSensitivity = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "ACCEL_2G"] = 0;
    values[valuesById[1] = "ACCEL_4G"] = 1;
    values[valuesById[2] = "ACCEL_8G"] = 2;
    return values;
})();

$root.AccelerometerConfig = (function() {

    /**
     * Properties of an AccelerometerConfig.
     * @exports IAccelerometerConfig
     * @interface IAccelerometerConfig
     * @property {boolean|null} [enabled] AccelerometerConfig enabled
     * @property {AccelSampleRate|null} [sampleRate] AccelerometerConfig sampleRate
     * @property {AccelSensitivity|null} [sensitivity] AccelerometerConfig sensitivity
     */

    /**
     * Constructs a new AccelerometerConfig.
     * @exports AccelerometerConfig
     * @classdesc Represents an AccelerometerConfig.
     * @implements IAccelerometerConfig
     * @constructor
     * @param {IAccelerometerConfig=} [properties] Properties to set
     */
    function AccelerometerConfig(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * AccelerometerConfig enabled.
     * @member {boolean} enabled
     * @memberof AccelerometerConfig
     * @instance
     */
    AccelerometerConfig.prototype.enabled = false;

    /**
     * AccelerometerConfig sampleRate.
     * @member {AccelSampleRate} sampleRate
     * @memberof AccelerometerConfig
     * @instance
     */
    AccelerometerConfig.prototype.sampleRate = 0;

    /**
     * AccelerometerConfig sensitivity.
     * @member {AccelSensitivity} sensitivity
     * @memberof AccelerometerConfig
     * @instance
     */
    AccelerometerConfig.prototype.sensitivity = 0;

    /**
     * Creates a new AccelerometerConfig instance using the specified properties.
     * @function create
     * @memberof AccelerometerConfig
     * @static
     * @param {IAccelerometerConfig=} [properties] Properties to set
     * @returns {AccelerometerConfig} AccelerometerConfig instance
     */
    AccelerometerConfig.create = function create(properties) {
        return new AccelerometerConfig(properties);
    };

    /**
     * Encodes the specified AccelerometerConfig message. Does not implicitly {@link AccelerometerConfig.verify|verify} messages.
     * @function encode
     * @memberof AccelerometerConfig
     * @static
     * @param {IAccelerometerConfig} message AccelerometerConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AccelerometerConfig.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.enabled != null && Object.hasOwnProperty.call(message, "enabled"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.enabled);
        if (message.sampleRate != null && Object.hasOwnProperty.call(message, "sampleRate"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.sampleRate);
        if (message.sensitivity != null && Object.hasOwnProperty.call(message, "sensitivity"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.sensitivity);
        return writer;
    };

    /**
     * Encodes the specified AccelerometerConfig message, length delimited. Does not implicitly {@link AccelerometerConfig.verify|verify} messages.
     * @function encodeDelimited
     * @memberof AccelerometerConfig
     * @static
     * @param {IAccelerometerConfig} message AccelerometerConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AccelerometerConfig.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an AccelerometerConfig message from the specified reader or buffer.
     * @function decode
     * @memberof AccelerometerConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {AccelerometerConfig} AccelerometerConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AccelerometerConfig.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.AccelerometerConfig();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.enabled = reader.bool();
                    break;
                }
            case 2: {
                    message.sampleRate = reader.int32();
                    break;
                }
            case 3: {
                    message.sensitivity = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an AccelerometerConfig message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof AccelerometerConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {AccelerometerConfig} AccelerometerConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AccelerometerConfig.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an AccelerometerConfig message.
     * @function verify
     * @memberof AccelerometerConfig
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    AccelerometerConfig.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            if (typeof message.enabled !== "boolean")
                return "enabled: boolean expected";
        if (message.sampleRate != null && message.hasOwnProperty("sampleRate"))
            switch (message.sampleRate) {
            default:
                return "sampleRate: enum value expected";
            case 0:
            case 1:
                break;
            }
        if (message.sensitivity != null && message.hasOwnProperty("sensitivity"))
            switch (message.sensitivity) {
            default:
                return "sensitivity: enum value expected";
            case 0:
            case 1:
            case 2:
                break;
            }
        return null;
    };

    /**
     * Creates an AccelerometerConfig message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof AccelerometerConfig
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {AccelerometerConfig} AccelerometerConfig
     */
    AccelerometerConfig.fromObject = function fromObject(object) {
        if (object instanceof $root.AccelerometerConfig)
            return object;
        var message = new $root.AccelerometerConfig();
        if (object.enabled != null)
            message.enabled = Boolean(object.enabled);
        switch (object.sampleRate) {
        default:
            if (typeof object.sampleRate === "number") {
                message.sampleRate = object.sampleRate;
                break;
            }
            break;
        case "ACCEL_25HZ":
        case 0:
            message.sampleRate = 0;
            break;
        case "ACCEL_50HZ":
        case 1:
            message.sampleRate = 1;
            break;
        }
        switch (object.sensitivity) {
        default:
            if (typeof object.sensitivity === "number") {
                message.sensitivity = object.sensitivity;
                break;
            }
            break;
        case "ACCEL_2G":
        case 0:
            message.sensitivity = 0;
            break;
        case "ACCEL_4G":
        case 1:
            message.sensitivity = 1;
            break;
        case "ACCEL_8G":
        case 2:
            message.sensitivity = 2;
            break;
        }
        return message;
    };

    /**
     * Creates a plain object from an AccelerometerConfig message. Also converts values to other types if specified.
     * @function toObject
     * @memberof AccelerometerConfig
     * @static
     * @param {AccelerometerConfig} message AccelerometerConfig
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    AccelerometerConfig.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.enabled = false;
            object.sampleRate = options.enums === String ? "ACCEL_25HZ" : 0;
            object.sensitivity = options.enums === String ? "ACCEL_2G" : 0;
        }
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            object.enabled = message.enabled;
        if (message.sampleRate != null && message.hasOwnProperty("sampleRate"))
            object.sampleRate = options.enums === String ? $root.AccelSampleRate[message.sampleRate] === undefined ? message.sampleRate : $root.AccelSampleRate[message.sampleRate] : message.sampleRate;
        if (message.sensitivity != null && message.hasOwnProperty("sensitivity"))
            object.sensitivity = options.enums === String ? $root.AccelSensitivity[message.sensitivity] === undefined ? message.sensitivity : $root.AccelSensitivity[message.sensitivity] : message.sensitivity;
        return object;
    };

    /**
     * Converts this AccelerometerConfig to JSON.
     * @function toJSON
     * @memberof AccelerometerConfig
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    AccelerometerConfig.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for AccelerometerConfig
     * @function getTypeUrl
     * @memberof AccelerometerConfig
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    AccelerometerConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/AccelerometerConfig";
    };

    return AccelerometerConfig;
})();

$root.MagnetometerConfig = (function() {

    /**
     * Properties of a MagnetometerConfig.
     * @exports IMagnetometerConfig
     * @interface IMagnetometerConfig
     * @property {boolean|null} [enabled] MagnetometerConfig enabled
     * @property {number|null} [sampleIntervalS] MagnetometerConfig sampleIntervalS
     */

    /**
     * Constructs a new MagnetometerConfig.
     * @exports MagnetometerConfig
     * @classdesc Represents a MagnetometerConfig.
     * @implements IMagnetometerConfig
     * @constructor
     * @param {IMagnetometerConfig=} [properties] Properties to set
     */
    function MagnetometerConfig(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * MagnetometerConfig enabled.
     * @member {boolean} enabled
     * @memberof MagnetometerConfig
     * @instance
     */
    MagnetometerConfig.prototype.enabled = false;

    /**
     * MagnetometerConfig sampleIntervalS.
     * @member {number} sampleIntervalS
     * @memberof MagnetometerConfig
     * @instance
     */
    MagnetometerConfig.prototype.sampleIntervalS = 0;

    /**
     * Creates a new MagnetometerConfig instance using the specified properties.
     * @function create
     * @memberof MagnetometerConfig
     * @static
     * @param {IMagnetometerConfig=} [properties] Properties to set
     * @returns {MagnetometerConfig} MagnetometerConfig instance
     */
    MagnetometerConfig.create = function create(properties) {
        return new MagnetometerConfig(properties);
    };

    /**
     * Encodes the specified MagnetometerConfig message. Does not implicitly {@link MagnetometerConfig.verify|verify} messages.
     * @function encode
     * @memberof MagnetometerConfig
     * @static
     * @param {IMagnetometerConfig} message MagnetometerConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MagnetometerConfig.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.enabled != null && Object.hasOwnProperty.call(message, "enabled"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.enabled);
        if (message.sampleIntervalS != null && Object.hasOwnProperty.call(message, "sampleIntervalS"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.sampleIntervalS);
        return writer;
    };

    /**
     * Encodes the specified MagnetometerConfig message, length delimited. Does not implicitly {@link MagnetometerConfig.verify|verify} messages.
     * @function encodeDelimited
     * @memberof MagnetometerConfig
     * @static
     * @param {IMagnetometerConfig} message MagnetometerConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MagnetometerConfig.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a MagnetometerConfig message from the specified reader or buffer.
     * @function decode
     * @memberof MagnetometerConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {MagnetometerConfig} MagnetometerConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MagnetometerConfig.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.MagnetometerConfig();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.enabled = reader.bool();
                    break;
                }
            case 2: {
                    message.sampleIntervalS = reader.uint32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a MagnetometerConfig message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof MagnetometerConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {MagnetometerConfig} MagnetometerConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MagnetometerConfig.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a MagnetometerConfig message.
     * @function verify
     * @memberof MagnetometerConfig
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    MagnetometerConfig.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            if (typeof message.enabled !== "boolean")
                return "enabled: boolean expected";
        if (message.sampleIntervalS != null && message.hasOwnProperty("sampleIntervalS"))
            if (!$util.isInteger(message.sampleIntervalS))
                return "sampleIntervalS: integer expected";
        return null;
    };

    /**
     * Creates a MagnetometerConfig message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof MagnetometerConfig
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {MagnetometerConfig} MagnetometerConfig
     */
    MagnetometerConfig.fromObject = function fromObject(object) {
        if (object instanceof $root.MagnetometerConfig)
            return object;
        var message = new $root.MagnetometerConfig();
        if (object.enabled != null)
            message.enabled = Boolean(object.enabled);
        if (object.sampleIntervalS != null)
            message.sampleIntervalS = object.sampleIntervalS >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a MagnetometerConfig message. Also converts values to other types if specified.
     * @function toObject
     * @memberof MagnetometerConfig
     * @static
     * @param {MagnetometerConfig} message MagnetometerConfig
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    MagnetometerConfig.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.enabled = false;
            object.sampleIntervalS = 0;
        }
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            object.enabled = message.enabled;
        if (message.sampleIntervalS != null && message.hasOwnProperty("sampleIntervalS"))
            object.sampleIntervalS = message.sampleIntervalS;
        return object;
    };

    /**
     * Converts this MagnetometerConfig to JSON.
     * @function toJSON
     * @memberof MagnetometerConfig
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    MagnetometerConfig.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for MagnetometerConfig
     * @function getTypeUrl
     * @memberof MagnetometerConfig
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    MagnetometerConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/MagnetometerConfig";
    };

    return MagnetometerConfig;
})();

$root.ScheduleConfig = (function() {

    /**
     * Properties of a ScheduleConfig.
     * @exports IScheduleConfig
     * @interface IScheduleConfig
     * @property {ITimeWindow|null} [window] ScheduleConfig window
     * @property {ISamplingConfig|null} [light] ScheduleConfig light
     * @property {ISamplingConfig|null} [environmental] ScheduleConfig environmental
     * @property {ISamplingConfig|null} [particulate] ScheduleConfig particulate
     * @property {IGPSConfig|null} [gps] ScheduleConfig gps
     * @property {IMicrophoneConfig|null} [microphone] ScheduleConfig microphone
     * @property {IAccelerometerConfig|null} [accelerometer] ScheduleConfig accelerometer
     * @property {boolean|null} [lorawanEnabled] ScheduleConfig lorawanEnabled
     * @property {number|null} [lorawanSendIntervalMin] ScheduleConfig lorawanSendIntervalMin
     * @property {boolean|null} [loraEnabled] ScheduleConfig loraEnabled
     * @property {number|null} [loraSendIntervalMin] ScheduleConfig loraSendIntervalMin
     * @property {IMagnetometerConfig|null} [magnetometer] ScheduleConfig magnetometer
     */

    /**
     * Constructs a new ScheduleConfig.
     * @exports ScheduleConfig
     * @classdesc Represents a ScheduleConfig.
     * @implements IScheduleConfig
     * @constructor
     * @param {IScheduleConfig=} [properties] Properties to set
     */
    function ScheduleConfig(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ScheduleConfig window.
     * @member {ITimeWindow|null|undefined} window
     * @memberof ScheduleConfig
     * @instance
     */
    ScheduleConfig.prototype.window = null;

    /**
     * ScheduleConfig light.
     * @member {ISamplingConfig|null|undefined} light
     * @memberof ScheduleConfig
     * @instance
     */
    ScheduleConfig.prototype.light = null;

    /**
     * ScheduleConfig environmental.
     * @member {ISamplingConfig|null|undefined} environmental
     * @memberof ScheduleConfig
     * @instance
     */
    ScheduleConfig.prototype.environmental = null;

    /**
     * ScheduleConfig particulate.
     * @member {ISamplingConfig|null|undefined} particulate
     * @memberof ScheduleConfig
     * @instance
     */
    ScheduleConfig.prototype.particulate = null;

    /**
     * ScheduleConfig gps.
     * @member {IGPSConfig|null|undefined} gps
     * @memberof ScheduleConfig
     * @instance
     */
    ScheduleConfig.prototype.gps = null;

    /**
     * ScheduleConfig microphone.
     * @member {IMicrophoneConfig|null|undefined} microphone
     * @memberof ScheduleConfig
     * @instance
     */
    ScheduleConfig.prototype.microphone = null;

    /**
     * ScheduleConfig accelerometer.
     * @member {IAccelerometerConfig|null|undefined} accelerometer
     * @memberof ScheduleConfig
     * @instance
     */
    ScheduleConfig.prototype.accelerometer = null;

    /**
     * ScheduleConfig lorawanEnabled.
     * @member {boolean} lorawanEnabled
     * @memberof ScheduleConfig
     * @instance
     */
    ScheduleConfig.prototype.lorawanEnabled = false;

    /**
     * ScheduleConfig lorawanSendIntervalMin.
     * @member {number} lorawanSendIntervalMin
     * @memberof ScheduleConfig
     * @instance
     */
    ScheduleConfig.prototype.lorawanSendIntervalMin = 0;

    /**
     * ScheduleConfig loraEnabled.
     * @member {boolean} loraEnabled
     * @memberof ScheduleConfig
     * @instance
     */
    ScheduleConfig.prototype.loraEnabled = false;

    /**
     * ScheduleConfig loraSendIntervalMin.
     * @member {number} loraSendIntervalMin
     * @memberof ScheduleConfig
     * @instance
     */
    ScheduleConfig.prototype.loraSendIntervalMin = 0;

    /**
     * ScheduleConfig magnetometer.
     * @member {IMagnetometerConfig|null|undefined} magnetometer
     * @memberof ScheduleConfig
     * @instance
     */
    ScheduleConfig.prototype.magnetometer = null;

    /**
     * Creates a new ScheduleConfig instance using the specified properties.
     * @function create
     * @memberof ScheduleConfig
     * @static
     * @param {IScheduleConfig=} [properties] Properties to set
     * @returns {ScheduleConfig} ScheduleConfig instance
     */
    ScheduleConfig.create = function create(properties) {
        return new ScheduleConfig(properties);
    };

    /**
     * Encodes the specified ScheduleConfig message. Does not implicitly {@link ScheduleConfig.verify|verify} messages.
     * @function encode
     * @memberof ScheduleConfig
     * @static
     * @param {IScheduleConfig} message ScheduleConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ScheduleConfig.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.window != null && Object.hasOwnProperty.call(message, "window"))
            $root.TimeWindow.encode(message.window, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.light != null && Object.hasOwnProperty.call(message, "light"))
            $root.SamplingConfig.encode(message.light, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.environmental != null && Object.hasOwnProperty.call(message, "environmental"))
            $root.SamplingConfig.encode(message.environmental, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.particulate != null && Object.hasOwnProperty.call(message, "particulate"))
            $root.SamplingConfig.encode(message.particulate, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.gps != null && Object.hasOwnProperty.call(message, "gps"))
            $root.GPSConfig.encode(message.gps, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        if (message.microphone != null && Object.hasOwnProperty.call(message, "microphone"))
            $root.MicrophoneConfig.encode(message.microphone, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        if (message.accelerometer != null && Object.hasOwnProperty.call(message, "accelerometer"))
            $root.AccelerometerConfig.encode(message.accelerometer, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
        if (message.lorawanEnabled != null && Object.hasOwnProperty.call(message, "lorawanEnabled"))
            writer.uint32(/* id 8, wireType 0 =*/64).bool(message.lorawanEnabled);
        if (message.lorawanSendIntervalMin != null && Object.hasOwnProperty.call(message, "lorawanSendIntervalMin"))
            writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.lorawanSendIntervalMin);
        if (message.loraEnabled != null && Object.hasOwnProperty.call(message, "loraEnabled"))
            writer.uint32(/* id 10, wireType 0 =*/80).bool(message.loraEnabled);
        if (message.loraSendIntervalMin != null && Object.hasOwnProperty.call(message, "loraSendIntervalMin"))
            writer.uint32(/* id 11, wireType 0 =*/88).uint32(message.loraSendIntervalMin);
        if (message.magnetometer != null && Object.hasOwnProperty.call(message, "magnetometer"))
            $root.MagnetometerConfig.encode(message.magnetometer, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified ScheduleConfig message, length delimited. Does not implicitly {@link ScheduleConfig.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ScheduleConfig
     * @static
     * @param {IScheduleConfig} message ScheduleConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ScheduleConfig.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ScheduleConfig message from the specified reader or buffer.
     * @function decode
     * @memberof ScheduleConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ScheduleConfig} ScheduleConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ScheduleConfig.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ScheduleConfig();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.window = $root.TimeWindow.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    message.light = $root.SamplingConfig.decode(reader, reader.uint32());
                    break;
                }
            case 3: {
                    message.environmental = $root.SamplingConfig.decode(reader, reader.uint32());
                    break;
                }
            case 4: {
                    message.particulate = $root.SamplingConfig.decode(reader, reader.uint32());
                    break;
                }
            case 5: {
                    message.gps = $root.GPSConfig.decode(reader, reader.uint32());
                    break;
                }
            case 6: {
                    message.microphone = $root.MicrophoneConfig.decode(reader, reader.uint32());
                    break;
                }
            case 7: {
                    message.accelerometer = $root.AccelerometerConfig.decode(reader, reader.uint32());
                    break;
                }
            case 8: {
                    message.lorawanEnabled = reader.bool();
                    break;
                }
            case 9: {
                    message.lorawanSendIntervalMin = reader.uint32();
                    break;
                }
            case 10: {
                    message.loraEnabled = reader.bool();
                    break;
                }
            case 11: {
                    message.loraSendIntervalMin = reader.uint32();
                    break;
                }
            case 12: {
                    message.magnetometer = $root.MagnetometerConfig.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a ScheduleConfig message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ScheduleConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ScheduleConfig} ScheduleConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ScheduleConfig.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ScheduleConfig message.
     * @function verify
     * @memberof ScheduleConfig
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ScheduleConfig.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.window != null && message.hasOwnProperty("window")) {
            var error = $root.TimeWindow.verify(message.window);
            if (error)
                return "window." + error;
        }
        if (message.light != null && message.hasOwnProperty("light")) {
            var error = $root.SamplingConfig.verify(message.light);
            if (error)
                return "light." + error;
        }
        if (message.environmental != null && message.hasOwnProperty("environmental")) {
            var error = $root.SamplingConfig.verify(message.environmental);
            if (error)
                return "environmental." + error;
        }
        if (message.particulate != null && message.hasOwnProperty("particulate")) {
            var error = $root.SamplingConfig.verify(message.particulate);
            if (error)
                return "particulate." + error;
        }
        if (message.gps != null && message.hasOwnProperty("gps")) {
            var error = $root.GPSConfig.verify(message.gps);
            if (error)
                return "gps." + error;
        }
        if (message.microphone != null && message.hasOwnProperty("microphone")) {
            var error = $root.MicrophoneConfig.verify(message.microphone);
            if (error)
                return "microphone." + error;
        }
        if (message.accelerometer != null && message.hasOwnProperty("accelerometer")) {
            var error = $root.AccelerometerConfig.verify(message.accelerometer);
            if (error)
                return "accelerometer." + error;
        }
        if (message.lorawanEnabled != null && message.hasOwnProperty("lorawanEnabled"))
            if (typeof message.lorawanEnabled !== "boolean")
                return "lorawanEnabled: boolean expected";
        if (message.lorawanSendIntervalMin != null && message.hasOwnProperty("lorawanSendIntervalMin"))
            if (!$util.isInteger(message.lorawanSendIntervalMin))
                return "lorawanSendIntervalMin: integer expected";
        if (message.loraEnabled != null && message.hasOwnProperty("loraEnabled"))
            if (typeof message.loraEnabled !== "boolean")
                return "loraEnabled: boolean expected";
        if (message.loraSendIntervalMin != null && message.hasOwnProperty("loraSendIntervalMin"))
            if (!$util.isInteger(message.loraSendIntervalMin))
                return "loraSendIntervalMin: integer expected";
        if (message.magnetometer != null && message.hasOwnProperty("magnetometer")) {
            var error = $root.MagnetometerConfig.verify(message.magnetometer);
            if (error)
                return "magnetometer." + error;
        }
        return null;
    };

    /**
     * Creates a ScheduleConfig message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ScheduleConfig
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ScheduleConfig} ScheduleConfig
     */
    ScheduleConfig.fromObject = function fromObject(object) {
        if (object instanceof $root.ScheduleConfig)
            return object;
        var message = new $root.ScheduleConfig();
        if (object.window != null) {
            if (typeof object.window !== "object")
                throw TypeError(".ScheduleConfig.window: object expected");
            message.window = $root.TimeWindow.fromObject(object.window);
        }
        if (object.light != null) {
            if (typeof object.light !== "object")
                throw TypeError(".ScheduleConfig.light: object expected");
            message.light = $root.SamplingConfig.fromObject(object.light);
        }
        if (object.environmental != null) {
            if (typeof object.environmental !== "object")
                throw TypeError(".ScheduleConfig.environmental: object expected");
            message.environmental = $root.SamplingConfig.fromObject(object.environmental);
        }
        if (object.particulate != null) {
            if (typeof object.particulate !== "object")
                throw TypeError(".ScheduleConfig.particulate: object expected");
            message.particulate = $root.SamplingConfig.fromObject(object.particulate);
        }
        if (object.gps != null) {
            if (typeof object.gps !== "object")
                throw TypeError(".ScheduleConfig.gps: object expected");
            message.gps = $root.GPSConfig.fromObject(object.gps);
        }
        if (object.microphone != null) {
            if (typeof object.microphone !== "object")
                throw TypeError(".ScheduleConfig.microphone: object expected");
            message.microphone = $root.MicrophoneConfig.fromObject(object.microphone);
        }
        if (object.accelerometer != null) {
            if (typeof object.accelerometer !== "object")
                throw TypeError(".ScheduleConfig.accelerometer: object expected");
            message.accelerometer = $root.AccelerometerConfig.fromObject(object.accelerometer);
        }
        if (object.lorawanEnabled != null)
            message.lorawanEnabled = Boolean(object.lorawanEnabled);
        if (object.lorawanSendIntervalMin != null)
            message.lorawanSendIntervalMin = object.lorawanSendIntervalMin >>> 0;
        if (object.loraEnabled != null)
            message.loraEnabled = Boolean(object.loraEnabled);
        if (object.loraSendIntervalMin != null)
            message.loraSendIntervalMin = object.loraSendIntervalMin >>> 0;
        if (object.magnetometer != null) {
            if (typeof object.magnetometer !== "object")
                throw TypeError(".ScheduleConfig.magnetometer: object expected");
            message.magnetometer = $root.MagnetometerConfig.fromObject(object.magnetometer);
        }
        return message;
    };

    /**
     * Creates a plain object from a ScheduleConfig message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ScheduleConfig
     * @static
     * @param {ScheduleConfig} message ScheduleConfig
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ScheduleConfig.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.window = null;
            object.light = null;
            object.environmental = null;
            object.particulate = null;
            object.gps = null;
            object.microphone = null;
            object.accelerometer = null;
            object.lorawanEnabled = false;
            object.lorawanSendIntervalMin = 0;
            object.loraEnabled = false;
            object.loraSendIntervalMin = 0;
            object.magnetometer = null;
        }
        if (message.window != null && message.hasOwnProperty("window"))
            object.window = $root.TimeWindow.toObject(message.window, options);
        if (message.light != null && message.hasOwnProperty("light"))
            object.light = $root.SamplingConfig.toObject(message.light, options);
        if (message.environmental != null && message.hasOwnProperty("environmental"))
            object.environmental = $root.SamplingConfig.toObject(message.environmental, options);
        if (message.particulate != null && message.hasOwnProperty("particulate"))
            object.particulate = $root.SamplingConfig.toObject(message.particulate, options);
        if (message.gps != null && message.hasOwnProperty("gps"))
            object.gps = $root.GPSConfig.toObject(message.gps, options);
        if (message.microphone != null && message.hasOwnProperty("microphone"))
            object.microphone = $root.MicrophoneConfig.toObject(message.microphone, options);
        if (message.accelerometer != null && message.hasOwnProperty("accelerometer"))
            object.accelerometer = $root.AccelerometerConfig.toObject(message.accelerometer, options);
        if (message.lorawanEnabled != null && message.hasOwnProperty("lorawanEnabled"))
            object.lorawanEnabled = message.lorawanEnabled;
        if (message.lorawanSendIntervalMin != null && message.hasOwnProperty("lorawanSendIntervalMin"))
            object.lorawanSendIntervalMin = message.lorawanSendIntervalMin;
        if (message.loraEnabled != null && message.hasOwnProperty("loraEnabled"))
            object.loraEnabled = message.loraEnabled;
        if (message.loraSendIntervalMin != null && message.hasOwnProperty("loraSendIntervalMin"))
            object.loraSendIntervalMin = message.loraSendIntervalMin;
        if (message.magnetometer != null && message.hasOwnProperty("magnetometer"))
            object.magnetometer = $root.MagnetometerConfig.toObject(message.magnetometer, options);
        return object;
    };

    /**
     * Converts this ScheduleConfig to JSON.
     * @function toJSON
     * @memberof ScheduleConfig
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ScheduleConfig.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ScheduleConfig
     * @function getTypeUrl
     * @memberof ScheduleConfig
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ScheduleConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ScheduleConfig";
    };

    return ScheduleConfig;
})();

$root.ScheduleConfigPacket = (function() {

    /**
     * Properties of a ScheduleConfigPacket.
     * @exports IScheduleConfigPacket
     * @interface IScheduleConfigPacket
     * @property {Array.<IScheduleConfig>|null} [schedules] ScheduleConfigPacket schedules
     */

    /**
     * Constructs a new ScheduleConfigPacket.
     * @exports ScheduleConfigPacket
     * @classdesc Represents a ScheduleConfigPacket.
     * @implements IScheduleConfigPacket
     * @constructor
     * @param {IScheduleConfigPacket=} [properties] Properties to set
     */
    function ScheduleConfigPacket(properties) {
        this.schedules = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ScheduleConfigPacket schedules.
     * @member {Array.<IScheduleConfig>} schedules
     * @memberof ScheduleConfigPacket
     * @instance
     */
    ScheduleConfigPacket.prototype.schedules = $util.emptyArray;

    /**
     * Creates a new ScheduleConfigPacket instance using the specified properties.
     * @function create
     * @memberof ScheduleConfigPacket
     * @static
     * @param {IScheduleConfigPacket=} [properties] Properties to set
     * @returns {ScheduleConfigPacket} ScheduleConfigPacket instance
     */
    ScheduleConfigPacket.create = function create(properties) {
        return new ScheduleConfigPacket(properties);
    };

    /**
     * Encodes the specified ScheduleConfigPacket message. Does not implicitly {@link ScheduleConfigPacket.verify|verify} messages.
     * @function encode
     * @memberof ScheduleConfigPacket
     * @static
     * @param {IScheduleConfigPacket} message ScheduleConfigPacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ScheduleConfigPacket.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.schedules != null && message.schedules.length)
            for (var i = 0; i < message.schedules.length; ++i)
                $root.ScheduleConfig.encode(message.schedules[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified ScheduleConfigPacket message, length delimited. Does not implicitly {@link ScheduleConfigPacket.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ScheduleConfigPacket
     * @static
     * @param {IScheduleConfigPacket} message ScheduleConfigPacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ScheduleConfigPacket.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ScheduleConfigPacket message from the specified reader or buffer.
     * @function decode
     * @memberof ScheduleConfigPacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ScheduleConfigPacket} ScheduleConfigPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ScheduleConfigPacket.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ScheduleConfigPacket();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    if (!(message.schedules && message.schedules.length))
                        message.schedules = [];
                    message.schedules.push($root.ScheduleConfig.decode(reader, reader.uint32()));
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a ScheduleConfigPacket message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ScheduleConfigPacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ScheduleConfigPacket} ScheduleConfigPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ScheduleConfigPacket.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ScheduleConfigPacket message.
     * @function verify
     * @memberof ScheduleConfigPacket
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ScheduleConfigPacket.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.schedules != null && message.hasOwnProperty("schedules")) {
            if (!Array.isArray(message.schedules))
                return "schedules: array expected";
            for (var i = 0; i < message.schedules.length; ++i) {
                var error = $root.ScheduleConfig.verify(message.schedules[i]);
                if (error)
                    return "schedules." + error;
            }
        }
        return null;
    };

    /**
     * Creates a ScheduleConfigPacket message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ScheduleConfigPacket
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ScheduleConfigPacket} ScheduleConfigPacket
     */
    ScheduleConfigPacket.fromObject = function fromObject(object) {
        if (object instanceof $root.ScheduleConfigPacket)
            return object;
        var message = new $root.ScheduleConfigPacket();
        if (object.schedules) {
            if (!Array.isArray(object.schedules))
                throw TypeError(".ScheduleConfigPacket.schedules: array expected");
            message.schedules = [];
            for (var i = 0; i < object.schedules.length; ++i) {
                if (typeof object.schedules[i] !== "object")
                    throw TypeError(".ScheduleConfigPacket.schedules: object expected");
                message.schedules[i] = $root.ScheduleConfig.fromObject(object.schedules[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a ScheduleConfigPacket message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ScheduleConfigPacket
     * @static
     * @param {ScheduleConfigPacket} message ScheduleConfigPacket
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ScheduleConfigPacket.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.schedules = [];
        if (message.schedules && message.schedules.length) {
            object.schedules = [];
            for (var j = 0; j < message.schedules.length; ++j)
                object.schedules[j] = $root.ScheduleConfig.toObject(message.schedules[j], options);
        }
        return object;
    };

    /**
     * Converts this ScheduleConfigPacket to JSON.
     * @function toJSON
     * @memberof ScheduleConfigPacket
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ScheduleConfigPacket.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ScheduleConfigPacket
     * @function getTypeUrl
     * @memberof ScheduleConfigPacket
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ScheduleConfigPacket.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ScheduleConfigPacket";
    };

    return ScheduleConfigPacket;
})();

$root.SimpleSensorReading = (function() {

    /**
     * Properties of a SimpleSensorReading.
     * @exports ISimpleSensorReading
     * @interface ISimpleSensorReading
     * @property {number|null} [index] SimpleSensorReading index
     * @property {number|null} [temperature] SimpleSensorReading temperature
     * @property {number|null} [humidity] SimpleSensorReading humidity
     * @property {number|null} [pressure] SimpleSensorReading pressure
     * @property {number|null} [gas] SimpleSensorReading gas
     * @property {number|null} [pm2_5] SimpleSensorReading pm2_5
     * @property {number|null} [light] SimpleSensorReading light
     * @property {Activity|null} [activity] SimpleSensorReading activity
     * @property {number|null} [steps] SimpleSensorReading steps
     * @property {boolean|null} [particulateStaticObstructed] SimpleSensorReading particulateStaticObstructed
     * @property {boolean|null} [particulateDynamicObstructed] SimpleSensorReading particulateDynamicObstructed
     * @property {boolean|null} [particulateOutsideDetectionLimits] SimpleSensorReading particulateOutsideDetectionLimits
     */

    /**
     * Constructs a new SimpleSensorReading.
     * @exports SimpleSensorReading
     * @classdesc Represents a SimpleSensorReading.
     * @implements ISimpleSensorReading
     * @constructor
     * @param {ISimpleSensorReading=} [properties] Properties to set
     */
    function SimpleSensorReading(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * SimpleSensorReading index.
     * @member {number} index
     * @memberof SimpleSensorReading
     * @instance
     */
    SimpleSensorReading.prototype.index = 0;

    /**
     * SimpleSensorReading temperature.
     * @member {number} temperature
     * @memberof SimpleSensorReading
     * @instance
     */
    SimpleSensorReading.prototype.temperature = 0;

    /**
     * SimpleSensorReading humidity.
     * @member {number} humidity
     * @memberof SimpleSensorReading
     * @instance
     */
    SimpleSensorReading.prototype.humidity = 0;

    /**
     * SimpleSensorReading pressure.
     * @member {number} pressure
     * @memberof SimpleSensorReading
     * @instance
     */
    SimpleSensorReading.prototype.pressure = 0;

    /**
     * SimpleSensorReading gas.
     * @member {number} gas
     * @memberof SimpleSensorReading
     * @instance
     */
    SimpleSensorReading.prototype.gas = 0;

    /**
     * SimpleSensorReading pm2_5.
     * @member {number} pm2_5
     * @memberof SimpleSensorReading
     * @instance
     */
    SimpleSensorReading.prototype.pm2_5 = 0;

    /**
     * SimpleSensorReading light.
     * @member {number} light
     * @memberof SimpleSensorReading
     * @instance
     */
    SimpleSensorReading.prototype.light = 0;

    /**
     * SimpleSensorReading activity.
     * @member {Activity} activity
     * @memberof SimpleSensorReading
     * @instance
     */
    SimpleSensorReading.prototype.activity = 0;

    /**
     * SimpleSensorReading steps.
     * @member {number} steps
     * @memberof SimpleSensorReading
     * @instance
     */
    SimpleSensorReading.prototype.steps = 0;

    /**
     * SimpleSensorReading particulateStaticObstructed.
     * @member {boolean} particulateStaticObstructed
     * @memberof SimpleSensorReading
     * @instance
     */
    SimpleSensorReading.prototype.particulateStaticObstructed = false;

    /**
     * SimpleSensorReading particulateDynamicObstructed.
     * @member {boolean} particulateDynamicObstructed
     * @memberof SimpleSensorReading
     * @instance
     */
    SimpleSensorReading.prototype.particulateDynamicObstructed = false;

    /**
     * SimpleSensorReading particulateOutsideDetectionLimits.
     * @member {boolean} particulateOutsideDetectionLimits
     * @memberof SimpleSensorReading
     * @instance
     */
    SimpleSensorReading.prototype.particulateOutsideDetectionLimits = false;

    /**
     * Creates a new SimpleSensorReading instance using the specified properties.
     * @function create
     * @memberof SimpleSensorReading
     * @static
     * @param {ISimpleSensorReading=} [properties] Properties to set
     * @returns {SimpleSensorReading} SimpleSensorReading instance
     */
    SimpleSensorReading.create = function create(properties) {
        return new SimpleSensorReading(properties);
    };

    /**
     * Encodes the specified SimpleSensorReading message. Does not implicitly {@link SimpleSensorReading.verify|verify} messages.
     * @function encode
     * @memberof SimpleSensorReading
     * @static
     * @param {ISimpleSensorReading} message SimpleSensorReading message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SimpleSensorReading.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.index != null && Object.hasOwnProperty.call(message, "index"))
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.index);
        if (message.temperature != null && Object.hasOwnProperty.call(message, "temperature"))
            writer.uint32(/* id 2, wireType 5 =*/21).float(message.temperature);
        if (message.humidity != null && Object.hasOwnProperty.call(message, "humidity"))
            writer.uint32(/* id 3, wireType 5 =*/29).float(message.humidity);
        if (message.pressure != null && Object.hasOwnProperty.call(message, "pressure"))
            writer.uint32(/* id 4, wireType 5 =*/37).float(message.pressure);
        if (message.gas != null && Object.hasOwnProperty.call(message, "gas"))
            writer.uint32(/* id 5, wireType 5 =*/45).float(message.gas);
        if (message.pm2_5 != null && Object.hasOwnProperty.call(message, "pm2_5"))
            writer.uint32(/* id 6, wireType 5 =*/53).float(message.pm2_5);
        if (message.light != null && Object.hasOwnProperty.call(message, "light"))
            writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.light);
        if (message.activity != null && Object.hasOwnProperty.call(message, "activity"))
            writer.uint32(/* id 8, wireType 0 =*/64).int32(message.activity);
        if (message.steps != null && Object.hasOwnProperty.call(message, "steps"))
            writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.steps);
        if (message.particulateStaticObstructed != null && Object.hasOwnProperty.call(message, "particulateStaticObstructed"))
            writer.uint32(/* id 10, wireType 0 =*/80).bool(message.particulateStaticObstructed);
        if (message.particulateDynamicObstructed != null && Object.hasOwnProperty.call(message, "particulateDynamicObstructed"))
            writer.uint32(/* id 11, wireType 0 =*/88).bool(message.particulateDynamicObstructed);
        if (message.particulateOutsideDetectionLimits != null && Object.hasOwnProperty.call(message, "particulateOutsideDetectionLimits"))
            writer.uint32(/* id 12, wireType 0 =*/96).bool(message.particulateOutsideDetectionLimits);
        return writer;
    };

    /**
     * Encodes the specified SimpleSensorReading message, length delimited. Does not implicitly {@link SimpleSensorReading.verify|verify} messages.
     * @function encodeDelimited
     * @memberof SimpleSensorReading
     * @static
     * @param {ISimpleSensorReading} message SimpleSensorReading message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SimpleSensorReading.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a SimpleSensorReading message from the specified reader or buffer.
     * @function decode
     * @memberof SimpleSensorReading
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {SimpleSensorReading} SimpleSensorReading
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SimpleSensorReading.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.SimpleSensorReading();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.index = reader.uint32();
                    break;
                }
            case 2: {
                    message.temperature = reader.float();
                    break;
                }
            case 3: {
                    message.humidity = reader.float();
                    break;
                }
            case 4: {
                    message.pressure = reader.float();
                    break;
                }
            case 5: {
                    message.gas = reader.float();
                    break;
                }
            case 6: {
                    message.pm2_5 = reader.float();
                    break;
                }
            case 7: {
                    message.light = reader.uint32();
                    break;
                }
            case 8: {
                    message.activity = reader.int32();
                    break;
                }
            case 9: {
                    message.steps = reader.uint32();
                    break;
                }
            case 10: {
                    message.particulateStaticObstructed = reader.bool();
                    break;
                }
            case 11: {
                    message.particulateDynamicObstructed = reader.bool();
                    break;
                }
            case 12: {
                    message.particulateOutsideDetectionLimits = reader.bool();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a SimpleSensorReading message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof SimpleSensorReading
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {SimpleSensorReading} SimpleSensorReading
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SimpleSensorReading.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a SimpleSensorReading message.
     * @function verify
     * @memberof SimpleSensorReading
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    SimpleSensorReading.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.index != null && message.hasOwnProperty("index"))
            if (!$util.isInteger(message.index))
                return "index: integer expected";
        if (message.temperature != null && message.hasOwnProperty("temperature"))
            if (typeof message.temperature !== "number")
                return "temperature: number expected";
        if (message.humidity != null && message.hasOwnProperty("humidity"))
            if (typeof message.humidity !== "number")
                return "humidity: number expected";
        if (message.pressure != null && message.hasOwnProperty("pressure"))
            if (typeof message.pressure !== "number")
                return "pressure: number expected";
        if (message.gas != null && message.hasOwnProperty("gas"))
            if (typeof message.gas !== "number")
                return "gas: number expected";
        if (message.pm2_5 != null && message.hasOwnProperty("pm2_5"))
            if (typeof message.pm2_5 !== "number")
                return "pm2_5: number expected";
        if (message.light != null && message.hasOwnProperty("light"))
            if (!$util.isInteger(message.light))
                return "light: integer expected";
        if (message.activity != null && message.hasOwnProperty("activity"))
            switch (message.activity) {
            default:
                return "activity: enum value expected";
            case 0:
            case 1:
            case 2:
                break;
            }
        if (message.steps != null && message.hasOwnProperty("steps"))
            if (!$util.isInteger(message.steps))
                return "steps: integer expected";
        if (message.particulateStaticObstructed != null && message.hasOwnProperty("particulateStaticObstructed"))
            if (typeof message.particulateStaticObstructed !== "boolean")
                return "particulateStaticObstructed: boolean expected";
        if (message.particulateDynamicObstructed != null && message.hasOwnProperty("particulateDynamicObstructed"))
            if (typeof message.particulateDynamicObstructed !== "boolean")
                return "particulateDynamicObstructed: boolean expected";
        if (message.particulateOutsideDetectionLimits != null && message.hasOwnProperty("particulateOutsideDetectionLimits"))
            if (typeof message.particulateOutsideDetectionLimits !== "boolean")
                return "particulateOutsideDetectionLimits: boolean expected";
        return null;
    };

    /**
     * Creates a SimpleSensorReading message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof SimpleSensorReading
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {SimpleSensorReading} SimpleSensorReading
     */
    SimpleSensorReading.fromObject = function fromObject(object) {
        if (object instanceof $root.SimpleSensorReading)
            return object;
        var message = new $root.SimpleSensorReading();
        if (object.index != null)
            message.index = object.index >>> 0;
        if (object.temperature != null)
            message.temperature = Number(object.temperature);
        if (object.humidity != null)
            message.humidity = Number(object.humidity);
        if (object.pressure != null)
            message.pressure = Number(object.pressure);
        if (object.gas != null)
            message.gas = Number(object.gas);
        if (object.pm2_5 != null)
            message.pm2_5 = Number(object.pm2_5);
        if (object.light != null)
            message.light = object.light >>> 0;
        switch (object.activity) {
        default:
            if (typeof object.activity === "number") {
                message.activity = object.activity;
                break;
            }
            break;
        case "STILL":
        case 0:
            message.activity = 0;
            break;
        case "WALK":
        case 1:
            message.activity = 1;
            break;
        case "RUN":
        case 2:
            message.activity = 2;
            break;
        }
        if (object.steps != null)
            message.steps = object.steps >>> 0;
        if (object.particulateStaticObstructed != null)
            message.particulateStaticObstructed = Boolean(object.particulateStaticObstructed);
        if (object.particulateDynamicObstructed != null)
            message.particulateDynamicObstructed = Boolean(object.particulateDynamicObstructed);
        if (object.particulateOutsideDetectionLimits != null)
            message.particulateOutsideDetectionLimits = Boolean(object.particulateOutsideDetectionLimits);
        return message;
    };

    /**
     * Creates a plain object from a SimpleSensorReading message. Also converts values to other types if specified.
     * @function toObject
     * @memberof SimpleSensorReading
     * @static
     * @param {SimpleSensorReading} message SimpleSensorReading
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    SimpleSensorReading.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.index = 0;
            object.temperature = 0;
            object.humidity = 0;
            object.pressure = 0;
            object.gas = 0;
            object.pm2_5 = 0;
            object.light = 0;
            object.activity = options.enums === String ? "STILL" : 0;
            object.steps = 0;
            object.particulateStaticObstructed = false;
            object.particulateDynamicObstructed = false;
            object.particulateOutsideDetectionLimits = false;
        }
        if (message.index != null && message.hasOwnProperty("index"))
            object.index = message.index;
        if (message.temperature != null && message.hasOwnProperty("temperature"))
            object.temperature = options.json && !isFinite(message.temperature) ? String(message.temperature) : message.temperature;
        if (message.humidity != null && message.hasOwnProperty("humidity"))
            object.humidity = options.json && !isFinite(message.humidity) ? String(message.humidity) : message.humidity;
        if (message.pressure != null && message.hasOwnProperty("pressure"))
            object.pressure = options.json && !isFinite(message.pressure) ? String(message.pressure) : message.pressure;
        if (message.gas != null && message.hasOwnProperty("gas"))
            object.gas = options.json && !isFinite(message.gas) ? String(message.gas) : message.gas;
        if (message.pm2_5 != null && message.hasOwnProperty("pm2_5"))
            object.pm2_5 = options.json && !isFinite(message.pm2_5) ? String(message.pm2_5) : message.pm2_5;
        if (message.light != null && message.hasOwnProperty("light"))
            object.light = message.light;
        if (message.activity != null && message.hasOwnProperty("activity"))
            object.activity = options.enums === String ? $root.Activity[message.activity] === undefined ? message.activity : $root.Activity[message.activity] : message.activity;
        if (message.steps != null && message.hasOwnProperty("steps"))
            object.steps = message.steps;
        if (message.particulateStaticObstructed != null && message.hasOwnProperty("particulateStaticObstructed"))
            object.particulateStaticObstructed = message.particulateStaticObstructed;
        if (message.particulateDynamicObstructed != null && message.hasOwnProperty("particulateDynamicObstructed"))
            object.particulateDynamicObstructed = message.particulateDynamicObstructed;
        if (message.particulateOutsideDetectionLimits != null && message.hasOwnProperty("particulateOutsideDetectionLimits"))
            object.particulateOutsideDetectionLimits = message.particulateOutsideDetectionLimits;
        return object;
    };

    /**
     * Converts this SimpleSensorReading to JSON.
     * @function toJSON
     * @memberof SimpleSensorReading
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    SimpleSensorReading.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for SimpleSensorReading
     * @function getTypeUrl
     * @memberof SimpleSensorReading
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    SimpleSensorReading.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/SimpleSensorReading";
    };

    return SimpleSensorReading;
})();

$root.SystemStatePacket = (function() {

    /**
     * Properties of a SystemStatePacket.
     * @exports ISystemStatePacket
     * @interface ISystemStatePacket
     * @property {boolean|null} [engageState] SystemStatePacket engageState
     * @property {IBatteryState|null} [battery] SystemStatePacket battery
     * @property {ISDCardState|null} [sdcard] SystemStatePacket sdcard
     * @property {IGPSData|null} [gpsData] SystemStatePacket gpsData
     * @property {ISimpleSensorReading|null} [sensors] SystemStatePacket sensors
     * @property {string|null} [firmwareVersion] SystemStatePacket firmwareVersion
     */

    /**
     * Constructs a new SystemStatePacket.
     * @exports SystemStatePacket
     * @classdesc Represents a SystemStatePacket.
     * @implements ISystemStatePacket
     * @constructor
     * @param {ISystemStatePacket=} [properties] Properties to set
     */
    function SystemStatePacket(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * SystemStatePacket engageState.
     * @member {boolean} engageState
     * @memberof SystemStatePacket
     * @instance
     */
    SystemStatePacket.prototype.engageState = false;

    /**
     * SystemStatePacket battery.
     * @member {IBatteryState|null|undefined} battery
     * @memberof SystemStatePacket
     * @instance
     */
    SystemStatePacket.prototype.battery = null;

    /**
     * SystemStatePacket sdcard.
     * @member {ISDCardState|null|undefined} sdcard
     * @memberof SystemStatePacket
     * @instance
     */
    SystemStatePacket.prototype.sdcard = null;

    /**
     * SystemStatePacket gpsData.
     * @member {IGPSData|null|undefined} gpsData
     * @memberof SystemStatePacket
     * @instance
     */
    SystemStatePacket.prototype.gpsData = null;

    /**
     * SystemStatePacket sensors.
     * @member {ISimpleSensorReading|null|undefined} sensors
     * @memberof SystemStatePacket
     * @instance
     */
    SystemStatePacket.prototype.sensors = null;

    /**
     * SystemStatePacket firmwareVersion.
     * @member {string} firmwareVersion
     * @memberof SystemStatePacket
     * @instance
     */
    SystemStatePacket.prototype.firmwareVersion = "";

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * SystemStatePacket _gpsData.
     * @member {"gpsData"|undefined} _gpsData
     * @memberof SystemStatePacket
     * @instance
     */
    Object.defineProperty(SystemStatePacket.prototype, "_gpsData", {
        get: $util.oneOfGetter($oneOfFields = ["gpsData"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new SystemStatePacket instance using the specified properties.
     * @function create
     * @memberof SystemStatePacket
     * @static
     * @param {ISystemStatePacket=} [properties] Properties to set
     * @returns {SystemStatePacket} SystemStatePacket instance
     */
    SystemStatePacket.create = function create(properties) {
        return new SystemStatePacket(properties);
    };

    /**
     * Encodes the specified SystemStatePacket message. Does not implicitly {@link SystemStatePacket.verify|verify} messages.
     * @function encode
     * @memberof SystemStatePacket
     * @static
     * @param {ISystemStatePacket} message SystemStatePacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SystemStatePacket.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.engageState != null && Object.hasOwnProperty.call(message, "engageState"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.engageState);
        if (message.battery != null && Object.hasOwnProperty.call(message, "battery"))
            $root.BatteryState.encode(message.battery, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.sdcard != null && Object.hasOwnProperty.call(message, "sdcard"))
            $root.SDCardState.encode(message.sdcard, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.gpsData != null && Object.hasOwnProperty.call(message, "gpsData"))
            $root.GPSData.encode(message.gpsData, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.sensors != null && Object.hasOwnProperty.call(message, "sensors"))
            $root.SimpleSensorReading.encode(message.sensors, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        if (message.firmwareVersion != null && Object.hasOwnProperty.call(message, "firmwareVersion"))
            writer.uint32(/* id 6, wireType 2 =*/50).string(message.firmwareVersion);
        return writer;
    };

    /**
     * Encodes the specified SystemStatePacket message, length delimited. Does not implicitly {@link SystemStatePacket.verify|verify} messages.
     * @function encodeDelimited
     * @memberof SystemStatePacket
     * @static
     * @param {ISystemStatePacket} message SystemStatePacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SystemStatePacket.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a SystemStatePacket message from the specified reader or buffer.
     * @function decode
     * @memberof SystemStatePacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {SystemStatePacket} SystemStatePacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SystemStatePacket.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.SystemStatePacket();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.engageState = reader.bool();
                    break;
                }
            case 2: {
                    message.battery = $root.BatteryState.decode(reader, reader.uint32());
                    break;
                }
            case 3: {
                    message.sdcard = $root.SDCardState.decode(reader, reader.uint32());
                    break;
                }
            case 4: {
                    message.gpsData = $root.GPSData.decode(reader, reader.uint32());
                    break;
                }
            case 5: {
                    message.sensors = $root.SimpleSensorReading.decode(reader, reader.uint32());
                    break;
                }
            case 6: {
                    message.firmwareVersion = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a SystemStatePacket message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof SystemStatePacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {SystemStatePacket} SystemStatePacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SystemStatePacket.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a SystemStatePacket message.
     * @function verify
     * @memberof SystemStatePacket
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    SystemStatePacket.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        var properties = {};
        if (message.engageState != null && message.hasOwnProperty("engageState"))
            if (typeof message.engageState !== "boolean")
                return "engageState: boolean expected";
        if (message.battery != null && message.hasOwnProperty("battery")) {
            var error = $root.BatteryState.verify(message.battery);
            if (error)
                return "battery." + error;
        }
        if (message.sdcard != null && message.hasOwnProperty("sdcard")) {
            var error = $root.SDCardState.verify(message.sdcard);
            if (error)
                return "sdcard." + error;
        }
        if (message.gpsData != null && message.hasOwnProperty("gpsData")) {
            properties._gpsData = 1;
            {
                var error = $root.GPSData.verify(message.gpsData);
                if (error)
                    return "gpsData." + error;
            }
        }
        if (message.sensors != null && message.hasOwnProperty("sensors")) {
            var error = $root.SimpleSensorReading.verify(message.sensors);
            if (error)
                return "sensors." + error;
        }
        if (message.firmwareVersion != null && message.hasOwnProperty("firmwareVersion"))
            if (!$util.isString(message.firmwareVersion))
                return "firmwareVersion: string expected";
        return null;
    };

    /**
     * Creates a SystemStatePacket message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof SystemStatePacket
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {SystemStatePacket} SystemStatePacket
     */
    SystemStatePacket.fromObject = function fromObject(object) {
        if (object instanceof $root.SystemStatePacket)
            return object;
        var message = new $root.SystemStatePacket();
        if (object.engageState != null)
            message.engageState = Boolean(object.engageState);
        if (object.battery != null) {
            if (typeof object.battery !== "object")
                throw TypeError(".SystemStatePacket.battery: object expected");
            message.battery = $root.BatteryState.fromObject(object.battery);
        }
        if (object.sdcard != null) {
            if (typeof object.sdcard !== "object")
                throw TypeError(".SystemStatePacket.sdcard: object expected");
            message.sdcard = $root.SDCardState.fromObject(object.sdcard);
        }
        if (object.gpsData != null) {
            if (typeof object.gpsData !== "object")
                throw TypeError(".SystemStatePacket.gpsData: object expected");
            message.gpsData = $root.GPSData.fromObject(object.gpsData);
        }
        if (object.sensors != null) {
            if (typeof object.sensors !== "object")
                throw TypeError(".SystemStatePacket.sensors: object expected");
            message.sensors = $root.SimpleSensorReading.fromObject(object.sensors);
        }
        if (object.firmwareVersion != null)
            message.firmwareVersion = String(object.firmwareVersion);
        return message;
    };

    /**
     * Creates a plain object from a SystemStatePacket message. Also converts values to other types if specified.
     * @function toObject
     * @memberof SystemStatePacket
     * @static
     * @param {SystemStatePacket} message SystemStatePacket
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    SystemStatePacket.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.engageState = false;
            object.battery = null;
            object.sdcard = null;
            object.sensors = null;
            object.firmwareVersion = "";
        }
        if (message.engageState != null && message.hasOwnProperty("engageState"))
            object.engageState = message.engageState;
        if (message.battery != null && message.hasOwnProperty("battery"))
            object.battery = $root.BatteryState.toObject(message.battery, options);
        if (message.sdcard != null && message.hasOwnProperty("sdcard"))
            object.sdcard = $root.SDCardState.toObject(message.sdcard, options);
        if (message.gpsData != null && message.hasOwnProperty("gpsData")) {
            object.gpsData = $root.GPSData.toObject(message.gpsData, options);
            if (options.oneofs)
                object._gpsData = "gpsData";
        }
        if (message.sensors != null && message.hasOwnProperty("sensors"))
            object.sensors = $root.SimpleSensorReading.toObject(message.sensors, options);
        if (message.firmwareVersion != null && message.hasOwnProperty("firmwareVersion"))
            object.firmwareVersion = message.firmwareVersion;
        return object;
    };

    /**
     * Converts this SystemStatePacket to JSON.
     * @function toJSON
     * @memberof SystemStatePacket
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    SystemStatePacket.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for SystemStatePacket
     * @function getTypeUrl
     * @memberof SystemStatePacket
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    SystemStatePacket.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/SystemStatePacket";
    };

    return SystemStatePacket;
})();

/**
 * PeripheralType enum.
 * @exports PeripheralType
 * @enum {number}
 * @property {number} PERIPHERAL_SATCOM=0 PERIPHERAL_SATCOM value
 * @property {number} PERIPHERAL_DETACHMENT=1 PERIPHERAL_DETACHMENT value
 */
$root.PeripheralType = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "PERIPHERAL_SATCOM"] = 0;
    values[valuesById[1] = "PERIPHERAL_DETACHMENT"] = 1;
    return values;
})();

$root.PeripheralPacket = (function() {

    /**
     * Properties of a PeripheralPacket.
     * @exports IPeripheralPacket
     * @interface IPeripheralPacket
     * @property {Uint8Array|null} [macAddress] PeripheralPacket macAddress
     * @property {PeripheralType|null} [type] PeripheralPacket type
     */

    /**
     * Constructs a new PeripheralPacket.
     * @exports PeripheralPacket
     * @classdesc Represents a PeripheralPacket.
     * @implements IPeripheralPacket
     * @constructor
     * @param {IPeripheralPacket=} [properties] Properties to set
     */
    function PeripheralPacket(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PeripheralPacket macAddress.
     * @member {Uint8Array} macAddress
     * @memberof PeripheralPacket
     * @instance
     */
    PeripheralPacket.prototype.macAddress = $util.newBuffer([]);

    /**
     * PeripheralPacket type.
     * @member {PeripheralType} type
     * @memberof PeripheralPacket
     * @instance
     */
    PeripheralPacket.prototype.type = 0;

    /**
     * Creates a new PeripheralPacket instance using the specified properties.
     * @function create
     * @memberof PeripheralPacket
     * @static
     * @param {IPeripheralPacket=} [properties] Properties to set
     * @returns {PeripheralPacket} PeripheralPacket instance
     */
    PeripheralPacket.create = function create(properties) {
        return new PeripheralPacket(properties);
    };

    /**
     * Encodes the specified PeripheralPacket message. Does not implicitly {@link PeripheralPacket.verify|verify} messages.
     * @function encode
     * @memberof PeripheralPacket
     * @static
     * @param {IPeripheralPacket} message PeripheralPacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PeripheralPacket.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.macAddress != null && Object.hasOwnProperty.call(message, "macAddress"))
            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.macAddress);
        if (message.type != null && Object.hasOwnProperty.call(message, "type"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.type);
        return writer;
    };

    /**
     * Encodes the specified PeripheralPacket message, length delimited. Does not implicitly {@link PeripheralPacket.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PeripheralPacket
     * @static
     * @param {IPeripheralPacket} message PeripheralPacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PeripheralPacket.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PeripheralPacket message from the specified reader or buffer.
     * @function decode
     * @memberof PeripheralPacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PeripheralPacket} PeripheralPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PeripheralPacket.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PeripheralPacket();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.macAddress = reader.bytes();
                    break;
                }
            case 2: {
                    message.type = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a PeripheralPacket message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PeripheralPacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PeripheralPacket} PeripheralPacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PeripheralPacket.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PeripheralPacket message.
     * @function verify
     * @memberof PeripheralPacket
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PeripheralPacket.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.macAddress != null && message.hasOwnProperty("macAddress"))
            if (!(message.macAddress && typeof message.macAddress.length === "number" || $util.isString(message.macAddress)))
                return "macAddress: buffer expected";
        if (message.type != null && message.hasOwnProperty("type"))
            switch (message.type) {
            default:
                return "type: enum value expected";
            case 0:
            case 1:
                break;
            }
        return null;
    };

    /**
     * Creates a PeripheralPacket message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PeripheralPacket
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PeripheralPacket} PeripheralPacket
     */
    PeripheralPacket.fromObject = function fromObject(object) {
        if (object instanceof $root.PeripheralPacket)
            return object;
        var message = new $root.PeripheralPacket();
        if (object.macAddress != null)
            if (typeof object.macAddress === "string")
                $util.base64.decode(object.macAddress, message.macAddress = $util.newBuffer($util.base64.length(object.macAddress)), 0);
            else if (object.macAddress.length >= 0)
                message.macAddress = object.macAddress;
        switch (object.type) {
        default:
            if (typeof object.type === "number") {
                message.type = object.type;
                break;
            }
            break;
        case "PERIPHERAL_SATCOM":
        case 0:
            message.type = 0;
            break;
        case "PERIPHERAL_DETACHMENT":
        case 1:
            message.type = 1;
            break;
        }
        return message;
    };

    /**
     * Creates a plain object from a PeripheralPacket message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PeripheralPacket
     * @static
     * @param {PeripheralPacket} message PeripheralPacket
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PeripheralPacket.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            if (options.bytes === String)
                object.macAddress = "";
            else {
                object.macAddress = [];
                if (options.bytes !== Array)
                    object.macAddress = $util.newBuffer(object.macAddress);
            }
            object.type = options.enums === String ? "PERIPHERAL_SATCOM" : 0;
        }
        if (message.macAddress != null && message.hasOwnProperty("macAddress"))
            object.macAddress = options.bytes === String ? $util.base64.encode(message.macAddress, 0, message.macAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.macAddress) : message.macAddress;
        if (message.type != null && message.hasOwnProperty("type"))
            object.type = options.enums === String ? $root.PeripheralType[message.type] === undefined ? message.type : $root.PeripheralType[message.type] : message.type;
        return object;
    };

    /**
     * Converts this PeripheralPacket to JSON.
     * @function toJSON
     * @memberof PeripheralPacket
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PeripheralPacket.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for PeripheralPacket
     * @function getTypeUrl
     * @memberof PeripheralPacket
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PeripheralPacket.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PeripheralPacket";
    };

    return PeripheralPacket;
})();

$root.PeripheralInfo = (function() {

    /**
     * Properties of a PeripheralInfo.
     * @exports IPeripheralInfo
     * @interface IPeripheralInfo
     * @property {Array.<string>|null} [deviceUids] PeripheralInfo deviceUids
     */

    /**
     * Constructs a new PeripheralInfo.
     * @exports PeripheralInfo
     * @classdesc Represents a PeripheralInfo.
     * @implements IPeripheralInfo
     * @constructor
     * @param {IPeripheralInfo=} [properties] Properties to set
     */
    function PeripheralInfo(properties) {
        this.deviceUids = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PeripheralInfo deviceUids.
     * @member {Array.<string>} deviceUids
     * @memberof PeripheralInfo
     * @instance
     */
    PeripheralInfo.prototype.deviceUids = $util.emptyArray;

    /**
     * Creates a new PeripheralInfo instance using the specified properties.
     * @function create
     * @memberof PeripheralInfo
     * @static
     * @param {IPeripheralInfo=} [properties] Properties to set
     * @returns {PeripheralInfo} PeripheralInfo instance
     */
    PeripheralInfo.create = function create(properties) {
        return new PeripheralInfo(properties);
    };

    /**
     * Encodes the specified PeripheralInfo message. Does not implicitly {@link PeripheralInfo.verify|verify} messages.
     * @function encode
     * @memberof PeripheralInfo
     * @static
     * @param {IPeripheralInfo} message PeripheralInfo message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PeripheralInfo.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.deviceUids != null && message.deviceUids.length)
            for (var i = 0; i < message.deviceUids.length; ++i)
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.deviceUids[i]);
        return writer;
    };

    /**
     * Encodes the specified PeripheralInfo message, length delimited. Does not implicitly {@link PeripheralInfo.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PeripheralInfo
     * @static
     * @param {IPeripheralInfo} message PeripheralInfo message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PeripheralInfo.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PeripheralInfo message from the specified reader or buffer.
     * @function decode
     * @memberof PeripheralInfo
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PeripheralInfo} PeripheralInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PeripheralInfo.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PeripheralInfo();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    if (!(message.deviceUids && message.deviceUids.length))
                        message.deviceUids = [];
                    message.deviceUids.push(reader.string());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a PeripheralInfo message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PeripheralInfo
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PeripheralInfo} PeripheralInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PeripheralInfo.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PeripheralInfo message.
     * @function verify
     * @memberof PeripheralInfo
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PeripheralInfo.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.deviceUids != null && message.hasOwnProperty("deviceUids")) {
            if (!Array.isArray(message.deviceUids))
                return "deviceUids: array expected";
            for (var i = 0; i < message.deviceUids.length; ++i)
                if (!$util.isString(message.deviceUids[i]))
                    return "deviceUids: string[] expected";
        }
        return null;
    };

    /**
     * Creates a PeripheralInfo message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PeripheralInfo
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PeripheralInfo} PeripheralInfo
     */
    PeripheralInfo.fromObject = function fromObject(object) {
        if (object instanceof $root.PeripheralInfo)
            return object;
        var message = new $root.PeripheralInfo();
        if (object.deviceUids) {
            if (!Array.isArray(object.deviceUids))
                throw TypeError(".PeripheralInfo.deviceUids: array expected");
            message.deviceUids = [];
            for (var i = 0; i < object.deviceUids.length; ++i)
                message.deviceUids[i] = String(object.deviceUids[i]);
        }
        return message;
    };

    /**
     * Creates a plain object from a PeripheralInfo message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PeripheralInfo
     * @static
     * @param {PeripheralInfo} message PeripheralInfo
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PeripheralInfo.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.deviceUids = [];
        if (message.deviceUids && message.deviceUids.length) {
            object.deviceUids = [];
            for (var j = 0; j < message.deviceUids.length; ++j)
                object.deviceUids[j] = message.deviceUids[j];
        }
        return object;
    };

    /**
     * Converts this PeripheralInfo to JSON.
     * @function toJSON
     * @memberof PeripheralInfo
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PeripheralInfo.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for PeripheralInfo
     * @function getTypeUrl
     * @memberof PeripheralInfo
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PeripheralInfo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PeripheralInfo";
    };

    return PeripheralInfo;
})();

$root.BlePacket = (function() {

    /**
     * Properties of a BlePacket.
     * @exports IBlePacket
     * @interface IBlePacket
     * @property {IPacketHeader|null} [header] BlePacket header
     * @property {IScheduleConfigPacket|null} [scheduleConfigPacket] BlePacket scheduleConfigPacket
     * @property {ISystemStatePacket|null} [systemStatePacket] BlePacket systemStatePacket
     * @property {IRadioConfigPacket|null} [radioConfigPacket] BlePacket radioConfigPacket
     * @property {IPeripheralPacket|null} [peripheralPacket] BlePacket peripheralPacket
     * @property {IPeripheralInfo|null} [peripheralInfo] BlePacket peripheralInfo
     */

    /**
     * Constructs a new BlePacket.
     * @exports BlePacket
     * @classdesc Represents a BlePacket.
     * @implements IBlePacket
     * @constructor
     * @param {IBlePacket=} [properties] Properties to set
     */
    function BlePacket(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * BlePacket header.
     * @member {IPacketHeader|null|undefined} header
     * @memberof BlePacket
     * @instance
     */
    BlePacket.prototype.header = null;

    /**
     * BlePacket scheduleConfigPacket.
     * @member {IScheduleConfigPacket|null|undefined} scheduleConfigPacket
     * @memberof BlePacket
     * @instance
     */
    BlePacket.prototype.scheduleConfigPacket = null;

    /**
     * BlePacket systemStatePacket.
     * @member {ISystemStatePacket|null|undefined} systemStatePacket
     * @memberof BlePacket
     * @instance
     */
    BlePacket.prototype.systemStatePacket = null;

    /**
     * BlePacket radioConfigPacket.
     * @member {IRadioConfigPacket|null|undefined} radioConfigPacket
     * @memberof BlePacket
     * @instance
     */
    BlePacket.prototype.radioConfigPacket = null;

    /**
     * BlePacket peripheralPacket.
     * @member {IPeripheralPacket|null|undefined} peripheralPacket
     * @memberof BlePacket
     * @instance
     */
    BlePacket.prototype.peripheralPacket = null;

    /**
     * BlePacket peripheralInfo.
     * @member {IPeripheralInfo|null|undefined} peripheralInfo
     * @memberof BlePacket
     * @instance
     */
    BlePacket.prototype.peripheralInfo = null;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * BlePacket payload.
     * @member {"scheduleConfigPacket"|"systemStatePacket"|"radioConfigPacket"|"peripheralPacket"|"peripheralInfo"|undefined} payload
     * @memberof BlePacket
     * @instance
     */
    Object.defineProperty(BlePacket.prototype, "payload", {
        get: $util.oneOfGetter($oneOfFields = ["scheduleConfigPacket", "systemStatePacket", "radioConfigPacket", "peripheralPacket", "peripheralInfo"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new BlePacket instance using the specified properties.
     * @function create
     * @memberof BlePacket
     * @static
     * @param {IBlePacket=} [properties] Properties to set
     * @returns {BlePacket} BlePacket instance
     */
    BlePacket.create = function create(properties) {
        return new BlePacket(properties);
    };

    /**
     * Encodes the specified BlePacket message. Does not implicitly {@link BlePacket.verify|verify} messages.
     * @function encode
     * @memberof BlePacket
     * @static
     * @param {IBlePacket} message BlePacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BlePacket.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.header != null && Object.hasOwnProperty.call(message, "header"))
            $root.PacketHeader.encode(message.header, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.scheduleConfigPacket != null && Object.hasOwnProperty.call(message, "scheduleConfigPacket"))
            $root.ScheduleConfigPacket.encode(message.scheduleConfigPacket, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.systemStatePacket != null && Object.hasOwnProperty.call(message, "systemStatePacket"))
            $root.SystemStatePacket.encode(message.systemStatePacket, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.radioConfigPacket != null && Object.hasOwnProperty.call(message, "radioConfigPacket"))
            $root.RadioConfigPacket.encode(message.radioConfigPacket, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.peripheralPacket != null && Object.hasOwnProperty.call(message, "peripheralPacket"))
            $root.PeripheralPacket.encode(message.peripheralPacket, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        if (message.peripheralInfo != null && Object.hasOwnProperty.call(message, "peripheralInfo"))
            $root.PeripheralInfo.encode(message.peripheralInfo, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified BlePacket message, length delimited. Does not implicitly {@link BlePacket.verify|verify} messages.
     * @function encodeDelimited
     * @memberof BlePacket
     * @static
     * @param {IBlePacket} message BlePacket message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BlePacket.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a BlePacket message from the specified reader or buffer.
     * @function decode
     * @memberof BlePacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {BlePacket} BlePacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BlePacket.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.BlePacket();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.header = $root.PacketHeader.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    message.scheduleConfigPacket = $root.ScheduleConfigPacket.decode(reader, reader.uint32());
                    break;
                }
            case 3: {
                    message.systemStatePacket = $root.SystemStatePacket.decode(reader, reader.uint32());
                    break;
                }
            case 4: {
                    message.radioConfigPacket = $root.RadioConfigPacket.decode(reader, reader.uint32());
                    break;
                }
            case 5: {
                    message.peripheralPacket = $root.PeripheralPacket.decode(reader, reader.uint32());
                    break;
                }
            case 6: {
                    message.peripheralInfo = $root.PeripheralInfo.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a BlePacket message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof BlePacket
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {BlePacket} BlePacket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BlePacket.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a BlePacket message.
     * @function verify
     * @memberof BlePacket
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    BlePacket.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        var properties = {};
        if (message.header != null && message.hasOwnProperty("header")) {
            var error = $root.PacketHeader.verify(message.header);
            if (error)
                return "header." + error;
        }
        if (message.scheduleConfigPacket != null && message.hasOwnProperty("scheduleConfigPacket")) {
            properties.payload = 1;
            {
                var error = $root.ScheduleConfigPacket.verify(message.scheduleConfigPacket);
                if (error)
                    return "scheduleConfigPacket." + error;
            }
        }
        if (message.systemStatePacket != null && message.hasOwnProperty("systemStatePacket")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                var error = $root.SystemStatePacket.verify(message.systemStatePacket);
                if (error)
                    return "systemStatePacket." + error;
            }
        }
        if (message.radioConfigPacket != null && message.hasOwnProperty("radioConfigPacket")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                var error = $root.RadioConfigPacket.verify(message.radioConfigPacket);
                if (error)
                    return "radioConfigPacket." + error;
            }
        }
        if (message.peripheralPacket != null && message.hasOwnProperty("peripheralPacket")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                var error = $root.PeripheralPacket.verify(message.peripheralPacket);
                if (error)
                    return "peripheralPacket." + error;
            }
        }
        if (message.peripheralInfo != null && message.hasOwnProperty("peripheralInfo")) {
            if (properties.payload === 1)
                return "payload: multiple values";
            properties.payload = 1;
            {
                var error = $root.PeripheralInfo.verify(message.peripheralInfo);
                if (error)
                    return "peripheralInfo." + error;
            }
        }
        return null;
    };

    /**
     * Creates a BlePacket message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof BlePacket
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {BlePacket} BlePacket
     */
    BlePacket.fromObject = function fromObject(object) {
        if (object instanceof $root.BlePacket)
            return object;
        var message = new $root.BlePacket();
        if (object.header != null) {
            if (typeof object.header !== "object")
                throw TypeError(".BlePacket.header: object expected");
            message.header = $root.PacketHeader.fromObject(object.header);
        }
        if (object.scheduleConfigPacket != null) {
            if (typeof object.scheduleConfigPacket !== "object")
                throw TypeError(".BlePacket.scheduleConfigPacket: object expected");
            message.scheduleConfigPacket = $root.ScheduleConfigPacket.fromObject(object.scheduleConfigPacket);
        }
        if (object.systemStatePacket != null) {
            if (typeof object.systemStatePacket !== "object")
                throw TypeError(".BlePacket.systemStatePacket: object expected");
            message.systemStatePacket = $root.SystemStatePacket.fromObject(object.systemStatePacket);
        }
        if (object.radioConfigPacket != null) {
            if (typeof object.radioConfigPacket !== "object")
                throw TypeError(".BlePacket.radioConfigPacket: object expected");
            message.radioConfigPacket = $root.RadioConfigPacket.fromObject(object.radioConfigPacket);
        }
        if (object.peripheralPacket != null) {
            if (typeof object.peripheralPacket !== "object")
                throw TypeError(".BlePacket.peripheralPacket: object expected");
            message.peripheralPacket = $root.PeripheralPacket.fromObject(object.peripheralPacket);
        }
        if (object.peripheralInfo != null) {
            if (typeof object.peripheralInfo !== "object")
                throw TypeError(".BlePacket.peripheralInfo: object expected");
            message.peripheralInfo = $root.PeripheralInfo.fromObject(object.peripheralInfo);
        }
        return message;
    };

    /**
     * Creates a plain object from a BlePacket message. Also converts values to other types if specified.
     * @function toObject
     * @memberof BlePacket
     * @static
     * @param {BlePacket} message BlePacket
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    BlePacket.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults)
            object.header = null;
        if (message.header != null && message.hasOwnProperty("header"))
            object.header = $root.PacketHeader.toObject(message.header, options);
        if (message.scheduleConfigPacket != null && message.hasOwnProperty("scheduleConfigPacket")) {
            object.scheduleConfigPacket = $root.ScheduleConfigPacket.toObject(message.scheduleConfigPacket, options);
            if (options.oneofs)
                object.payload = "scheduleConfigPacket";
        }
        if (message.systemStatePacket != null && message.hasOwnProperty("systemStatePacket")) {
            object.systemStatePacket = $root.SystemStatePacket.toObject(message.systemStatePacket, options);
            if (options.oneofs)
                object.payload = "systemStatePacket";
        }
        if (message.radioConfigPacket != null && message.hasOwnProperty("radioConfigPacket")) {
            object.radioConfigPacket = $root.RadioConfigPacket.toObject(message.radioConfigPacket, options);
            if (options.oneofs)
                object.payload = "radioConfigPacket";
        }
        if (message.peripheralPacket != null && message.hasOwnProperty("peripheralPacket")) {
            object.peripheralPacket = $root.PeripheralPacket.toObject(message.peripheralPacket, options);
            if (options.oneofs)
                object.payload = "peripheralPacket";
        }
        if (message.peripheralInfo != null && message.hasOwnProperty("peripheralInfo")) {
            object.peripheralInfo = $root.PeripheralInfo.toObject(message.peripheralInfo, options);
            if (options.oneofs)
                object.payload = "peripheralInfo";
        }
        return object;
    };

    /**
     * Converts this BlePacket to JSON.
     * @function toJSON
     * @memberof BlePacket
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    BlePacket.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for BlePacket
     * @function getTypeUrl
     * @memberof BlePacket
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    BlePacket.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/BlePacket";
    };

    return BlePacket;
})();

module.exports = $root;
