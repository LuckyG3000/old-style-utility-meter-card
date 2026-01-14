/*************************************************************
*                                                            *
*                Old Style Utility Meter Card                *
*                       by LuckyG3000                        *
*                           v1.2.0                           *
* https://github.com/LuckyG3000/old-style-utility-meter-card *
*           GNU GENERAL PUBLIC LICENSE version 3.0           *
*                                                            *
**************************************************************/

function loadCSS(url, id) {
	const link = document.createElement("link");
	link.id = id;
	link.type = "text/css";
	link.rel = "stylesheet";
	link.href = url;
	document.head.appendChild(link);
}

function unloadCSS(id) {
	//remove-styleSheet
	if (document.getElementById(id)) {
		var css = document.getElementById(id);
		css.parentNode.removeChild(css);
	}
}

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}



class OldStyleUtilityMeterCard extends HTMLElement {

	// private properties

	_config;
	_hass;
	_elements = {};
	_isAttached = false;

	// lifecycle
	constructor() {
		super();
		this.doStyle();
		this.doCard();
	}

	setConfig(config) {
		//this._config = config;
		
		this._config = {
			tap_action: {
				action: "more-info"
			},
			hold_action: {
				action: "more-info",
			},
			...config,
			};
		
		if (!this._isAttached) {
			this.doAttach();
			this.doQueryElements();
			this.doListen();
			this._isAttached = true;
		}
		this.doCheckConfig();
		this.doUpdateConfig();
	}
	
	set hass(hass) {
		this._hass = hass;
		this.doUpdateHass()
	}

	connectedCallback() {

	}

	onClicked() {
		//this.doToggle();
		const event = new CustomEvent("hass-action", {
			detail: {
				config: this._config,
				action: "tap",
			},
			bubbles: true,
			composed: true,
		});
		this.dispatchEvent(event);
	}
	
	
	getHeader() {
		return this._config.header;
	}

	getEntityID() {
		return this._config.entity;
	}

	getState() {
		return this._hass.states[this.getEntityID()];
	}

	getAttributes() {
		return this.getState().attributes
	}

	getName() {
		const friendlyName = this.getAttributes().friendly_name;
		return friendlyName ? friendlyName : this.getEntityID();
	}

	// The height of your card. Home Assistant uses this to automatically
	// distribute all cards over the available columns in masonry view
	getCardSize() {
		return 3;
	}

	// The rules for sizing your card in the grid in sections view
	getGridOptions() {
		return {
			rows: 3,
			columns: 12,
			min_rows: 3,
			max_rows: 3,
		};
	}


	// jobs
	doCheckConfig() {
		if (!this._config.entity) {
			throw new Error('Please define an entity!');
		}
		
		if (!this._config.power_entity && (this._config.speed_control_mode == "Power" || this._config.speed_control_mode == "Realistic")) {
			throw new Error('Please define the Power entity for wheel speed control mode!');
		}
	}



