# Tuya Smart Knob blueprint for dimming with Zigbee2Mqtt

I'm happy to annouce that it's now possible to use the Tuya Smart Knob for perfect dimming with zigbee2mqtt in home assistant!

## Installation/Usage

### Zigbee2Mqtt

As of now (24.11.2024) the required change is not in zigbee2mqtt converter yet, so it requires to use an external converter. For that you'll need access to the filesystem. For examle file-editor, vscode server addon, ssh etc.

1. create a folder named custom_devices next to the configuration.yaml of zigbee2mqtt. In homeassistant it's located in `/homeassistant/zigbee2mqtt/`
2. create a file named `tuya_new.js` or how you like to name your converter and copy the contents of device_config.ts to your created file.
3. go to the zigbee2mqtt UI and click on settings
4. navigate to the external converters tab
5. add entry for your newly created file. eg: `custom_devices/tuya_new.js`
6. click submit and restart zigbee2mqtt addon.

You should now see in your device page under details a new entry called `Action brightness delta`. Make sure the smart knob is in command mode. To change the mode quickly click the smart knob 3 times, it will change the mode.

You'll also have to set the device specific settings and then fill simulated brightness. I've set it to 1 and 1, and it works.

## Blueprint

The blueprint is the second part that allows dimming or even volume control.

[![Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled.](https://my.home-assistant.io/badges/blueprint_import.svg)](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2FTheUnlimited64%2Ftuya_smart_knob_blueprint%2Fblob%2FBlueprint_V1%2Fblueprint.yaml)

### Usage example

The blueprint exposes the `delta_value` variable to be used for smart dimming. It contains how many ticks where send by the action of the smart knob. You can also control your volume control or build even more complex automations.


To use the variables you need to use the yaml editor, instead of the visual editor of the automation. For that click on the three dots and select yaml editor.


```
description: ""
alias: Universal Smart Knob Control
use_blueprint:
  path: TheUnlimited64/blueprint.yaml
  input:
    brightness_sensor: sensor.nachttisch_smart_knob_action_brightness_delta
    click_sensor: sensor.nachttisch_smart_knob_action
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
```