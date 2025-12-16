class LGUtilityCounterCard extends HTMLElement {

    // private properties

    _config;
    _hass;
    _elements = {};
    _isAttached = false;

    // lifecycle
    

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

	constructor() {
        super();
        console.log("LGUtilityCounterCard.constructor()")
        this.doStyle();
        this.doCard();
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
				display: inline-block;
				color: white;
				font-family: Carlito, sans-serif;
				font-weight: 400;
				font-style: normal;
				font-size: 26px;
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
				background-image: linear-gradient(rgba(0,0,0,0), rgb(220,220,220), #606060);
				color: transparent;
				background-clip: text;
				height: 24px;
				display: block;
				line-height: 24px;
				text-align: center;
				width: 17px;
			}

			.lg-utility-counter-red-bg {
				display: inline-block;
				position: absolute;
				top: 0;
				width: 46px;
				height: 39px;
				background-color: #F02000;
				line-height: 32px;
				left: 148px;
			}


			.lg-utility-counter-grey-bg {
				display: inline-block;
				position: absolute;
				top: 0;
				width: 30px;
				height: 39px;
				background-color: #888;
				line-height: 32px;
				left: 194px;
			}


			.lg-utility-counter-digit-span {
				position: relative;
				width: 18px;
				height: 26px;
				top: 7px;
				margin-left: 5px;
				display: inline-block;
			}

			.lg-utility-counter-digit-span:first-child {
				margin-left: 10px;
			}
        `
    }

    doCard() {
        this._elements.card = document.createElement("ha-card");
        
		setConfig(config) {
        //console.log("LGUtilityCounterCard.setConfig()")
        	this._config = config;
		}
			
		var html_content = `
			<div class="card-content">
				<p class="lguc-error lguc-error--hidden">
				<br><br>
				<div class="lg-utility-counter-main-div">
					<div class="lg-utility-counter-red-bg">
					</div><div class="lg-utility-counter-grey-bg">kWh</div>`;
		var total_digits = this._config.digits_number + this._config.decimals_number;
		console.log("Total digits 1: " + total_digits);
		for (var d = 0; d < total_digits; d++) {
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
	
		this._elements.digit = card.querySelectorAll(".lg-utility-counter-digit-text");
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
			
			var cntr_val = this.getState().state;
			var cntr_str = String(Math.round(cntr_val * 100)).padStart(8, '0');
			var dig_val;

			var total_digits = this._config.digits_number + this._config.decimals_number;
			console.log("Total digits 1: " + total_digits);
			for (var d = 0; d < total_digits; d++) {
				dig_val = cntr_str.substring(d, d + 1);
				//this._elements.digit[d].src = "/local/community/lg-utility-counter-card/imgs/" + dig_val + ".png";
				this._elements.digit[d].innerHTML = dig_val;
			}
			
			
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