	doStyle() {
		this._elements.style = document.createElement("style");
		this._elements.style.textContent = `
			:root {
				--marker-width: 60px;
			}
			
			.card-content {
				cursor: pointer;
			}

			.osumc-error {
				text-color: red;
			}
			.osumc-error--hidden {
				display: none;
			}

			.osumc-name {
				margin-bottom: 10px;
			}

			.osumc-counter-div {
				width: min-content;
				white-space: nowrap;
				margin: 0 auto;
			}
			
					
			.osumc-integer-div {
				display: inline-block;
				vertical-align: middle;
				background-color: rgb(16, 16, 16);
				height: 39px;
				line-height: 39px;
				width: auto;
				white-space: nowrap;
				position: relative;
				font-size: 0;
				overflow: hidden;
			}

			.osumc-icon-div {
				display: inline-block;
				vertical-align: middle;
				height: 39px;
				line-height: 39px;
				width: 39px;
				text-align: center;
			}
			
			
			.osumc-digit-window {
				position: relative;
				width: 18px;
				height: 26px;
				top: 6px;
				margin-left: 10px;
				display: inline-block;
				color: white;
				border: 1px solid rgb(32,32,32);
				text-align: center;
				vertical-align: top;
				line-height: 24px;
				border-radius: 6px;
				box-shadow: -1px -1px 1px 0px rgba(255, 255, 255, 0.3) inset;
				background: rgb(8,8,8);
				color: linear-gradient(red, yellow, green);
				filter: blur(0.25px);
				overflow: hidden;
				z-index: 1;
			}

			.osumc-digit-text {
				background-image: linear-gradient(rgba(128,128,128,0.75), #aaa, rgba(128,128,128,0.75));
				color: transparent;
				background-clip: text;
				position: relative;
				width: 17px;
				height: 24px;
				display: block;
				line-height: 24px;
				text-align: center;
				/*font-family: Carlito, sans-serif;*/
				font-weight: 400;
				font-style: normal;
				font-size: 24px;
			}

			.osumc-red-bg {
				display: inline-block;
				position: relative;
				vertical-align: top;
				height: 39px;
				background-color: #F02000;
				line-height: 32px;
			}


			.osumc-grey-bg {
				display: inline-block;
				position: relative;
				vertical-align: top;
				height: 39px;
				background-color: #888;
				line-height: 39px;
				padding: 0px 6px;
				font-size: 18px;
				font-weight: bold;
				font-family: Carlito, sans-serif;
			}

			#osumc-decimal-point {
				position: absolute;
				top: -1px;
				display: inline-block;
				line-height: 39px;
				font-size: 36px;
				font-weight: bold;
				font-family: Carlito, sans-serif;
				z-index: 1;
			}
			
			.osumc-line_cont {
				position: absolute;
				top: 4px;
				width: min-content;
				z-index: 2;
			}

			.osumc-line_cont > .osumc-line {
				position: relative;
				display: block;
				width: 5px;
				height: 1px;
				left: 12px;
				border-top: 1px solid;
				top: 2px;
				margin-top: 1px;
			}

			.osumc-line_cont > :nth-child(1) {
				opacity: 0.15;
				width: 3px;
			}

			.osumc-line_cont > :nth-child(2) {
				opacity: 0.30;
				width: 4px;
			}

			.osumc-line_cont > :nth-child(3) {
				opacity: 0.45;
			}

			.osumc-line_cont > :nth-child(4) {
				opacity: 0.65;
			}

			.osumc-line_cont > :nth-child(5) {
				opacity: 0.8;
				width: 7px;
				left: 10px;
			}

			.osumc-line_cont > :nth-child(6) {
				opacity: 0.65;
			}
			
			.osumc-line_cont > :nth-child(7) {
				opacity: 0.45;
			}
			
			.osumc-line_cont > :nth-child(8) {
				opacity: 0.3;
				width: 4px;
			}
			
			.osumc-line_cont > :nth-child(9) {
				opacity: 0.15;
				width: 3px;
			}
			
			
			.osumc-wheel-window {
				width: 90%;
				height: 21px;
				margin: 20px auto;
				text-align: center;
				display: block;
				font-size: 0;
				white-space: nowrap;
			}

			.osumc-wheel-window-border {
				display: inline-block;
				width: 90%;
				height: 11px;
				position: relative;
				top: -13px;
				background-color: #000;
			}

			.osumc-wheel-window-left,
			.osumc-wheel-window-right {
				display: inline-block;
				width: 5%;
				height: 100%;
				position: relative;
				z-index: 1;
			}

			.osumc-wheel-window-left {
				text-align: right;
			}

			.osumc-wheel-window-left-border,
			.osumc-wheel-window-right-border {
				display: block;
				position: relative;
				height: 11px;
				background-color: #000;
				width: 3px;
				top: 5px;
			}

			.osumc-wheel-window-left-border {
				border-start-start-radius: 2px;
				border-end-start-radius: 2px;
				right: 0;
				margin-right: 0;
				margin-left: auto;
			}

			.osumc-wheel-window-right-border {
				border-start-end-radius: 2px;
				border-end-end-radius: 2px;
			}

			.osumc-wheel {
				height: 3px;
				background-image: linear-gradient(to right, #111 -5%, #aaa 50%, #111 105%);
				width: 100%;
				display: inline-block;
				position: relative;
				top: 4px;
				overflow: clip;
			}

			.osumc-wheel-marker {
				background-color: #000;
				width: var(--marker-width);
				margin-left: calc(var(--marker-width) * -0.5);
				height: 100%;
				position: relative;
				left: 50px;
				
				animation-name: osumc-wheel-animation;
				animation-duration: 2s;
				animation-iteration-count: infinite;
				animation-timing-function: linear;
			}

			@keyframes osumc-wheel-animation {
				0% {left: -2%; width: calc(var(--marker-width) * (10/30)); margin-left: calc(var(--marker-width) * (-5/30)); opacity: 0.6;}
				7% {left: 7%; width: calc(var(--marker-width) * (22/30)); margin-left: calc(var(--marker-width) * (-10/30)); opacity: 0.8;}
				13% {left: 20%; width: calc(var(--marker-width) * (27/30)); margin-left: calc(var(--marker-width) * (-13/30));}
				19% {left: 36%; width: calc(var(--marker-width) * (29/30)); margin-left: calc(var(--marker-width) * (-14/30));}
				25% {left: 50%; width: var(--marker-width); margin-left: calc(var(--marker-width) * (-15/30)); opacity: 1}
				31% {left: 64%; width: calc(var(--marker-width) * (29/30)); margin-left: calc(var(--marker-width) * (-14/30));}
				37% {left: 80%; width: calc(var(--marker-width) * (27/30)); margin-left: calc(var(--marker-width) * (-13/30));}
				43% {left: 93%; width: calc(var(--marker-width) * (22/30)); margin-left: calc(var(--marker-width) * (-11/30)); opacity: 0.8;}
				50% {left: 102%; width: calc(var(--marker-width) * (12/30)); margin-left: calc(var(--marker-width) * (-6/30)); opacity: 0.6;}
				51% {opacity: 0;}
				100% {opacity: 0;}
			}
			
			
			

			#osumc-last-update {
				display: none;
			}
		`;
	}

