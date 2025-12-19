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
        this._config = config;
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


    // jobs
    doCheckConfig() {
        if (!this._config.entity) {
            throw new Error('Please define an entity!');
        }
    }

	 /*doEditor() {
        this._elements.editor = document.createElement("form");
        this._elements.editor.innerHTML = `
            <div class="row"><label class="label" for="header">Header:</label><input class="value" id="header"></input></div>
            <div class="row"><label class="label" for="entity">Entity:</label><input class="value" id="entity"></input></div>
        `;
    }*/

    doStyle() {
        this._elements.style = document.createElement("style");
        this._elements.style.textContent = `
            .osumc-error {
                text-color: red;
            }
            .osumc-error--hidden {
                display: none;
            }
            
			.osumc-main-div {
				display: inline-block;
				vertical-align: middle;
				background-color: rgb(16, 16, 16);
				height: 39px;
				line-height: 39px;
				width: 194px;
				white-space: nowrap;
				position: relative;
			}

			
			.osumc-icon-div {
				display: inline-block;
				vertical-align: middle;
				height: 39px;
				line-height: 39px;
				margin-right: 8px;
			}
			
			
			.osumc-digit-window {
				position: relative;
				width: 18px;
				height: 26px;
				/*top: 6px;*/
				margin-left: 10px;
				/*display: inline-block;*/
				color: white;
				border: 1px solid rgb(32,32,32);
				text-align: center;
				vertical-align: middle;
				line-height: 24px;
				border-radius: 6px;
				box-shadow: -1px -1px 1px 0px rgba(255, 255, 255, 0.3) inset;
				background: rgb(8,8,8);
				color: linear-gradient(red, yellow, green);
				filter: blur(0.25px);
			}

			.osumc-digit-text {
				background-image: linear-gradient(rgba(64,64,64,1), rgb(255,255,255), rgba(64,64,64,1));
				color: transparent;
				background-clip: text;
				width: 17px;
				height: 24px;
				display: block;
				line-height: 24px;
				text-align: center;
				font-family: Carlito, sans-serif;
				font-weight: 400;
				font-style: normal;
				font-size: 26px;
			}

			.osumc-red-bg {
				display: inline-block;
				position: absolute;
				top: 0;
				/*width: 60px;*/
				height: 39px;
				background-color: #F02000;
				line-height: 32px;
				/*left: 148px;*/
			}


			.osumc-grey-bg {
				/*display: inline-block;*/
				position: absolute;
				top: 0;
				/*width: 30px;*/
				height: 39px;
				background-color: #888;
				line-height: 39px;
				padding: 0px 6px;
				font-size: 18px;
				font-weight: bold;
				font-family: Carlito, sans-serif;
				/*left: 194px;*/
			}

			#osumc-decimal-point {
				position: absolute;
				top: 1px;
				display: inline-block;
				line-height: 39px;
				font-size: 36px;
				font-weight: bold;
				font-family: Carlito, sans-serif;
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
				<div class="osumc-icon-div">
					<ha-icon icon="mdi:flash" id="osumc-icon"></ha-icon>
				</div>
				<div class="osumc-main-div">
					<div class="osumc-red-bg">
					</div><div class="osumc-grey-bg"></div>`;
		for (var d = 0; d < 15; d++) {
			html_content += `<span class="osumc-digit-window">
						<span class="osumc-digit-text" id="osumc-digit-` + d + `">0</span>
					</span>`;
		}
		html_content += `
					<div id="osumc-decimal-point"></div>
					<div id="osumc-last-update"></div>
				</div>
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

		this._elements.main_div = card.querySelector(".osumc-main-div");
		this._elements.digit_window = card.querySelectorAll(".osumc-digit-window");
		this._elements.digit = card.querySelectorAll(".osumc-digit-text");
		this._elements.redbg = card.querySelector(".osumc-red-bg");
		this._elements.greybg = card.querySelector(".osumc-grey-bg");
		this._elements.dp = card.querySelector("#osumc-decimal-point");
		this._elements.icon = card.querySelector("#osumc-icon");
		this._elements.lu = card.querySelector("#osumc-last-update");
    }

    doListen() {
        //this._elements.dl.addEventListener("click", this.onClicked.bind(this), false);
    }

    doUpdateConfig() {
        if (this.getHeader()) {
            this._elements.card.setAttribute("header", this.getHeader());
        } else {
            this._elements.card.removeAttribute("header");
        }
    }

    doUpdateHass() {
        if (!this.getState()) {
            this._elements.error.textContent = `${this.getEntityID()} is unavailable.`;
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
			
			var digits_left = this._config.digits_number;
			var digits_right = this._config.decimals_number;
			
			if (digits_left == 0) {	//auto
				digits_left = l_str.length;
				if (digits_left > 10) {digits_left = 10;}
			}

			if (digits_right == 0) {	//auto
				digits_right = r_str.length;
				if (digits_right > 5) {
					digits_right = 5;
					r_str = r_str.slice(0, 5);
				}
			}
			
			var total_digits = digits_left + digits_right;
			
			l_str = l_str.padStart(digits_left, '0');	//add leading zeros
			l_str = l_str.slice(-digits_left);		// cut the beginning of the string if it's longer than required number of digits
			r_str = r_str.padEnd(digits_right, '0');

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
				
			for (var d = 0; d < total_digits; d++) {
				dig_val = cntr_str.substring(d, d + 1);
				this._elements.digit[d].innerHTML = dig_val;
				this._elements.digit_window[d].style.display = "inline-block";
				if (random_pos) {
					this._elements.digit_window[d].style.top = Math.round(Math.random() * 2 - 1) + "px";
				}
				if (!this._config.random_shift) {
					this._elements.digit_window[d].style.top = 0;
				}
			}
			//hide the rest of digits
			for (var d = total_digits; d < 15; d++) {
				this._elements.digit_window[d].style.display = "none";
			}
			this._elements.redbg.style.left = ((30 * digits_left) + 5) + "px";
			this._elements.redbg.style.width = (30 * digits_right) + "px";
			this._elements.greybg.style.left = ((30 * digits_left) + 5 + (30 * digits_right)) + "px";
			
			var unitOfMeasurement = this.getState().attributes.unit_of_measurement;
			if (this._config.unit != undefined && String(this._config.unit).length > 0) {		//if unit is configured in Card's config, use it instead of entity's unit_of_measurement
				unitOfMeasurement = this._config.unit;
			}
			this._elements.greybg.innerHTML = unitOfMeasurement;

			if  (this._config.unit == "0") {
				this._elements.greybg.style.display = "none";
			} else {
				this._elements.greybg.style.display = "inline-block";
			}

			if  (this._config.decimal_separator == "Point") {
				this._elements.dp.innerHTML = ".";
			} else {
				this._elements.dp.innerHTML = ",";
			}
			this._elements.dp.style.left = ((30 * digits_left) - 1) + "px";

			if  (this._config.icon != undefined) {
				this._elements.icon.setAttribute("icon", this._config.icon);
				this._elements.icon.style.display = "inline-block";
			} else {
				this._elements.icon.style.display = "none";
			}

				
			/*if (this._config.plate_color != undefined) {
				var plate_rgb = this._config.plate_color;	//array with 3 elements
				var rgb_css = "rgb(" + plate_rgb[0] + "," + plate_rgb[1] + ","+ plate_rgb[2] + ")";
				this._elements.main_div.style.backgroundColor = rgb_css;
			}*/
			
			if (this._config.font_url == undefined) {
				unloadCSS("osumc-webfont");
			} else {
				if (this._config.font_url == 'Carlito') {
					loadCSS("https://fonts.googleapis.com/css2?family=Carlito:ital,wght@0,400&display=swap", "osumc-webfont");
				} else if (this._config.font_url.slice(0,4) == 'http') {
					loadCSS(this._config.font_url, "osumc-webfont");
				} else {
					unloadCSS("osumc-webfont");
				}
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
    /*static getStubConfig() {
        return { entity: "sun.sun" }
    }*/

	static getConfigForm() {
	var col_disabled = false;
	if (this._config.colors != undefined) {
		if (this._config.colors == 'User defined') {
			col_disabled = true;
		}
	}
    var sch = {
      schema: [
        { name: "entity", required: true, selector: { entity: {} } },
        { name: "name", selector: { text: {} } },
		{ name: "digits_number", selector: { number: { min: 0, max: 10, step: 1, mode: "slider" } } },
		{ name: "decimals_number", selector: { number: { min: 0, max: 5, step: 1, mode: "slider" } } },
		{ name: "decimal_separator", selector: { select: { mode: "list", options: ["Point", "Comma"] } } },
		{ name: "random_shift", selector: { boolean: {} } },
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
		{ name: "colors", selector: { select: { mode: "list", options: ["Default", "User defined"] } } },
		{ name: "plate_color", disabled: col_disabled, selector: { text: {} } },
		{ name: "decimal_plate_color", selector: { text: {} } },
		{ name: "unit_plate_color", selector: { text: {} } },
		{ name: "unit_color", selector: { text: {} } },
		{ name: "digit_color", selector: { text: {} } },
		{ name: "digit_bg_color", selector: { text: {} } },
		{ name: "icon_color", selector: { text: {} } },
		{ name: "font_url", selector: { select: { mode: "dropdown", custom_value: true, options: ["Default", "Carlito"] } } },
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
		  case "digits_number":
            return "The number of digits to the left of decimal point. (0 - 10, 0 = auto)";
		  case "decimals_number":
            return "The number of digits to the right of decimal point. (0 - 5, 0 = auto)";
		  case "offset":
            return "This value will be added to entity's value. If negative, it will be subtracted.";
		  case "random_shift":
            return "Shift digits vertically randomly by ±1px, to get a more realistic look.";
        }
        return undefined;
      },
      assertConfig: (config) => {
        if (config.other_option) {
          throw new Error("'other_option' is unexpected.");
        }
      },
    };
	
	return sch;
  }

}

/*
function getSchIndex(sch, name) {
	for (var i = 0; i < sch.schema.length; i++) {
		if (sch.schema[i].name == name) {
			//sch.schema[i].disabled = false;
			return i;
		}
	}
}
*/

customElements.define("old-style-utility-meter-card", OldStyleUtilityMeterCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "old-style-utility-meter-card",
    name: "Old Style Utility Meter Card",
    description: "A graphical representation of old style utility meter"
});
