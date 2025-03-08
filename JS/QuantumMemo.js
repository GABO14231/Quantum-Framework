export class QuantumMemo extends Quantum
{
    constructor(props)
    {
        super();
        this.name = "QuantumMemo";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.attachShadow({mode: 'open'});
        this.built = () => {};
    }

    async #getCss() {return await quantum.getCssFile("QuantumMemo");}

    #render(css)
    {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.shadowRoot.innerHTML = `<div class="QuantumMemo"></div>`;
        this.mainElement = this.shadowRoot.querySelector('.QuantumMemo');
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

    addContent() {this.mainElement.innerHTML = this.getAttribute('caption');}
    clearContent() {this.mainElement.innerHTML = '';}
    getLine(){}
    getSelected(){}

    async connectedCallback()
    {
        this.#render(await this.#getCss());
        this.#applyProps();
        this.built();
    }

    addToBody() {quantum.addToBody(this);}
}

customElements.define('quantum-memo', QuantumMemo);