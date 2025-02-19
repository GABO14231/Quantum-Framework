export class QuantumRadio extends Quantum
{
    constructor(props)
    {
        super();
        this.props = props;
        if (props?.id) this.id = props.id;
        this.attachShadow({mode: 'open'});
        this.built = () => {};
    }

    #getTemplate()
    {
        return `
        <div class="QuantumRadioPanel">
            <div class="QuantumExtRadio">
                <div class="QuantumIntRadio"></div>
            </div>
            <div class="QuantumRadioCaption"></div>
        </div>
        `;
    }

    async #getCss() {return await quantum.getCssFile("QuantumRadio");}

    async #render(css)
    {
        this.template = document.createElement('template');
        this.template.innerHTML = this.#getTemplate();
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        const tpc = this.template.content.cloneNode(true);
        this.mainElement = tpc.firstElementChild;
        this.extRadio = this.mainElement.querySelector('.QuantumExtRadio');
        this.intRadio = this.extRadio.querySelector('.QuantumIntRadio');
        this.captionPanel = this.mainElement.querySelector('.QuantumRadioCaption');
        this.shadowRoot.appendChild(this.mainElement);  
        this.mainElement.id = this.id;
        this.mainElement.pointerEvents = 'none';
    }

    async #applyProps()
    {
        if (this.props)
        {
            Object.entries(this.props).forEach(([key, value]) =>
            {
                if (key === 'style')
                    Object.assign(this.mainElement.style, value);
                else if (key === 'events')
                    Object.entries(value).forEach(([event, handler]) => this.mainElement.addEventListener(event, handler));
                else if (key === 'group')
                {
                    this[key] = value;
                    this.setAttribute(key, value);
                    quantum.radioGroup[this.props.group] = quantum.radioGroup[this.props.group] || [];
                    quantum.radioGroup[this.props.group].push(this);
                }
                else
                {
                    this[key] = value;
                    this.setAttribute(key, value);
                }
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
                if (attr === 'group')
                {
                    const value = this.getAttribute(attr);
                    this.setAttribute(attr, value);
                    quantum.radioGroup[value] = quantum.radioGroup[value] || [];
                    quantum.radioGroup[value].push(this);
                }
            });
    }

    #selectRadio(val)
    {
        this.captionPanel.className = val ? "QuantumRadioCaptionSelected" : "QuantumRadioCaption";
        this.intRadio.className = val ? "QuantumIntRadioSelected" : "QuantumIntRadio";
        this._checked = val;
        for (const group of Object.values(quantum.radioGroup))
        {
            for (const radio of group)
            {
                if (radio !== this)
                {
                    radio.captionPanel.className = "QuantumRadioCaption";
                    radio.intRadio.className = "QuantumIntRadio";
                    radio._checked = false;
                }
            }
        }
    }

    async connectedCallback()
    {
        await this.#render(await this.#getCss());
        await this.#applyProps();
        this.mainElement.addEventListener('click', (e) =>
        {
            e.preventDefault();
            this.#selectRadio(true);
        });  
    }

    get caption() {return this._caption;}
    set caption(val)
    {
        this._caption = val;
        this.captionPanel.innerText = val;
    }
    get checked() {return this._checked;}
    set checked(val) {this.#selectRadio(val);}
    addToBody() {quantum.addToBody(this);}
}

customElements.define('quantum-radio', QuantumRadio);