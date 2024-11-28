

const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const utils = require("zigbee-herdsman-converters/lib/utils")
const store = require("zigbee-herdsman-converters/lib/store")
const e = exposes.presets;
const ea = exposes.access;

const fz = {
    ...require('zigbee-herdsman-converters/converters/fromZigbee'),
    command_step_color_temperature_custom: {
        cluster: 'lightingColorCtrl',
        type: 'commandStepColorTemp',
        options: [
            new exposes.Composite('simulated_color_temperature', 'simulated_color_temperature', exposes.access.SET)
                .withDescription("Testing testing")
                .withFeature(new exposes.Numeric('multiplier', exposes.access.SET).withValueMin(0).withDescription('Delta per interval, 10 by default'))
        ],
        convert: (model, msg, publish, options, meta) => {
            const direction = msg.data.stepmode === 1 ? 'up' : 'down';
            const payload = {
                action: utils.postfixWithEndpointName(`color_temperature_step_${direction}`, msg, model, meta),
                action_step_size: msg.data.stepsize,
            };

            if (msg.data.transtime !== undefined) {
                payload.action_transition_time = msg.data.transtime / 100;
            }

            if (options.simulated_color_temperature) {
                const opts = options.simulated_color_temperature;
                const optsMultiplier = typeof opts === 'object' && opts.multiplier !== undefined ? opts.multiplier : 10;

                let color_temperature = store.getValue(msg.endpoint, 'simulated_color_temperature_temperature', 2000);
                const delta = (direction === 'up' ? msg.data.stepsize : -1 * msg.data.stepsize) * optsMultiplier;
                color_temperature += delta;
                color_temperature = utils.numberWithinRange(color_temperature, 2000, 6500);
                store.putValue(msg.endpoint, 'simulated_color_temperature_temperature', color_temperature);
                const property = utils.postfixWithEndpointName('temperature', msg, model, meta);
                payload[property] = color_temperature;
                const deltaProperty = utils.postfixWithEndpointName('action_color_temperature_delta', msg, model, meta);
                payload[deltaProperty] = delta;
            }

            utils.addActionGroup(payload, msg, model);
            return payload;
        },

    }
}

const definition = {
    fingerprint: [
        { modelID: 'TS004F', manufacturerName: '_TZ3000_4fjiwweb' },
        { modelID: 'TS004F', manufacturerName: '_TZ3000_uri7ongn' },
        { modelID: 'TS004F', manufacturerName: '_TZ3000_ixla93vd' },
        { modelID: 'TS004F', manufacturerName: '_TZ3000_qja6nq5z' },
        { modelID: 'TS004F', manufacturerName: '_TZ3000_abrsvsou' },
        { modelID: 'TS004F', manufacturerName: '_TZ3000_402vrq2i' },
    ],
    model: 'ERS-10TZBVK-AA',
    vendor: 'Tuya',
    description: 'Smart knob custom',
    fromZigbee: [
        fz.command_step,
        fz.command_toggle,
        fz.command_move_hue,
        fz.command_step_color_temperature_custom,
        fz.command_stop_move_raw,
        fz.tuya_multi_action,
        fz.tuya_operation_mode,
        fz.battery,
    ],
    toZigbee: [tz.tuya_operation_mode],
    exposes: [
        e.action([
            'toggle',
            'brightness_step_up',
            'brightness_step_down',
            'color_temperature_step_up',
            'color_temperature_step_down',
            'saturation_move',
            'hue_move',
            'hue_stop',
            'single',
            'double',
            'hold',
            'rotate_left',
            'rotate_right',
        ]),
        e.numeric("action_brightness_delta", ea.STATE).withValueMin(-255).withValueMax(255),
        e.numeric('action_step_size', ea.STATE).withValueMin(-255).withValueMax(255),
        e.numeric('action_transition_time', ea.STATE).withUnit('s'),
        e.numeric('action_rate', ea.STATE).withValueMin(0).withValueMax(255),
        e.battery(),
        e
            .enum('operation_mode', ea.ALL, ['command', 'event'])
            .withDescription('Operation mode: "command" - for group control, "event" - for clicks'),
    ],
    configure: async (device, coordinatorEndpoint) => {
        const endpoint = device.getEndpoint(1);
        await endpoint.read('genBasic', [0x0004, 0x000, 0x0001, 0x0005, 0x0007, 0xfffe]);
        await endpoint.write('genOnOff', { tuyaOperationMode: 1 });
        await endpoint.read('genOnOff', ['tuyaOperationMode']);
        try {
            await endpoint.read(0xe001, [0xd011]);
        } catch {
            /* do nothing */
        }
        await endpoint.read('genPowerCfg', ['batteryVoltage', 'batteryPercentageRemaining']);
        await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
        await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff']);
        await reporting.batteryPercentageRemaining(endpoint);
    },
};

module.exports = definition;