	doCard() {
		this._elements.card = document.createElement("ha-card");
		var html_content = `
			<div class="card-content">
				<p class="osumc-error osumc-error--hidden">
				<br><br>
				<div class="osumc-name"></div>
				<div class="osumc-counter-div">
					<div class="osumc-icon-div">
						<ha-icon icon="mdi:flash" id="osumc-icon"></ha-icon>
					</div><div class="osumc-integer-div">
						`;
			for (var d = 0; d < 15; d++) {
				html_content += `<span class="osumc-digit-window">
							<span class="osumc-digit-text" id="osumc-digit-` + d + `">0</span>
						</span>`;
			}
			html_content += `
						<div id="osumc-decimal-point"></div>
						<div class="osumc-line_cont">
							<div class="osumc-line"></div>
							<div class="osumc-line"></div>
							<div class="osumc-line"></div>
							<div class="osumc-line"></div>
							<div class="osumc-line"></div>
							<div class="osumc-line"></div>
							<div class="osumc-line"></div>
							<div class="osumc-line"></div>
							<div class="osumc-line"></div>
						</div>
					</div><div class="osumc-red-bg"></div><div class="osumc-grey-bg"></div>
				</div>
				<div class="osumc-wheel-window">
					<div class="osumc-wheel-window-left">
						<div class="osumc-wheel-window-left-border"></div>
					</div><div class="osumc-wheel-window-border">
						<div class="osumc-wheel">
							<div class="osumc-wheel-marker"></div>
						</div>
					</div><div class="osumc-wheel-window-right">
						<div class="osumc-wheel-window-right-border"></div>
					</div>
				</div>
				<div id="osumc-last-update"></div>
			</div>
		`;
		
		this._elements.card.innerHTML = html_content;
	}

	doAttach() {
		this.append(this._elements.style, this._elements.card);
	}

	doQueryElements() {
		const card = this._elements.card;
		this._elements.error = card.querySelector(".osumc-error")

		this._elements.card_content = card.querySelector(".card-content")

		this._elements.name = card.querySelector(".osumc-name");

		this._elements.counter_div = card.querySelector(".osumc-counter-div");
		this._elements.integer_div = card.querySelector(".osumc-integer-div");
		this._elements.digit_window = card.querySelectorAll(".osumc-digit-window");
		this._elements.digit = card.querySelectorAll(".osumc-digit-text");
		this._elements.redbg = card.querySelector(".osumc-red-bg");
		this._elements.greybg = card.querySelector(".osumc-grey-bg");
		this._elements.dp = card.querySelector("#osumc-decimal-point");
		this._elements.icon_div = card.querySelector(".osumc-icon-div");
		this._elements.icon = card.querySelector("#osumc-icon");
		this._elements.markings = card.querySelector(".osumc-line_cont");

		this._elements.wheel_window = card.querySelector(".osumc-wheel-window");
		this._elements.wheel = card.querySelector(".osumc-wheel");
		this._elements.wheel_marker = card.querySelector(".osumc-wheel-marker");

		this._elements.lu = card.querySelector("#osumc-last-update");
	}

	doListen() {
		this._elements.card_content.addEventListener("click", this.onClicked.bind(this), false);
	}

	doUpdateConfig() {
		if (this.getHeader()) {
			this._elements.card.setAttribute("header", this.getHeader());
		} else {
			this._elements.card.removeAttribute("header");
		}
	}

