export class QuantumButton extends Quantum
{
    constructor(props)
    {
        super();
        this.name = "QuantumButton";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.attachShadow({mode: 'open'});
        this.built = () => {};
    }

    async #getCss() {return await quantum.getCssFile("QuantumButton");}

    #render(css)
    {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.shadowRoot.innerHTML = `<button class='QuantumButton'></button>`;
        this.mainElement = this.shadowRoot.querySelector('.QuantumButton');
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
                if (!attr.startsWith("on"))
                {
                    const value = this.getAttribute(attr);
                    this.mainElement.setAttribute(attr, value);
                    this[attr] = value;
                }
            });
    }

    async connectedCallback()
    {
        this.#render(await this.#getCss());
        this.#applyProps();
        this.built();
    }

    get caption() {return this.mainElement.innerHTML;}
    set caption(val) {this.mainElement.innerHTML = val; this.dispatchEvent(new CustomEvent("changeCaption", {bubbles: true}));}
    get disabled() {return this.mainElement.disabled;}
    set disabled(val) {this.mainElement.disabled = val;}
    addToBody() {quantum.addToBody(this);}
};

customElements.define('quantum-button', QuantumButton);