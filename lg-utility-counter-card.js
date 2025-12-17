function loadCSS(url) {
  const link = document.createElement("link");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

//loadCSS("https://fonts.googleapis.com/css?family=Gloria+Hallelujah");
loadCSS("https://fonts.googleapis.com/css2?family=Carlito:ital,wght@0,400&display=swap");

class LGUtilityCounterCard extends HTMLElement {

    // private properties

    _config;
    _hass;
    _elements = {};
    _isAttached = false;

    // lifecycle
	constructor() {
        super();
        console.log("LGUtilityCounterCard.constructor()")
        this.doStyle();
        this.doCard();
    }
    
    setConfig(config) {
        console.log("LGUtilityCounterCard.setConfig()")
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
        //console.log("LGUtilityCounterCard.hass()")
        this._hass = hass;
        this.doUpdateHass()
    }

    connectedCallback() {
        //console.log("LGUtilityCounterCard.connectedCallback()")
    }

    onClicked() {
        //console.log("LGUtilityCounterCard.onClicked()");
        this.doToggle();
    }

    // accessors
    isOff() {
        return this.getState().state == 'off';
    }

    isOn() {
        return this.getState().state == 'on';
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

	 doEditor() {
        this._elements.editor = document.createElement("form");
        this._elements.editor.innerHTML = `
            <div class="row"><label class="label" for="header">Header:</label><input class="value" id="header"></input></div>
            <div class="row"><label class="label" for="entity">Entity:</label><input class="value" id="entity"></input></div>
        `;
    }

    doStyle() {
        this._elements.style = document.createElement("style");
        this._elements.style.textContent = `
            .lguc-error {
                text-color: red;
            }
            .lguc-error--hidden {
                display: none;
            }
            .lguc-dl {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .lguc-dl--hidden {
                display: none;
            }
            .lguc-dt {
                display: flex;
                align-content: center;
                flex-wrap: wrap;
            }
            .lguc-dd {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, auto) minmax(0, 2fr));
                margin: 0;
            }
			.lg-utility-counter-main-div {
				background-color: rgb(16, 16, 16);
				height: 39px;
				width: 194px;
				white-space: nowrap;
				position: relative;
			}
			
			
			.lg-utility-counter-digit-window {
				position: relative;
				width: 18px;
				height: 26px;
				top: 6px;
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

			.lg-utility-counter-digit-text {
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

			.lg-utility-counter-red-bg {
				display: inline-block;
				position: absolute;
				top: 0;
				/*width: 60px;*/
				height: 39px;
				background-color: #F02000;
				line-height: 32px;
				/*left: 148px;*/
			}


			.lg-utility-counter-grey-bg {
				display: inline-block;
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
       `
    }

    doCard() {
        this._elements.card = document.createElement("ha-card");
		var html_content = `
			<div class="card-content">
				<p class="lguc-error lguc-error--hidden">
				<br><br>
				<div class="lg-utility-counter-main-div">
					<div class="lg-utility-counter-red-bg">
					</div><div class="lg-utility-counter-grey-bg"></div>`;
		for (var d = 0; d < 15; d++) {
			html_content += `<span class="lg-utility-counter-digit-window">
						<span class="lg-utility-counter-digit-text" id="lguc-digit-` + d + `">0</span>
					</span>`;
		}
		html_content += `
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
        this._elements.error = card.querySelector(".lguc-error")
        //this._elements.dl = card.querySelector(".lguc-dl")
        //this._elements.topic = card.querySelector(".lguc-dt")
        //this._elements.toggle = card.querySelector(".tcvj-toggle")
        //this._elements.value = card.querySelector(".tcvj-value")

		this._elements.digit_window = card.querySelectorAll(".lg-utility-counter-digit-window");
		this._elements.digit = card.querySelectorAll(".lg-utility-counter-digit-text");
		this._elements.redbg = card.querySelector(".lg-utility-counter-red-bg");
		this._elements.greybg = card.querySelector(".lg-utility-counter-grey-bg");
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
            this._elements.error.classList.remove("lguc-error--hidden");
            //this._elements.dl.classList.add("lguc-dl--hidden");
        } else {
            this._elements.error.textContent = "";
            //this._elements.topic.textContent = this.getName();
            /*if (this.isOff()) {
                this._elements.toggle.classList.remove("tcvj-toggle--on");
                this._elements.toggle.classList.add("tcvj-toggle--off");
            } else if (this.isOn()) {
                this._elements.toggle.classList.remove("tcvj-toggle--off");
                this._elements.toggle.classList.add("tcvj-toggle--on");
            }*/
            //this._elements.value.textContent = this.getState().state;

			var total_digits_left = this._config.digits_number;
			var total_digits_right = this._config.decimals_number;
			var total_digits = total_digits_left + total_digits_right;
		
			var cntr_val = this.getState().state;
			console.log("1: " + cntr_val);

			var cntr_str_left = String(parseInt(cntr_val)).padStart(total_digits_left, '0');	//add leading zeros
			cntr_str_left = cntr_str_left.slice(-total_digits_left);		// cut the beginning of the string if it's longer than required number of digits
			console.log("2: " + String(cntr_val - parseInt(cntr_val)));
			var cntr_str_right = String(cntr_val - parseInt(cntr_val)).slice(2, 2 + total_digits_right).padEnd(total_digits_right, '0');
			
			var cntr_str = cntr_str_left + cntr_str_right;
			console.log(cntr_str_left);
			console.log(cntr_str_right);
			console.log(cntr_str);
			var dig_val;
			
			for (var d = 0; d < total_digits; d++) {
				dig_val = cntr_str.substring(d, d + 1);
				this._elements.digit[d].innerHTML = dig_val;
				this._elements.digit_window[d].style.display = "inline-block";
			}
			//hide the rest of digits
			for (var d = total_digits; d < 15; d++) {
				this._elements.digit_window[d].style.display = "none";
			}
			this._elements.redbg.style.left = ((30 * this._config.digits_number) + 5) + "px";
			this._elements.redbg.style.width = (30 * this._config.decimals_number) + "px";
			this._elements.greybg.style.left = ((30 * this._config.digits_number) + 5 + (30 * this._config.decimals_number)) + "px";
			const unitOfMeasurement = this.getState().attributes.unit_of_measurement;
			this._elements.greybg.innerHTML = unitOfMeasurement;
			
            this._elements.error.classList.add("lguc-error--hidden");
            //this._elements.dl.classList.remove("lguc-dl--hidden");
        }
    }

    doToggle() {
        /*this._hass.callService('input_boolean', 'toggle', {
            entity_id: this.getEntityID()
        });*/
    }

    // configuration defaults
    static getStubConfig() {
        return { entity: "sun.sun" }
    }

	static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: {} } },
        { name: "name", selector: { text: {} } },
		{ name: "digits_number", selector: { number: { min: 0, max: 10, step: 1, mode: "slider" } } },
		{ name: "decimals_number", selector: { number: { min: 0, max: 5, step: 1, mode: "slider" } } },
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
        { name: "theme", selector: { theme: {} } },
      ],
      computeLabel: (schema) => {
        if (schema.name === "icon") return "Special Icon";
		if (schema.name === "unit") {
			const unitOfMeasurement = this.getState().attributes.unit_of_measurement;
			return unitOfMeasurement;
		}
        return undefined;
		
		  
      },
      computeHelper: (schema) => {
        switch (schema.name) {
          case "entity":
            return "This text describes the function of the entity selector";
          case "unit":
            return "The unit of measurement for this card";
		  case "digits_number":
            return "The number of digits to the left of decimal point. (0 - 10, 0 = auto)";
		  case "decimals_number":
            return "The number of digits to the right of decimal point. (0 - 5, 0 = auto from entity's precision)";
        }
        return undefined;
      },
      assertConfig: (config) => {
        if (config.other_option) {
          throw new Error("'other_option' is unexpected.");
        }
      },
    };
  }

}

customElements.define("lg-utility-counter-card", LGUtilityCounterCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "lg-utility-counter-card",
    name: "LG Utility Counter Card",
    description: "A graphical representation of utility counter" // optional
});
