export class QuantumCombo extends Quantum
{
    constructor(props)
    {
        super();
        this.name = "QuantumCombo";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.attachShadow({mode: 'open'});
        this.built = () => {};
        this.isShow = this._masterCheck = false;
        this._options = [];
        this._caption = "";
        this._enabled = true;
    }

    #getTemplate()
    {
        return `
        <div class='QuantumCombo'>
            <div class='QuantumComboInputContainer'>
                <input class='QuantumComboInput'>
                <div class='QuantumComboButtonDown'></div>
                <label class='QuantumLabel'></label>
            </div>
            <div class='QuantumComboPanel'></div>
            <option class='ComboOption'><slot name="comboCheckOption"></slot></option>
        </div>
        `;
    }

    async #getCss() {return await quantum.getCssFile(this.name);}

    #render(css)
    {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.mainElement = this.shadowRoot.querySelector('.QuantumCombo');
        this.mainElement.pointerEvents = 'none';
        this.inputElement = this.mainElement.querySelector('.QuantumComboInput');
        this.inputElement.readOnly = true;
        this.labelElement = this.mainElement.querySelector('.QuantumLabel');
        this.buttonCombo = this.mainElement.querySelector('.QuantumComboButtonDown');
        this.panel = this.mainElement.querySelector('.QuantumComboPanel');
    }

    #applyProps()
    {
        if (this.props)
        {
            Object.entries(this.props).forEach(([key, value]) =>
            {
                if (key === 'master') this.addOption({group: this.id, option: 'JS Master', value: 0, master: true});
                else if (key === 'style') Object.assign(this.mainElement.style, value);
                else if (key === 'events')
                    Object.entries(value).forEach(([event, handler]) => this.mainElement.addEventListener(event, handler));
                else {this[key] = value; this.setAttribute(key, value);}
            });
        }
        else
            this.getAttributeNames().forEach(attr =>
            {
                if (!attr.startsWith("on"))
                {
                    const value = this.getAttribute(attr);
                    this.mainElement.setAttribute(attr, value);
                    this[attr] = value;
                }
            });
    }

    #checkAttributes()
    {
        if (this.innerHTML)
        {
            const templ = document.createElement('template');
            templ.innerHTML = this.innerHTML;
            let f = templ.content.firstElementChild;
            while (f)
            {
                this.addOption(this.#getObjProp(f));
                f = f.nextElementSibling;
            }
        }
    }

    #getObjProp(f)
    {
        return {
            option: f.getAttribute('option') || f.innerHTML,
            value: f.getAttribute('value') || 0,
            sts: f.getAttribute('sts') === 'true'
        };
    }

    getSelected() {return this._options.filter(item => !item.master && item.quantumCheckBox.checked);}
    getDiselected() {return this._options.filter(item => !item.master && item.quantumCheckBox.checked);}

    async addOption(option)
    {
        const toggleCheck = () =>
        {
            option.quantumCheckBox.checked = !option.quantumCheckBox.checked;
            option.quantumCheckBox.checking();
            this.inputElement.value = this.getSelected().map(opt => opt.option).join(' | ');
            this.labelElement.style.animationName = this.inputElement.value.trim() ? 'labelUp' : '';
        };

        option.sts = option.sts || false;
        option.value = option.value || 0;

        let value = null;
        if (this.props?.id) {value = this.props.id;}
        else {value = this.getAttribute('id');}

        option.quantumCheckBox = await quantum.createInstance("QuantumCheckBox",
        {
            id: `${value}_${this._options.length}`,
            group: value,
            master: option.master,
            style: {position: 'relative'}
        });

        option.panel = document.createElement('div');
        option.panel.id = `optionPanel_${this._options.length}`;
        option.panel.className = 'QuantumComboOption';
        option.divText = document.createElement('div');
        option.divCheck = document.createElement('div');
        option.divText.className = "QuantumComboDivText";
        option.divCheck.className = "QuantumComboDivCheck";
        option.divCheck.appendChild(option.quantumCheckBox);
        option.divText.innerText = option.option;
        option.panel.appendChild(option.divCheck);
        option.panel.appendChild(option.divText);
        this.panel.appendChild(option.panel);
        this._options.push(option);

        [option.divCheck, option.divText].forEach(element =>
        {
            element.addEventListener('click', (e) =>
            {
                e.preventDefault();
                e.stopImmediatePropagation();
                toggleCheck();
            });
        });
    }

    showOptions()
    {
        if (this._options.length > 0)
        {
            const firstPanelHeight = parseInt(window.getComputedStyle(this._options[0].panel).height, 10);
            const totalHeight = firstPanelHeight * this._options.length;
            this.panel.animate([{visibility: 'visible', height: `${totalHeight}px`}], {duration: 300, fill: 'both'});
        }
    }

    hideOptions()
    {
        if (this._options.length > 0)
        {
            if (this.inputElement.value.trim() === '') this.labelElement.style.animationName = 'labelDown';
            this.panel.animate([{ visibility: 'hidden', height: '0%' }], {duration: 300, fill: 'both'});
        }
    }

    #events()
    {
        const animaOpen = () =>
        {
            if (this._enabled)
            {
                this.buttonCombo.style.animationName = "animationUp";
                this.showOptions();
                this.isShow = true;
            }
        };

        const animaClose = () =>
        {
            if (this._enabled)
            {
                this.buttonCombo.style.animationName = "animationDown";
                this.hideOptions();
                this.isShow = false;
            }
        };

        document.body.addEventListener('click', (e) =>
        {
            if (this._enabled)
            {
                e.preventDefault();
                if (this._options.length > 0) animaClose();
            }
        });

        this.buttonCombo.addEventListener('click', (e) => 
        {
            if (this._enabled)
            {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (this._options.length > 0) this.isShow ? animaClose() : animaOpen();
            }
        });
    }

    async connectedCallback()
    {
        this.#render(await this.#getCss());
        if (this.getAttribute('master') === 'true') await this.addOption({group: this.id, option: 'HTML Master', value: 0, master: true,});
        this.#applyProps();
        this.#checkAttributes();
        this.#events();
        this.built();
    }

    get master() {return this._masterCheck;}
    set master(val)
    {
        this._masterCheck = val;
        this.setAttribute('master', val);
    }
    get caption() {return this._caption;}
    set caption(val) 
    {
        this._caption = val;
        this.labelElement.innerText = val;
        this.setAttribute('caption', val);
    }
    get enabled() {return this._enabled;}
    set enabled(val) 
    {
        const setSts = (v) => {this._enabled = v; this.style.opacity = v ? 1 : 0.4;};
        setSts(val === 'true' ? true : (val === 'false' ? false : val));
    }
    addToBody() {quantum.addToBody(this);}
}

customElements.define('quantum-combo', QuantumCombo);