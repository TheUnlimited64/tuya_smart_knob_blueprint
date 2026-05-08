# Tuya Smart Knob blueprint for dimming with Zigbee2Mqtt

Control any entity with a Tuya Smart Knob using customizable rotation, click, and press-turn (color temperature) actions.

## Requirements

- **Zigbee2Mqtt >=2.10.1-1** — The converter is now natively built-in. No external converter is needed!

## Installation/Usage

### Zigbee2Mqtt

1. Make sure you are running Zigbee2Mqtt >=2.10.1-1
2. Add the following entry to your `configuration.yaml`:
```yaml
homeassistant:
  legacy_action_sensor: true
```
3. Restart Zigbee2Mqtt

You should now see in your device page under details entries for `Action brightness delta` and `Action color temperature delta`. Make sure the Smart Knob is in command mode. To change the mode quickly click the Smart Knob 3 times.

You'll also have to set the device specific settings under simulated brightness. Set it to 1 and 1.

## Blueprint

The blueprint is the second part that allows dimming or even volume control.

[![Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled.](https://my.home-assistant.io/badges/blueprint_import.svg)](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fraw.githubusercontent.com%2FTheUnlimited64%2Ftuya_smart_knob_blueprint%2Fmaster%2Fblueprint.yaml)

### Usage example

The blueprint exposes the `delta_value` variable to be used for smart dimming. It contains how many ticks were sent by the action of the Smart Knob. You can also control your volume or build even more complex automations.

To use the variables you need to use the YAML editor instead of the visual editor of the automation. Click on the three dots and select YAML editor.

```yaml
description: ""
alias: Universal Smart Knob Control
use_blueprint:
  path: TheUnlimited64/blueprint.yaml
  input:
    brightness_sensor: sensor.nachttisch_smart_knob_action_brightness_delta
    click_sensor: sensor.nachttisch_smart_knob_action
    color_temperature_sensor: sensor.nachttisch_smart_knob_action_color_temperature_delta
    rotation_action:
      - target:
          entity_id: light.schlafzimmer_haupt_lampe
        data:
          brightness_step_pct: "{{ delta_value * 10 }}"
          transition: 0.5
        action: light.turn_on
    click_action:
      - target:
          entity_id: light.schlafzimmer_haupt_lampe
        action: light.toggle
        data:
          transition: 0.5
    color_temperature_action:
      - target:
          entity_id: light.schlafzimmer_haupt_lampe
        data:
          color_temp_step: "{{ delta_value }}"
          transition: 0.5
        action: light.turn_on
```

## Older versions

If you are using an older version of Zigbee2Mqtt, check the archive branches:

- **[archive/v1-basic](../../tree/archive/v1-basic)** — Basic brightness + click only, for Zigbee2Mqtt <2.0
- **[archive/v2-color-temp-legacy](../../tree/archive/v2-color-temp-legacy)** — Color temperature support with custom converter (simulated), for Zigbee2Mqtt <2.0
- **[archive/v3-color-temp-esm](../../tree/archive/v3-color-temp-esm)** — Color temperature support with ESM custom converter, for Zigbee2Mqtt ~2.10.0