	doUpdateHass() {
		if (!this.getState() || this._config.entity == '' || this._config.entity == undefined || typeof this._config.entity !== "string") {
			this._elements.error.textContent = `${this.getEntityID()} is unavailable.`;
			this._elements.error.classList.remove("osumc-error--hidden");
		} else if ((this._config.power_entity == '' || typeof this._config.power_entity !== "string") && (this._config.speed_control_mode == 'Power' || this._config.speed_control_mode == 'Realistic')) {
			this._elements.error.textContent = `Power entity is unavailable.`;
			this._elements.error.classList.remove("osumc-error--hidden");
		} else {
			this._elements.error.textContent = "";

			var cntr_val = parseFloat(this.getState().state);
			if (isNumeric(this._config.offset)) {
				cntr_val += parseFloat(this._config.offset);
			}

			var l_str;
			var r_str;
			if (String(cntr_val).indexOf(".") > 0) {
				l_str = String(cntr_val).split(".")[0];
				r_str = String(cntr_val).split(".")[1];
			} else {
				l_str = String(cntr_val);
				r_str = "0";
			}
			
			var digits_left = this._config.whole_digit_number;
			var digits_right = this._config.decimal_digit_number;
			
			if (digits_left == 99) {	//auto
				digits_left = l_str.length;
				if (digits_left > 10) {digits_left = 10;}
			}

			if (digits_right == 99) {	//auto
				digits_right = r_str.length;
				if (digits_right > 5) {
					digits_right = 5;
					r_str = r_str.slice(0, 5);
				}
			}
			
			var total_digits = digits_left + digits_right;
			
			if (total_digits > 0) {
				this._elements.integer_div.style.display = "inline-block";
			} else {
				this._elements.integer_div.style.display = "none";
			}
			
			l_str = l_str.padStart(digits_left, '0');	//add leading zeros
			l_str = l_str.slice(-digits_left);		// cut the beginning of the string if it's longer than required number of digits
			if (digits_right > 0) {
				r_str = r_str.padEnd(digits_right, '0');
			}
			
			if (r_str.length > digits_right) {	//do rounding
			  r_str = String(Math.round(parseInt(r_str) / Math.pow(10, r_str.length - digits_right)));
			}
			
			var cntr_str = l_str + r_str;
			var dig_val;

			var ts = Math.floor(Date.now() / 1000);
			var random_pos = false;
			if (this._elements.lu.innerHTML < ts - 60 || this._elements.lu.innerHTML == '') {
				random_pos = true;
				this._elements.lu.innerHTML = ts;
			}
			
			var markings_offset = 0;
			
			for (var d = 0; d < total_digits; d++) {
				dig_val = cntr_str.substring(d, d + 1);
				this._elements.digit[d].innerHTML = dig_val;
				this._elements.digit_window[d].style.display = "inline-block";
				if (random_pos && this._config.random_shift !== undefined && this._config.random_shift > 0) {
					this._elements.digit[d].style.top = Math.round(Math.random() * 2 * this._config.random_shift - this._config.random_shift) + "px";
				}
				if (this._config.random_shift == '' || this._config.random_shift == undefined || this._config.random_shift == 0) {
					this._elements.digit[d].style.top = 0;
				}
				
				//if markings are enabled, make the last window wider
				//markings_offset = 0;
				if (this._config.markings && d == (total_digits - 1)) {
					this._elements.digit_window[d].style.width = "24px";
					markings_offset = 6;	//move other elements by this number of pixels to the right
				} else {
					this._elements.digit_window[d].style.removeProperty('width');
				}
			}
			//hide the rest of digits
			for (var d = total_digits; d < 15; d++) {
				this._elements.digit_window[d].style.display = "none";
			}
			//this._elements.redbg.style.left = ((30 * digits_left) + 5) + "px";
			this._elements.redbg.style.width = (30 * digits_right + (markings_offset * (digits_right > 0))) + "px";
			this._elements.redbg.style.left = ((-30 * digits_right) + 5 - markings_offset) + "px"; //"-61px";
			this._elements.greybg.style.left = this._elements.redbg.style.left;
			//this._elements.greybg.style.left = ((30 * digits_left) + 5 + (30 * digits_right) + markings_offset) + "px";
			
			this._elements.markings.style.left = ((30 * total_digits) - 13) + "px";
			
			
			if (this._config.show_name) {
				this._elements.name.style.display = "block";
				if (this._config.name == '' || this._config.name == undefined) {
					this._elements.name.innerHTML = this.getName();
				} else {
					this._elements.name.innerHTML = this._config.name;
				}
				if (this._config.name_color != undefined && this._config.name_color != '') {
					this._elements.name.style.color = this._config.name_color;
				}
			} else {
				this._elements.name.style.display = "none";
			}

			var icon_w = 39;
			if (this._config.icon != undefined) {
				this._elements.icon.setAttribute("icon", this._config.icon);
				this._elements.icon_div.style.display = "inline-block";
			} else {
				this._elements.icon_div.style.display = "none";
				icon_w = 0;
			}
			
			var unitOfMeasurement = this.getState().attributes.unit_of_measurement;
			if (this._config.unit != undefined && String(this._config.unit).length > 0) {		//if unit is configured in Card's config, use it instead of entity's unit_of_measurement
				unitOfMeasurement = this._config.unit;
			}
			this._elements.greybg.innerHTML = unitOfMeasurement;

			if (this._config.unit == "0") {
				this._elements.greybg.style.display = "none";
			} else {
				this._elements.greybg.style.display = "inline-block";
			}
			
			
			//counter_div.width = icon_div.width + integer_div.width + redbg.width + markings_offset + greybg.width + greybg.padding (2x6)
			var greybg_w = this._elements.greybg.getBoundingClientRect().width;
			if (greybg_w > 0) {greybg_w += 12;}	//add padding width
			this._elements.counter_div.style.width = icon_w + (30 * digits_left) + (30 * digits_right + (markings_offset * (digits_right > 0))) + greybg_w + "px";
	
			

			if (this._config.decimal_separator == "Point") {
				this._elements.dp.innerHTML = ".";
			} else if (this._config.decimal_separator == "Comma") {
				this._elements.dp.innerHTML = ",";
			} else if (this._config.decimal_separator == "Colon") {
				this._elements.dp.innerHTML = ":";
			} else {
				this._elements.dp.innerHTML = "";
			}
			this._elements.dp.style.left = ((30 * digits_left) - 1) + "px";
			if (digits_right == 0) {
				this._elements.dp.style.display = "none";
			} else {
				this._elements.dp.style.display = "inline-block";
			}
			
			

			if (this._config.plate_color != undefined && this._config.plate_color != '') {
				this._elements.card_content.style.backgroundColor = this._config.plate_color;
			}
			
			if (this._config.integer_plate_color != undefined && this._config.integer_plate_color != '') {
				this._elements.integer_div.style.backgroundColor = this._config.integer_plate_color;
			}
			
			if (this._config.decimal_plate_color != undefined && this._config.decimal_plate_color != '') {
				this._elements.redbg.style.backgroundColor = this._config.decimal_plate_color;
			}
			
			if (this._config.unit_plate_color != undefined && this._config.unit_plate_color != '') {
				this._elements.greybg.style.backgroundColor = this._config.unit_plate_color;
			}
			
			if (this._config.unit_color != undefined && this._config.unit_color != '') {
				this._elements.greybg.style.color = this._config.unit_color;
			}
			
			if (this._config.digit_color != undefined && this._config.digit_color != '') {
				for (var d = 0; d < total_digits; d++) {
					this._elements.digit[d].style.backgroundImage = "linear-gradient(rgba(64,64,64,1), " + this._config.digit_color + ", rgba(64,64,64,1))";
				}
			}
			
			if (this._config.digit_bg_color != undefined && this._config.digit_bg_color != '') {
				for (var d = 0; d < total_digits; d++) {
					this._elements.digit_window[d].style.background = this._config.digit_bg_color;
				}
			}
			
			if (this._config.font == undefined) {
				unloadCSS("osumc-webfont");
				for (var d = 0; d < total_digits; d++) {
					this._elements.digit[d].style.fontFamily = "inherit";
				}
			} else {
				if (this._config.font == 'Carlito') {
					loadCSS("https://fonts.googleapis.com/css2?family=Carlito:ital,wght@0,400&display=swap", "osumc-webfont");
					for (var d = 0; d < total_digits; d++) {
						this._elements.digit[d].style.fontFamily = "Carlito";
					}
				//} else if (this._config.font.slice(0,4) == 'http') {
				//	loadCSS(this._config.font, "osumc-webfont");
				} else {
					unloadCSS("osumc-webfont");
					for (var d = 0; d < total_digits; d++) {
						this._elements.digit[d].style.fontFamily = "inherit";
					}
				}
			}
			
			for (var d = 0; d < total_digits; d++) {
				if (this._config.font_size == undefined) {
					this._elements.digit[d].style.fontSize = "26px";
				} else {
					this._elements.digit[d].style.fontSize = this._config.font_size + "px";
				}
			}
			
			
			if (this._config.decimal_separator_color != undefined && this._config.decimal_separator_color != '') {
				this._elements.dp.style.color = this._config.decimal_separator_color;
			}
			
			if (this._config.icon_color != undefined && this._config.icon_color != '') {
				this._elements.icon.style.color = this._config.icon_color;
			}
			
			if (this._config.icon_background_color != undefined && this._config.icon_background_color != '') {
				this._elements.icon_div.style.backgroundColor = this._config.icon_background_color;
			}
			
			if (this._config.decimal_separator_color != undefined && this._config.decimal_separator_color != '') {
				this._elements.dp.style.color = this._config.decimal_separator_color;
			}
			
			if (this._config.markings) {
				this._elements.markings.style.display = "block";
			} else {
				this._elements.markings.style.display = "none";
			}
			
			if (this._config.markings_color != undefined && this._config.markings_color != '') {
				this._elements.markings.style.color = this._config.markings_color;
			}
			
			if (this._config.show_wheel) {
				//show the main <div> element with wheel
				this._elements.wheel_window.style.display = "block";
				
				//set custom wheel color
				if (this._config.wheel_color != undefined && this._config.wheel_color != '') {
					this._elements.wheel.style.backgroundImage = "linear-gradient(to right, #111 -5%, " + this._config.wheel_color + " 50%, #111 105%)";
				}
				
				//set custom marker color
				if (this._config.wheel_marker_color != undefined && this._config.wheel_marker_color != '') {
					this._elements.wheel_marker.style.backgroundColor = this._config.wheel_marker_color;
				}
				
				//set custom marker width
				var r = document.querySelector(':root');
				if (this._config.marker_width != undefined && this._config.marker_width != '') {
					this._elements.wheel_marker.style.width = this._config.marker_width + "px";
					//also set the variable used for calculation in animation
					r.style.setProperty('--marker-width', this._config.marker_width + "px");
				} else {
					r.style.setProperty('--marker-width', "60px");	//default value
				}


				if (this._config.speed_control_mode == 'Fixed') {
					if (!isNaN(Number(this._config.wheel_speed))) {
						this._elements.wheel_marker.style.animationDuration = this._config.wheel_speed + "s";
					} else {
						this._elements.wheel_marker.style.removeProperty('animation-duration');
					}
				} else {	//dynamic speed based on value of selected custom Power entity
					if (this._config.power_entity && typeof this._config.power_entity === "string") {
						var power_val = parseFloat(this._hass.states[this._config.power_entity].state);
						
						if (this._config.speed_control_mode == 'Power') {
							//formula to calculate animation time (rotation speed) of the wheel
							//from current state of Power entity and defined constants
							// (max_rot_time + min_rot_time * power_val / max_power) - (max_rot_time * power_val / max_power)
							var min_rot_time = this._config.min_rot_time;
							var max_rot_time = this._config.max_rot_time;
							var max_power = this._config.max_power_value;
							if (power_val == 0 || !isNumeric(power_val) || !isNumeric(min_rot_time) || !isNumeric(max_rot_time) || !isNumeric(max_power)) {
								this._elements.wheel_marker.style.animationDuration = 0 + "s";
							} else {
								if (power_val > max_power) {
									power_val = max_power;
								}
								var calc_wheel_speed = (max_rot_time + min_rot_time * power_val / max_power) - (max_rot_time * power_val / max_power);
								this._elements.wheel_marker.style.animationDuration = calc_wheel_speed + "s";
							}
						} else {
							if (power_val == 0 || !isNumeric(power_val)){
								this._elements.wheel_marker.style.animationDuration = 0 + "s";
							} else {
								var rotationsPerKwh = this._config.rot_time_per_kwh;
								var calc_wheel_speed = ((3600 / rotationsPerKwh) * 1000) / power_val;
								this._elements.wheel_marker.style.animationDuration = calc_wheel_speed + "s";
							}
						}
					} else {
						this._elements.wheel_marker.style.removeProperty('animation-duration');
					}
				}
			} else {
				this._elements.wheel_marker.style.animationDuration = 0;
				this._elements.wheel_window.style.display = "none";
			}
			
			//set scale
			if (this._config.scale == 100 || this._config.scale == '' || this._config.scale == undefined || !isNumeric(this._config.scale)) {
				this._elements.counter_div.style.transform = "scale(100%)";
			} else {
				this._elements.counter_div.style.transform = "scale(" + this._config.scale + "%)";
			}
			
			
            this._elements.error.classList.add("osumc-error--hidden");
        }
    }

