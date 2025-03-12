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

    async #getCss() {return await quantum.getCssFile(this.name);}

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
                if (key === 'enabled') this.mainElement.contentEditable = value;
                else if (key === 'style') Object.assign(this.mainElement.style, value);
                else if (key === 'events')
                    Object.entries(value).forEach(([event, handler]) => this.mainElement.addEventListener(event, handler));
                else {this[key] = value; this.setAttribute(key, value);}
            });
        }
        else
            this.getAttributeNames().forEach(attr =>
            {
                if (attr === 'enabled')
                {
                    const value = this.getAttribute(attr);
                    this.mainElement.contentEditable = value;
                }
                if (!attr.startsWith("on"))
                {
                    const value = this.getAttribute(attr);
                    this.mainElement.setAttribute(attr, value);
                    this[attr] = value;
                }
            });
    }

    addContent(string)
    {
        if (this.mainElement.innerHTML != '') this.mainElement.innerHTML += `<br/>`
        if (string) this.mainElement.innerHTML += `${string}<br/>`;
        else this.mainElement.innerHTML += `${this.getAttribute('caption')}<br/>`;
    }
    clearContent() {this.mainElement.innerHTML = '';}

    getLine(string)
    {
        const divContents = this.mainElement.innerHTML;
        if (divContents.indexOf(string) !== -1)
        {
            let index = divContents.indexOf(string);
            console.log('Found line: ' + divContents.substring(index, divContents.indexOf("<br>", index)))
        }
        else console.log("The text was not found.")
    }

    getSelected()
    {
        const selectedText = document.getSelection().toString();
        if (selectedText.length > 0) console.log('Selected text: ' + selectedText);
    }

    async connectedCallback()
    {
        this.#render(await this.#getCss());
        this.#applyProps();
        this.built();
    }

    addToBody() {quantum.addToBody(this);}
}

customElements.define('quantum-memo', QuantumMemo);