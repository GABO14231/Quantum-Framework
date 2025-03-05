export class QuantumSwitch extends Quantum
{
    constructor(props)
    {
        super();
        this.name = "QuantumSwitch";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.attachShadow({mode: 'open'});
        this.built = () => {};
    }

    #getTemplate() 
    {
        return `
            <div class='QuantumSwitch'>
                <div class='QuantumSwitchButton'></div>
            </div>
        `;
    }

    async #getCss() {return await quantum.getCssFile("QuantumSwitch");}

    #render(css)
    {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.mainElement = this.shadowRoot.querySelector('.QuantumSwitch');
        this.buttonSwitch = this.mainElement.querySelector('.QuantumSwitchButton');
    }

    #applyProps()
    {
        if (this.props)
        {
            Object.entries(this.props).forEach(([key, value]) =>
            {
                if (key === 'style') Object.assign(this.mainElement.style, value);
                else if (key === 'events')
                    Object.entries(value).forEach(([event, handler]) => this.mainElement.addEventListener(event, handler));
                else {this[key] = value; this.setAttribute(key, value);}
            });
        }
        else
            this.getAttributeNames().forEach(attr =>
            {
                if (attr.startsWith("on"))
                {
                    const fn = this[attr];
                    this[attr] = () => !this.disabled && fn();
                }
                else
                {
                    const value = this.getAttribute(attr);
                    this.mainElement.setAttribute(attr, value);
                    this[attr] = value;
                }
            });
    }

    #events() {this.mainElement.addEventListener('pointerup', () => {if (!this.disabled) this.sts = !this._sts;}, false);}
    #fullAnimation()
    {
        this.buttonSwitch.style.animationName = this._sts ? "sw_move_on" : "sw_move_off";
        this.mainElement.animate([{ opacity: this._sts ? 1 : 0.6 }], {duration: 500, fill: 'both'});
    }

    async connectedCallback()
    {
        this.#render(await this.#getCss());
        this.#applyProps();
        this.#events();
        this.built();
    }

    get disabled() {return this.mainElement.disabled;}
    set disabled(val)
    {
        this.setAttribute('disabled', val);
        this.mainElement.disabled = val;
        this.mainElement.animate([{ opacity: val ? 0.2 : 1 }], {duration: 500, fill: 'both'});
    }
    get sts() {return this._sts;}
    set sts(val)
    {
        this._sts = val;
        this.#fullAnimation();
    }
    addToBody() {quantum.addToBody(this);}
}

customElements.define('quantum-switch', QuantumSwitch);