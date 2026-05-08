import fzPkg from "zigbee-herdsman-converters/converters/fromZigbee";
import tzPkg from "zigbee-herdsman-converters/converters/toZigbee";
import exposesPkg from "zigbee-herdsman-converters/lib/exposes";
import reportingPkg from "zigbee-herdsman-converters/lib/reporting";
import tuyaPkg from "zigbee-herdsman-converters/lib/tuya";

const fz = fzPkg.default ?? fzPkg;
const tz = tzPkg.default ?? tzPkg;
const exposes = exposesPkg.default ?? exposesPkg;
const reporting = reportingPkg.default ?? reportingPkg;
const tuya = tuyaPkg.default ?? tuyaPkg;

const e = exposes.presets;
const ea = exposes.access;

const fz_tuya_multi_action = fz.tuya_multi_action || tuya.fz?.tuya_multi_action || tuya.fz?.multi_action;
const fz_tuya_operation_mode = fz.tuya_operation_mode || tuya.fz?.tuya_operation_mode || tuya.fz?.operation_mode;
const tz_tuya_operation_mode = tz.tuya_operation_mode || tuya.tz?.tuya_operation_mode || tuya.tz?.operation_mode;

if (!fz_tuya_multi_action) throw new Error("Failed to resolve fromZigbee tuya_multi_action");
if (!fz_tuya_operation_mode) throw new Error("Failed to resolve fromZigbee tuya_operation_mode");
if (!tz_tuya_operation_mode) throw new Error("Failed to resolve toZigbee tuya_operation_mode");

const definition = {
    fingerprint: [
        {modelID: "TS004F", manufacturerName: "_TZ3000_4fjiwweb"},
        {modelID: "TS004F", manufacturerName: "_TZ3000_uri7ongn"},
        {modelID: "TS004F", manufacturerName: "_TZ3000_ixla93vd"},
        {modelID: "TS004F", manufacturerName: "_TZ3000_qja6nq5z"},
        {modelID: "TS004F", manufacturerName: "_TZ3000_abrsvsou"},
        {modelID: "TS004F", manufacturerName: "_TZ3000_402vrq2i"},
    ],
    model: "ERS-10TZBVK-AA",
    vendor: "Tuya",
    description: "Smart knob custom",
    fromZigbee: [
        fz.command_step,
        fz.command_toggle,
        fz.command_move_hue,
        fz.command_step_color_temperature,
        fz.command_stop_move_raw,
        fz_tuya_multi_action,
        fz_tuya_operation_mode,
        fz.battery,
    ],
    toZigbee: [tz_tuya_operation_mode],
    exposes: [
        e.action([
            "toggle",
            "brightness_step_up",
            "brightness_step_down",
            "color_temperature_step_up",
            "color_temperature_step_down",
            "saturation_move",
            "hue_move",
            "hue_stop",
            "single",
            "double",
            "hold",
            "rotate_left",
            "rotate_right",
        ]),
        e.numeric("action_brightness_delta", ea.STATE).withValueMin(-255).withValueMax(255),
        e.numeric("action_step_size", ea.STATE).withValueMin(-255).withValueMax(255),
        e.numeric("action_color_temperature_delta", ea.STATE).withValueMin(-65535).withValueMax(65535),
        e.numeric("action_transition_time", ea.STATE).withUnit("s"),
        e.numeric("action_rate", ea.STATE).withValueMin(0).withValueMax(255),
        e.battery(),
        e.enum("operation_mode", ea.ALL, ["command", "event"]).withDescription(
            'Operation mode: "command" - for group control, "event" - for clicks',
        ),
    ],
    configure: async (device, coordinatorEndpoint) => {
        const endpoint = device.getEndpoint(1);
        await endpoint.read("genBasic", [0x0004, 0x000, 0x0001, 0x0005, 0x0007, 0xfffe]);
        await endpoint.write("genOnOff", {tuyaOperationMode: 1});
        await endpoint.read("genOnOff", ["tuyaOperationMode"]);
        try {
            await endpoint.read(0xe001, [0xd011]);
        } catch {
            /* do nothing */
        }
        await endpoint.read("genPowerCfg", ["batteryVoltage", "batteryPercentageRemaining"]);
        await reporting.bind(endpoint, coordinatorEndpoint, ["genPowerCfg"]);
        await reporting.bind(endpoint, coordinatorEndpoint, ["genOnOff"]);
        await reporting.batteryPercentageRemaining(endpoint);
    },
};

export default definition;
