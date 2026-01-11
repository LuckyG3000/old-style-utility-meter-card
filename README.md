# Old Style Utility Meter Card for Home Assistant
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

Old Style Utility Meter Card for Home Assistant

Customizable Utility Meter Card based on old style (non digital) utility meter box with rotating digits and an animated spinning wheel :new:.\
This picture does a better job than describing it with words:

![Old Style Utility Meter Card](https://github.com/LuckyG3000/old-style-utility-meter-card/blob/main/imgs/wheel_animation.webp?raw=true)

This is my first custom card project.

# Configuration

Colors of almost all elements can be set to custom values.\
Font of digits can be either default (used by your HA dashboard) or Carlito, which is more resembling the font used on meter boxes.\
This card supports visual configuration editor.\

![Visual Configuration Editor](imgs/visual_config.png?raw=true)

## Example YAML Configuration
These are all options, that can be configured. Only the entity is mandatory, all others are optional.

```YAML
type: custom:old-style-utility-meter-card
entity: sensor.kws_306wf_energy
grid_options:
  rows: 2
  columns: full
whole_digit_number: 5
decimal_digit_number: 2
decimal_separator: Comma
icon: mdi:lightning-bolt
random_shift: 2
colors: User defined
font_url: Carlito
font_size: 24px
markings: true
show_name: true
name: Total Energy Usage
font: Carlito
digit_color: "#bbb"
icon_color: red
offset: 60577.5
show_wheel: true
speed_control_mode: Power
wheel_speed: 2
power_entity: sensor.kws_306wf_power
marker_width: 75
max_power_value: 10
max_rot_time: 20
min_rot_time: 1
unit: kWh
plate_color: "#181818"
name_color: "#f00"
integer_plate_color: "#000"
decimal_plate_color: red
unit_plate_color: grey
unit_color: "#ddd"
decimal_separator_color: "#ccc"
markings_color: "#fff"
wheel_color: "#aaa"
wheel_marker_color: "#000"
digit_bg_color: black
icon_background_color: black
```

## About configuration options

Most of these options are pretty straightforward a don't need any explanation. You can find some hints in the visual configuration editor for most of the options.\
**Colors:** all color options (those ending with _color) must be entered in a CSS compatible syntax, e.g, ```"red", "#02DD7F", "#fff", "rgb(120, 120, 120)", "rgba(64, 64, 64, 0.75)"```...

**Spinning wheel:** The rotating speed of the wheel can be either constant or dynamic based on value of optional entity (e.g. Power, Current, Flow etc.).

Select the mode for speed config:
```YAML
speed_control_mode: fixed | power
```

In **```fixed```** mode you set only the speed:
```YAML
wheel_speed: 2
```

The number can be set in range 0 - 20 with 0.1 steps, where 0 means the wheel rotation will be disabled, any other number is **the time of a single rotation in seconds**. That means the lower the number, the faster will the wheel spin.

In **```power```** mode you must set the **```power_entity```** and the values for transforming the value of sensor to rotation time.

**```power_entity: sensor.my_power_meter_3000_power```** - this is the entity providing the source value for wheel speed

**```max_power_value: 10```** - this is the maximum expected value of the sensor at which the wheel should spin at maximum speed. Let's say you have a single phase smart socket with power monitoring capability, the usual max. would be 3.6 kW. For three phase meters connected to main household connection this value will be significantly higher.

**```max_rot_time: 20```** - the time of a single rotation (in seconds) at minimal power (minimal value of the sensor above)

**```min_rot_time: 1```** - the time of a single rotation (in seconds) at maximum power (maximum value of the sensor above)

The formula for calculating the rotation time from these values is the following:

> rotation_time = (max_rot_time + min_rot_time \* power_val / max_power_value) - (max_rot_time \* power_val / max_power_value);

# Examples

![Example 1](https://github.com/LuckyG3000/old-style-utility-meter-card/blob/main/imgs/old-style-utility-meter-card.png?raw=true)

![Example 2](https://github.com/LuckyG3000/old-style-utility-meter-card/blob/main/imgs/example-0.png?raw=true)

![Example 3](https://github.com/LuckyG3000/old-style-utility-meter-card/blob/main/imgs/example-1.png?raw=true)

![Example 4](https://github.com/LuckyG3000/old-style-utility-meter-card/blob/main/imgs/example-2.png?raw=true)

![Example 5](https://github.com/LuckyG3000/old-style-utility-meter-card/blob/main/imgs/example-3.png?raw=true)

![Example 6](https://github.com/LuckyG3000/old-style-utility-meter-card/blob/main/imgs/example-4.png?raw=true)

![Example 7](https://github.com/LuckyG3000/old-style-utility-meter-card/blob/main/imgs/wheel_animation.webp?raw=true)

# Installation

## HACS (recommended) 

This card is available in [HACS](https://hacs.xyz/) (Home Assistant Community Store).

<small>*HACS is a third party community store and is not included in Home Assistant out of the box.*</small>

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=LuckyG3000&repository=old-style-utility-meter-card)


## Manual HACS install:
Use [HACS](https://hacs.xyz/), follow the [instructions for adding a custom repository](https://hacs.xyz/docs/faq/custom_repositories).

- Click on **HACS** in your HA side panel.
- Then click on three dots in upper right corner, choose **Custom repositories**.
- Paste the address of this repository into **Repository** field (`https://github.com/LuckyG3000/old-style-utility-meter-card`)
- Choose **Dashboard** in **Type** dropdown, click **Add**.
- The **Old Style Utility Meter Card** should appear in the list, click the three dots next to it and select **Download**.
- When asked to **Reload**, confirm it.
- Now you can add the card in your dashboard, click **Add card** and scroll to Custom cards. There you'll find the **Old Style Utility Meter Card**.
- In configuration, select the desired entity, optionally change other settings.

# Thanks

I would like to thank to [@Elmar Hinz](https://github.com/elmar-hinz) for his [Custom Card Tutorials](https://github.com/home-assistant-tutorials), which helped me a lot during making this card.
