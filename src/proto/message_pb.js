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
        }
        if (message.devEui != null && message.hasOwnProperty("devEui"))
            object.devEui = options.bytes === String ? $util.base64.encode(message.devEui, 0, message.devEui.length) : options.bytes === Array ? Array.prototype.slice.call(message.devEui) : message.devEui;
        if (message.joinEui != null && message.hasOwnProperty("joinEui"))
            object.joinEui = options.bytes === String ? $util.base64.encode(message.joinEui, 0, message.joinEui.length) : options.bytes === Array ? Array.prototype.slice.call(message.joinEui) : message.joinEui;
        if (message.appKey != null && message.hasOwnProperty("appKey"))
            object.appKey = options.bytes === String ? $util.base64.encode(message.appKey, 0, message.appKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.appKey) : message.appKey;
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

$root.RadioConfigPacket = (function() {

    /**
     * Properties of a RadioConfigPacket.
     * @exports IRadioConfigPacket
     * @interface IRadioConfigPacket
     * @property {boolean|null} [enabled] RadioConfigPacket enabled
     * @property {RadioRegion|null} [region] RadioConfigPacket region
     * @property {RadioAuth|null} [auth] RadioConfigPacket auth
     * @property {IRadioOTAA|null} [otaa] RadioConfigPacket otaa
     * @property {IRadioABP|null} [abp] RadioConfigPacket abp
     * @property {number|null} [transmitIntervalMin] RadioConfigPacket transmitIntervalMin
     * @property {boolean|null} [txOnlyOnNewGpsFix] RadioConfigPacket txOnlyOnNewGpsFix
     * @property {number|null} [txPowerDbm] RadioConfigPacket txPowerDbm
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
     * RadioConfigPacket enabled.
     * @member {boolean} enabled
     * @memberof RadioConfigPacket
     * @instance
     */
    RadioConfigPacket.prototype.enabled = false;

    /**
     * RadioConfigPacket region.
     * @member {RadioRegion} region
     * @memberof RadioConfigPacket
     * @instance
     */
    RadioConfigPacket.prototype.region = 0;

    /**
     * RadioConfigPacket auth.
     * @member {RadioAuth} auth
     * @memberof RadioConfigPacket
     * @instance
     */
    RadioConfigPacket.prototype.auth = 0;

    /**
     * RadioConfigPacket otaa.
     * @member {IRadioOTAA|null|undefined} otaa
     * @memberof RadioConfigPacket
     * @instance
     */
    RadioConfigPacket.prototype.otaa = null;

    /**
     * RadioConfigPacket abp.
     * @member {IRadioABP|null|undefined} abp
     * @memberof RadioConfigPacket
     * @instance
     */
    RadioConfigPacket.prototype.abp = null;

    /**
     * RadioConfigPacket transmitIntervalMin.
     * @member {number} transmitIntervalMin
     * @memberof RadioConfigPacket
     * @instance
     */
    RadioConfigPacket.prototype.transmitIntervalMin = 0;

    /**
     * RadioConfigPacket txOnlyOnNewGpsFix.
     * @member {boolean} txOnlyOnNewGpsFix
     * @memberof RadioConfigPacket
     * @instance
     */
    RadioConfigPacket.prototype.txOnlyOnNewGpsFix = false;

    /**
     * RadioConfigPacket txPowerDbm.
     * @member {number} txPowerDbm
     * @memberof RadioConfigPacket
     * @instance
     */
    RadioConfigPacket.prototype.txPowerDbm = 0;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * RadioConfigPacket credentials.
     * @member {"otaa"|"abp"|undefined} credentials
     * @memberof RadioConfigPacket
     * @instance
     */
    Object.defineProperty(RadioConfigPacket.prototype, "credentials", {
        get: $util.oneOfGetter($oneOfFields = ["otaa", "abp"]),
        set: $util.oneOfSetter($oneOfFields)
    });

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
        if (message.enabled != null && Object.hasOwnProperty.call(message, "enabled"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.enabled);
        if (message.region != null && Object.hasOwnProperty.call(message, "region"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.region);
        if (message.auth != null && Object.hasOwnProperty.call(message, "auth"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.auth);
        if (message.otaa != null && Object.hasOwnProperty.call(message, "otaa"))
            $root.RadioOTAA.encode(message.otaa, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.abp != null && Object.hasOwnProperty.call(message, "abp"))
            $root.RadioABP.encode(message.abp, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        if (message.transmitIntervalMin != null && Object.hasOwnProperty.call(message, "transmitIntervalMin"))
            writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.transmitIntervalMin);
        if (message.txOnlyOnNewGpsFix != null && Object.hasOwnProperty.call(message, "txOnlyOnNewGpsFix"))
            writer.uint32(/* id 7, wireType 0 =*/56).bool(message.txOnlyOnNewGpsFix);
        if (message.txPowerDbm != null && Object.hasOwnProperty.call(message, "txPowerDbm"))
            writer.uint32(/* id 8, wireType 0 =*/64).int32(message.txPowerDbm);
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
                    message.enabled = reader.bool();
                    break;
                }
            case 2: {
                    message.region = reader.int32();
                    break;
                }
            case 3: {
                    message.auth = reader.int32();
                    break;
                }
            case 4: {
                    message.otaa = $root.RadioOTAA.decode(reader, reader.uint32());
                    break;
                }
            case 5: {
                    message.abp = $root.RadioABP.decode(reader, reader.uint32());
                    break;
                }
            case 6: {
                    message.transmitIntervalMin = reader.uint32();
                    break;
                }
            case 7: {
                    message.txOnlyOnNewGpsFix = reader.bool();
                    break;
                }
            case 8: {
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
        var properties = {};
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            if (typeof message.enabled !== "boolean")
                return "enabled: boolean expected";
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
        if (object.enabled != null)
            message.enabled = Boolean(object.enabled);
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
                throw TypeError(".RadioConfigPacket.otaa: object expected");
            message.otaa = $root.RadioOTAA.fromObject(object.otaa);
        }
        if (object.abp != null) {
            if (typeof object.abp !== "object")
                throw TypeError(".RadioConfigPacket.abp: object expected");
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
            object.enabled = false;
            object.region = options.enums === String ? "REGION_US915" : 0;
            object.auth = options.enums === String ? "AUTH_OTAA" : 0;
            object.transmitIntervalMin = 0;
            object.txOnlyOnNewGpsFix = false;
            object.txPowerDbm = 0;
        }
        if (message.enabled != null && message.hasOwnProperty("enabled"))
            object.enabled = message.enabled;
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

$root.ScheduledConfig = (function() {

    /**
     * Properties of a ScheduledConfig.
     * @exports IScheduledConfig
     * @interface IScheduledConfig
     * @property {ITimeWindow|null} [window] ScheduledConfig window
     * @property {ISamplingConfig|null} [light] ScheduledConfig light
     * @property {ISamplingConfig|null} [environmental] ScheduledConfig environmental
     * @property {ISamplingConfig|null} [particulate] ScheduledConfig particulate
     * @property {IGPSConfig|null} [gps] ScheduledConfig gps
     * @property {IMicrophoneConfig|null} [microphone] ScheduledConfig microphone
     * @property {IAccelerometerConfig|null} [accelerometer] ScheduledConfig accelerometer
     * @property {boolean|null} [lorawanEnabled] ScheduledConfig lorawanEnabled
     * @property {number|null} [lorawanSendIntervalMin] ScheduledConfig lorawanSendIntervalMin
     * @property {IMagnetometerConfig|null} [magnetometer] ScheduledConfig magnetometer
     */

    /**
     * Constructs a new ScheduledConfig.
     * @exports ScheduledConfig
     * @classdesc Represents a ScheduledConfig.
     * @implements IScheduledConfig
     * @constructor
     * @param {IScheduledConfig=} [properties] Properties to set
     */
    function ScheduledConfig(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ScheduledConfig window.
     * @member {ITimeWindow|null|undefined} window
     * @memberof ScheduledConfig
     * @instance
     */
    ScheduledConfig.prototype.window = null;

    /**
     * ScheduledConfig light.
     * @member {ISamplingConfig|null|undefined} light
     * @memberof ScheduledConfig
     * @instance
     */
    ScheduledConfig.prototype.light = null;

    /**
     * ScheduledConfig environmental.
     * @member {ISamplingConfig|null|undefined} environmental
     * @memberof ScheduledConfig
     * @instance
     */
    ScheduledConfig.prototype.environmental = null;

    /**
     * ScheduledConfig particulate.
     * @member {ISamplingConfig|null|undefined} particulate
     * @memberof ScheduledConfig
     * @instance
     */
    ScheduledConfig.prototype.particulate = null;

    /**
     * ScheduledConfig gps.
     * @member {IGPSConfig|null|undefined} gps
     * @memberof ScheduledConfig
     * @instance
     */
    ScheduledConfig.prototype.gps = null;

    /**
     * ScheduledConfig microphone.
     * @member {IMicrophoneConfig|null|undefined} microphone
     * @memberof ScheduledConfig
     * @instance
     */
    ScheduledConfig.prototype.microphone = null;

    /**
     * ScheduledConfig accelerometer.
     * @member {IAccelerometerConfig|null|undefined} accelerometer
     * @memberof ScheduledConfig
     * @instance
     */
    ScheduledConfig.prototype.accelerometer = null;

    /**
     * ScheduledConfig lorawanEnabled.
     * @member {boolean} lorawanEnabled
     * @memberof ScheduledConfig
     * @instance
     */
    ScheduledConfig.prototype.lorawanEnabled = false;

    /**
     * ScheduledConfig lorawanSendIntervalMin.
     * @member {number} lorawanSendIntervalMin
     * @memberof ScheduledConfig
     * @instance
     */
    ScheduledConfig.prototype.lorawanSendIntervalMin = 0;

    /**
     * ScheduledConfig magnetometer.
     * @member {IMagnetometerConfig|null|undefined} magnetometer
     * @memberof ScheduledConfig
     * @instance
     */
    ScheduledConfig.prototype.magnetometer = null;

    /**
     * Creates a new ScheduledConfig instance using the specified properties.
     * @function create
     * @memberof ScheduledConfig
     * @static
     * @param {IScheduledConfig=} [properties] Properties to set
     * @returns {ScheduledConfig} ScheduledConfig instance
     */
    ScheduledConfig.create = function create(properties) {
        return new ScheduledConfig(properties);
    };

    /**
     * Encodes the specified ScheduledConfig message. Does not implicitly {@link ScheduledConfig.verify|verify} messages.
     * @function encode
     * @memberof ScheduledConfig
     * @static
     * @param {IScheduledConfig} message ScheduledConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ScheduledConfig.encode = function encode(message, writer) {
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
        if (message.magnetometer != null && Object.hasOwnProperty.call(message, "magnetometer"))
            $root.MagnetometerConfig.encode(message.magnetometer, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified ScheduledConfig message, length delimited. Does not implicitly {@link ScheduledConfig.verify|verify} messages.
     * @function encodeDelimited
     * @memberof ScheduledConfig
     * @static
     * @param {IScheduledConfig} message ScheduledConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ScheduledConfig.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ScheduledConfig message from the specified reader or buffer.
     * @function decode
     * @memberof ScheduledConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {ScheduledConfig} ScheduledConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ScheduledConfig.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ScheduledConfig();
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
     * Decodes a ScheduledConfig message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof ScheduledConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {ScheduledConfig} ScheduledConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ScheduledConfig.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ScheduledConfig message.
     * @function verify
     * @memberof ScheduledConfig
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ScheduledConfig.verify = function verify(message) {
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
        if (message.magnetometer != null && message.hasOwnProperty("magnetometer")) {
            var error = $root.MagnetometerConfig.verify(message.magnetometer);
            if (error)
                return "magnetometer." + error;
        }
        return null;
    };

    /**
     * Creates a ScheduledConfig message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof ScheduledConfig
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {ScheduledConfig} ScheduledConfig
     */
    ScheduledConfig.fromObject = function fromObject(object) {
        if (object instanceof $root.ScheduledConfig)
            return object;
        var message = new $root.ScheduledConfig();
        if (object.window != null) {
            if (typeof object.window !== "object")
                throw TypeError(".ScheduledConfig.window: object expected");
            message.window = $root.TimeWindow.fromObject(object.window);
        }
        if (object.light != null) {
            if (typeof object.light !== "object")
                throw TypeError(".ScheduledConfig.light: object expected");
            message.light = $root.SamplingConfig.fromObject(object.light);
        }
        if (object.environmental != null) {
            if (typeof object.environmental !== "object")
                throw TypeError(".ScheduledConfig.environmental: object expected");
            message.environmental = $root.SamplingConfig.fromObject(object.environmental);
        }
        if (object.particulate != null) {
            if (typeof object.particulate !== "object")
                throw TypeError(".ScheduledConfig.particulate: object expected");
            message.particulate = $root.SamplingConfig.fromObject(object.particulate);
        }
        if (object.gps != null) {
            if (typeof object.gps !== "object")
                throw TypeError(".ScheduledConfig.gps: object expected");
            message.gps = $root.GPSConfig.fromObject(object.gps);
        }
        if (object.microphone != null) {
            if (typeof object.microphone !== "object")
                throw TypeError(".ScheduledConfig.microphone: object expected");
            message.microphone = $root.MicrophoneConfig.fromObject(object.microphone);
        }
        if (object.accelerometer != null) {
            if (typeof object.accelerometer !== "object")
                throw TypeError(".ScheduledConfig.accelerometer: object expected");
            message.accelerometer = $root.AccelerometerConfig.fromObject(object.accelerometer);
        }
        if (object.lorawanEnabled != null)
            message.lorawanEnabled = Boolean(object.lorawanEnabled);
        if (object.lorawanSendIntervalMin != null)
            message.lorawanSendIntervalMin = object.lorawanSendIntervalMin >>> 0;
        if (object.magnetometer != null) {
            if (typeof object.magnetometer !== "object")
                throw TypeError(".ScheduledConfig.magnetometer: object expected");
            message.magnetometer = $root.MagnetometerConfig.fromObject(object.magnetometer);
        }
        return message;
    };

    /**
     * Creates a plain object from a ScheduledConfig message. Also converts values to other types if specified.
     * @function toObject
     * @memberof ScheduledConfig
     * @static
     * @param {ScheduledConfig} message ScheduledConfig
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ScheduledConfig.toObject = function toObject(message, options) {
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
        if (message.magnetometer != null && message.hasOwnProperty("magnetometer"))
            object.magnetometer = $root.MagnetometerConfig.toObject(message.magnetometer, options);
        return object;
    };

    /**
     * Converts this ScheduledConfig to JSON.
     * @function toJSON
     * @memberof ScheduledConfig
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ScheduledConfig.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ScheduledConfig
     * @function getTypeUrl
     * @memberof ScheduledConfig
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ScheduledConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/ScheduledConfig";
    };

    return ScheduledConfig;
})();

$root.ScheduleConfigPacket = (function() {

    /**
     * Properties of a ScheduleConfigPacket.
     * @exports IScheduleConfigPacket
     * @interface IScheduleConfigPacket
     * @property {Array.<IScheduledConfig>|null} [schedules] ScheduleConfigPacket schedules
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
     * @member {Array.<IScheduledConfig>} schedules
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
                $root.ScheduledConfig.encode(message.schedules[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
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
                    message.schedules.push($root.ScheduledConfig.decode(reader, reader.uint32()));
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
                var error = $root.ScheduledConfig.verify(message.schedules[i]);
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
                message.schedules[i] = $root.ScheduledConfig.fromObject(object.schedules[i]);
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
                object.schedules[j] = $root.ScheduledConfig.toObject(message.schedules[j], options);
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

$root.BatteryState = (function() {

    /**
     * Properties of a BatteryState.
     * @exports IBatteryState
     * @interface IBatteryState
     * @property {boolean|null} [charging] BatteryState charging
     * @property {number|null} [mV] BatteryState mV
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
     * BatteryState mV.
     * @member {number} mV
     * @memberof BatteryState
     * @instance
     */
    BatteryState.prototype.mV = 0;

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
        if (message.mV != null && Object.hasOwnProperty.call(message, "mV"))
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.mV);
        if (message.percentage != null && Object.hasOwnProperty.call(message, "percentage"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.percentage);
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
                    message.mV = reader.uint32();
                    break;
                }
            case 3: {
                    message.percentage = reader.uint32();
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
        if (message.mV != null && message.hasOwnProperty("mV"))
            if (!$util.isInteger(message.mV))
                return "mV: integer expected";
        if (message.percentage != null && message.hasOwnProperty("percentage")) {
            properties._percentage = 1;
            if (!$util.isInteger(message.percentage))
                return "percentage: integer expected";
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
        if (object.mV != null)
            message.mV = object.mV >>> 0;
        if (object.percentage != null)
            message.percentage = object.percentage >>> 0;
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
            object.mV = 0;
        }
        if (message.charging != null && message.hasOwnProperty("charging"))
            object.charging = message.charging;
        if (message.mV != null && message.hasOwnProperty("mV"))
            object.mV = message.mV;
        if (message.percentage != null && message.hasOwnProperty("percentage")) {
            object.percentage = message.percentage;
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

$root.Packet = (function() {

    /**
     * Properties of a Packet.
     * @exports IPacket
     * @interface IPacket
     * @property {IPacketHeader|null} [header] Packet header
     * @property {IScheduleConfigPacket|null} [scheduleConfigPacket] Packet scheduleConfigPacket
     * @property {ISystemStatePacket|null} [systemStatePacket] Packet systemStatePacket
     * @property {IRadioConfigPacket|null} [radioConfigPacket] Packet radioConfigPacket
     * @property {IPeripheralPacket|null} [peripheralPacket] Packet peripheralPacket
     * @property {IPeripheralInfo|null} [peripheralInfo] Packet peripheralInfo
     */

    /**
     * Constructs a new Packet.
     * @exports Packet
     * @classdesc Represents a Packet.
     * @implements IPacket
     * @constructor
     * @param {IPacket=} [properties] Properties to set
     */
    function Packet(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Packet header.
     * @member {IPacketHeader|null|undefined} header
     * @memberof Packet
     * @instance
     */
    Packet.prototype.header = null;

    /**
     * Packet scheduleConfigPacket.
     * @member {IScheduleConfigPacket|null|undefined} scheduleConfigPacket
     * @memberof Packet
     * @instance
     */
    Packet.prototype.scheduleConfigPacket = null;

    /**
     * Packet systemStatePacket.
     * @member {ISystemStatePacket|null|undefined} systemStatePacket
     * @memberof Packet
     * @instance
     */
    Packet.prototype.systemStatePacket = null;

    /**
     * Packet radioConfigPacket.
     * @member {IRadioConfigPacket|null|undefined} radioConfigPacket
     * @memberof Packet
     * @instance
     */
    Packet.prototype.radioConfigPacket = null;

    /**
     * Packet peripheralPacket.
     * @member {IPeripheralPacket|null|undefined} peripheralPacket
     * @memberof Packet
     * @instance
     */
    Packet.prototype.peripheralPacket = null;

    /**
     * Packet peripheralInfo.
     * @member {IPeripheralInfo|null|undefined} peripheralInfo
     * @memberof Packet
     * @instance
     */
    Packet.prototype.peripheralInfo = null;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * Packet payload.
     * @member {"scheduleConfigPacket"|"systemStatePacket"|"radioConfigPacket"|"peripheralPacket"|"peripheralInfo"|undefined} payload
     * @memberof Packet
     * @instance
     */
    Object.defineProperty(Packet.prototype, "payload", {
        get: $util.oneOfGetter($oneOfFields = ["scheduleConfigPacket", "systemStatePacket", "radioConfigPacket", "peripheralPacket", "peripheralInfo"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new Packet instance using the specified properties.
     * @function create
     * @memberof Packet
     * @static
     * @param {IPacket=} [properties] Properties to set
     * @returns {Packet} Packet instance
     */
    Packet.create = function create(properties) {
        return new Packet(properties);
    };

    /**
     * Encodes the specified Packet message. Does not implicitly {@link Packet.verify|verify} messages.
     * @function encode
     * @memberof Packet
     * @static
     * @param {IPacket} message Packet message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Packet.encode = function encode(message, writer) {
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
     * Encodes the specified Packet message, length delimited. Does not implicitly {@link Packet.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Packet
     * @static
     * @param {IPacket} message Packet message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Packet.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Packet message from the specified reader or buffer.
     * @function decode
     * @memberof Packet
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Packet} Packet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Packet.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Packet();
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
     * Decodes a Packet message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Packet
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Packet} Packet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Packet.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Packet message.
     * @function verify
     * @memberof Packet
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Packet.verify = function verify(message) {
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
     * Creates a Packet message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Packet
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Packet} Packet
     */
    Packet.fromObject = function fromObject(object) {
        if (object instanceof $root.Packet)
            return object;
        var message = new $root.Packet();
        if (object.header != null) {
            if (typeof object.header !== "object")
                throw TypeError(".Packet.header: object expected");
            message.header = $root.PacketHeader.fromObject(object.header);
        }
        if (object.scheduleConfigPacket != null) {
            if (typeof object.scheduleConfigPacket !== "object")
                throw TypeError(".Packet.scheduleConfigPacket: object expected");
            message.scheduleConfigPacket = $root.ScheduleConfigPacket.fromObject(object.scheduleConfigPacket);
        }
        if (object.systemStatePacket != null) {
            if (typeof object.systemStatePacket !== "object")
                throw TypeError(".Packet.systemStatePacket: object expected");
            message.systemStatePacket = $root.SystemStatePacket.fromObject(object.systemStatePacket);
        }
        if (object.radioConfigPacket != null) {
            if (typeof object.radioConfigPacket !== "object")
                throw TypeError(".Packet.radioConfigPacket: object expected");
            message.radioConfigPacket = $root.RadioConfigPacket.fromObject(object.radioConfigPacket);
        }
        if (object.peripheralPacket != null) {
            if (typeof object.peripheralPacket !== "object")
                throw TypeError(".Packet.peripheralPacket: object expected");
            message.peripheralPacket = $root.PeripheralPacket.fromObject(object.peripheralPacket);
        }
        if (object.peripheralInfo != null) {
            if (typeof object.peripheralInfo !== "object")
                throw TypeError(".Packet.peripheralInfo: object expected");
            message.peripheralInfo = $root.PeripheralInfo.fromObject(object.peripheralInfo);
        }
        return message;
    };

    /**
     * Creates a plain object from a Packet message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Packet
     * @static
     * @param {Packet} message Packet
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Packet.toObject = function toObject(message, options) {
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
     * Converts this Packet to JSON.
     * @function toJSON
     * @memberof Packet
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Packet.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Packet
     * @function getTypeUrl
     * @memberof Packet
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Packet.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Packet";
    };

    return Packet;
})();

module.exports = $root;