    /*
	doToggle() {
        this._hass.callService('input_boolean', 'toggle', {
            entity_id: this.getEntityID()
        });
    }*/

    // configuration defaults
    static getStubConfig() {
        return {
			entity: "",
			name: "Energy meter",
			show_name: true,
			whole_digit_number: 99,
			decimal_digit_number: 99,
			decimal_separator: "Point",
			markings: true,
			random_shift: 0,
			offset: 0,
			icon: "mdi:lightning-bolt",
			unit: "",
			show_wheel: true,
			marker_width: 60,
			speed_control_mode: "Fixed",
			wheel_speed: 4,
			max_power_value: 10,
			min_rot_time: 1,
			max_rot_time: 20,
			font: "Carlito",
			font_size: 26,
			scale: 100,
			rot_time_per_kwh: 75,
		}
    }

	static getConfigForm() {
	
    var sch = {
		schema: [
			{ name: "entity", required: true, selector: { entity: {} } },
			{ name: "name", selector: { text: {} } },
			{ name: "show_name", selector: { boolean: {} } },
			{ name: "whole_digit_number", selector: { number: { min: 0, max: 10, step: 1, mode: "slider" } } },
			{ name: "decimal_digit_number", selector: { number: { min: 0, max: 5, step: 1, mode: "slider" } } },
			{ name: "scale", required: true, selector: { number: { min: 25, max: 200, step: 5, mode: "slider" } } },
			{ name: "decimal_separator", selector: { select: { mode: "list", options: ["Point", "Comma", "Colon", "None"] } } },
			{ name: "markings", selector: { boolean: {} } },
			{ name: "random_shift", selector: { number: { min: 0, max: 2, step: 1, mode: "slider" } } },
			{ name: "offset", selector: { number: { step: "any", mode: "box" } } },
			{
				name: "icon",
				selector: {
					icon: {},
				},
				context: {
					icon_entity: "entity",
				},
			},
			{ name: "unit", selector: { text: {} } },

			{ name: "show_wheel", selector: { boolean: {} } },
			{ name: "marker_width", selector: { number: { min: 3, max: 100, step: 1, mode: "slider" } } },
			{ name: "speed_control_mode", selector: { select: { mode: "list", options: ["Fixed", "Power", "Realistic"] } } },
			{ name: "wheel_speed", selector: { number: { min: 0.1, max: 20, step: 0.1, mode: "slider" } } },
			{ name: "power_entity", selector: { entity: {} } },
			{ name: "max_power_value", selector: { number: { step: "any", mode: "box" } } },
			{ name: "min_rot_time", selector: { number: { min: 0.1, step: 0.1, mode: "box" } } },
			{ name: "max_rot_time", selector: { number: { min: 0.1, step: 0.1, mode: "box" } } },
			{ name: "rot_time_per_kwh", selector: { number: { min: 1, step: 1, mode: "box" } } },
			
			{ name: "plate_color", selector: { text: {} } },
			{ name: "name_color", selector: { text: {} } },
			{ name: "icon_color", selector: { text: {} } },
			{ name: "icon_background_color", selector: { text: {} } },
			{ name: "integer_plate_color", disabled: false, selector: { text: {} } },
			{ name: "decimal_plate_color", selector: { text: {} } },
			{ name: "unit_plate_color", selector: { text: {} } },
			{ name: "unit_color", selector: { text: {} } },
			{ name: "digit_color", selector: { text: {} } },
			{ name: "digit_bg_color", selector: { text: {} } },
			{ name: "decimal_separator_color", selector: { text: {} } },
			{ name: "markings_color", selector: { text: {} } },

			{ name: "wheel_color", selector: { text: {} } },
			{ name: "wheel_marker_color", selector: { text: {} } },

			{ name: "font", selector: { select: { mode: "dropdown", options: ["Default", "Carlito"] } } },
			{ name: "font_size", selector: { text: {} } },

			//{ name: "plate_color", disabled: true, selector: { color_rgb: {} } },
			//{ name: "theme", selector: { theme: {} } },
		],
		
		computeLabel: (schema) => {
			if (schema.name === "icon") return "Special Icon";
			return undefined;
		},
		
		computeHelper: (schema) => {
			switch (schema.name) {
				case "entity":
					return "Choose entity to show on meter";
				case "unit":
					return "The unit of measurement for this card. If not filled, unit is taken from selected entity. (0 = hide unit)";
				case "whole_digit_number":
					return "Number of digits to the left of decimal point. (0 - 10, 99 = auto)";
				case "decimal_digit_number":
					return "Number of digits to the right of decimal point. (0 - 5, 99 = auto)";
				case "offset":
					return "This value will be added to entity's value. If negative, it will be subtracted.";
				case "random_shift":
					return "Shift digits vertically randomly by ±1 or ±2px, to get a more realistic look. Set 0 to disable shift.";
				case "markings":
					return "Show minor markings on last digit.";
				case "plate_color":
					return "You can set your desired colors for the following elements of the card. Use color codes supported by CSS, e.g. #FFF, #C0C0C0, black, rgb(128, 128, 128), rgba(64, 0, 0, 0.25)...";
				case "font":
					return "Applies only to digits";
				case "font_size":
					return "Applies only to digits";
				case "show_wheel":
					return "Shows a rotating wheel with marker, like on real electricity meter";
				case "speed_control_mode":
					return "Fixed - the wheel rotates with constant speed defined below. Power - the speed depends on sensor value of a defined entity, can be Power, Current, Flow... Realistic - Emulates real utility meters";
				case "wheel_speed":
					return "Speed of the wheel. Number of seconds per single rotation (0 - 20, 0 = STOP, 0.1 - fastest, 20 - slowest)";
				case "power_entity":
					return "Select the entity which will affect the rotation speed of the wheel. Usually Power or Current when measuring Electricity consumption, Flow for water consumption etc.";
				case "min_rot_time":
					return "Duration of a single rotation at highest speed (in seconds, minimum 0.1). See Readme for deeper explanation.";
				case "max_rot_time":
					return "Duration of a single rotation at lowest speed (in seconds, minimum 0.1). See Readme for deeper explanation.";
				case "max_power_value":
					return "Maximum expected value of the above entity, at which the wheel will rotate at max speed. See Readme for deeper explanation.";
				case "scale":
					return "Set the scale of the counter (default = 100%). In case you have too many digits that you want to display and the counter doesn't fit into card. Or if you want to make the counter bigger.";
				case "rot_time_per_kwh":
					return "Set the amount of rotations the wheel should complete per used kwh";
			}
			return undefined;
		},
		
		assertConfig: (config) => {
			if (config.other_option) {
				throw new Error("'other_option' is unexpected.");
			}

			if (!config.entity || typeof config.entity !== "string") {
				//throw new Error('Configuration error: "entity" must be a non-empty string.');
			}

			if (config.min_rot_time !== undefined && isNaN(Number(config.min_rot_time))) {
				throw new Error('Configuration error: "min_rot_time" must be a valid number.');
			}
			
			if (config.max_rot_time !== undefined && isNaN(Number(config.max_rot_time))) {
				throw new Error('Configuration error: "max_rot_time" must be a valid number.');
			}


			var w = getSchIndex(sch, 'decimal_separator');
			if (config.decimal_digit_number == 0) {
				sch.schema[w].disabled = true;
			} else {
				sch.schema[w].disabled = false;
			}


			if (config.show_wheel == false) {
				w = getSchIndex(sch, 'speed_control_mode');
				sch.schema[w].disabled = true;
				w = getSchIndex(sch, 'marker_width');
				sch.schema[w].disabled = true;
				w = getSchIndex(sch, 'wheel_speed');
				sch.schema[w].disabled = true;
				w = getSchIndex(sch, 'power_entity');
				sch.schema[w].disabled = true;
				w = getSchIndex(sch, 'max_power_value');
				sch.schema[w].disabled = true;
				w = getSchIndex(sch, 'min_rot_time');
				sch.schema[w].disabled = true;
				w = getSchIndex(sch, 'max_rot_time');
				sch.schema[w].disabled = true;
				w = getSchIndex(sch, 'rot_time_per_kwh');
				sch.schema[w].disabled = true;
			} else {
				w = getSchIndex(sch, 'speed_control_mode');
				sch.schema[w].disabled = false;
				w = getSchIndex(sch, 'marker_width');
				sch.schema[w].disabled = false;
				
				if (config.speed_control_mode == 'Fixed') {
					w = getSchIndex(sch, 'wheel_speed');
					sch.schema[w].disabled = false;
					sch.schema[w].required = true;
					w = getSchIndex(sch, 'power_entity');
					sch.schema[w].required = false;
					sch.schema[w].disabled = true;
					w = getSchIndex(sch, 'max_power_value');
					sch.schema[w].disabled = true;
					w = getSchIndex(sch, 'min_rot_time');
					sch.schema[w].required = false;
					sch.schema[w].disabled = true;
					w = getSchIndex(sch, 'max_rot_time');
					sch.schema[w].required = false;
					sch.schema[w].disabled = true;
					w = getSchIndex(sch, 'rot_time_per_kwh');
					sch.schema[w].required = false;
					sch.schema[w].disabled = true;
				} else if (config.speed_control_mode == 'Realistic'){
					w = getSchIndex(sch, 'wheel_speed');
					sch.schema[w].disabled = true;
					sch.schema[w].required = false;
					w = getSchIndex(sch, 'power_entity');
					sch.schema[w].required = true;
					sch.schema[w].disabled = false;
					w = getSchIndex(sch, 'max_power_value');
					sch.schema[w].required = false;
					sch.schema[w].disabled = true;
					w = getSchIndex(sch, 'min_rot_time');
					sch.schema[w].required = false;
					sch.schema[w].disabled = true;
					w = getSchIndex(sch, 'max_rot_time');
					sch.schema[w].required = false;
					sch.schema[w].disabled = true;
					w = getSchIndex(sch, 'rot_time_per_kwh');
					sch.schema[w].required = true;
					sch.schema[w].disabled = false;
				} else {
					w = getSchIndex(sch, 'wheel_speed');
					sch.schema[w].required = false;
					sch.schema[w].disabled = true;
					w = getSchIndex(sch, 'power_entity');
					sch.schema[w].disabled = false;
					sch.schema[w].required = true;
					w = getSchIndex(sch, 'max_power_value');
					sch.schema[w].disabled = false;
					w = getSchIndex(sch, 'min_rot_time');
					sch.schema[w].disabled = false;
					sch.schema[w].required = true;
					w = getSchIndex(sch, 'max_rot_time');
					sch.schema[w].disabled = false;
					sch.schema[w].required = true;
				}
			}
		},
	};
	
	return sch;
	}

}


function getSchIndex(sch, name) {
	for (var i = 0; i < sch.schema.length; i++) {
		if (sch.schema[i].name == name) {
			//sch.schema[i].disabled = false;
			return i;
		}
	}
}


customElements.define("old-style-utility-meter-card", OldStyleUtilityMeterCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "old-style-utility-meter-card",
    name: "Old Style Utility Meter Card",
    description: "A graphical representation of old style utility meter"
});
