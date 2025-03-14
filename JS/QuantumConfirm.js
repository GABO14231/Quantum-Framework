export class QuantumConfirm extends Quantum
{
    constructor(props)
    {
        super();
        this.name = "QuantumConfirm";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.attachShadow({mode: "open"});
        this.built = () => {};
    }

    #getTemplate()
    {
        return `
            <dialog class='QuantumConfirm'>
                <div class='Title'></div>
                <div class='BodyDialog'></div>
                <div class='Footer'></div>
            </dialog>
        `;
    }

    async #getCss() {return await quantum.getCssFile(this.name);}
    async #getSVG(fileName) {return await quantum.getSVG(fileName)}

    #render(css)
    {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.mainElement = this.shadowRoot.querySelector(".QuantumConfirm");
        this.titleDialog = this.shadowRoot.querySelector(".Title");
        this.bodyDialog = this.shadowRoot.querySelector(".BodyDialog");
        this.footerDialog = this.shadowRoot.querySelector(".Footer");
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

    async #addContent()
    {
        const dialogTitle = this.getAttribute('dialogtitle');
        const dialogText = this.getAttribute('dialogtext');
        const iconName = this.getAttribute('iconname');

        this.dialogTitle = dialogTitle || this.props?.dialogTitle || "Test Title";
        this.dialogText = dialogText || this.props?.dialogText || "Test Dialog";
        this.iconName = iconName || this.props?.iconName;

        const warningIconSrc = this.iconName
            ? await this.#getSVG(this.iconName) || "../Images/warning.png"
            : "../Images/warning.png";

        const dialogTitleElem = document.createElement("p");
        dialogTitleElem.innerText = dialogTitle || this.props?.dialogTitle || "Test Title";
        dialogTitleElem.classList = "Title";

        const warningIcon = document.createElement("img");
        warningIcon.src = warningIconSrc;
        warningIcon.className = "warningIcon";

        const confirmText = document.createElement("p");
        confirmText.innerText = this.dialogText;
        confirmText.className = "confirmText";

        this.bodyDialog.appendChild(dialogTitleElem);
        this.bodyDialog.appendChild(warningIcon);
        this.bodyDialog.appendChild(confirmText);
    }

    async #createButtons()
    {
        const buttonStyles =
        {
            'height': '50px',
            'padding': '20px',
            'fontSize': '20px'
        };
        const events = this.props?.events || {};

        this.confirmBtn = await quantum.createInstance("QuantumButton",
        {
            id: `confirmBtn-${this.id}`,
            caption: 'Confirm',
            style: buttonStyles,
            events:
            {
                click: () =>
                {
                    if (events.confirm) events.confirm();
                    this.dispatchEvent(new CustomEvent("confirm"));
                    this.hide();
                }
            }
        });

        this.cancelBtn = await quantum.createInstance("QuantumButton",
        {
            id: `cancelBtn-${this.id}`,
            caption: 'Cancel',
            style: buttonStyles,
            events:
            {
                click: () =>
                {
                    if (events.cancel) events.cancel();
                    this.dispatchEvent(new CustomEvent("cancel"));
                    this.hide();
                }
            }
        });

        this.footerDialog.appendChild(this.confirmBtn);
        this.footerDialog.appendChild(this.cancelBtn);
    }

    async connectedCallback()
    {
        this.#render(await this.#getCss());
        this.#applyProps();
        await this.#addContent();
        await this.#createButtons();
        this.built();
    }

    hide()
    {
        this.mainElement.style.animationName = "hide";
        setTimeout(() =>
        {
            quantum.hide();
            this.mainElement.style.display = "none";
            this.mainElement.style.animationName = "show";
            setTimeout(() =>
            {
                this.show();
                this.mainElement.style.display = "grid";
            }, 2000);
        }, 2000);
    }
    show(){quantum.show();}
    addToBody() {quantum.addToBody(this);}
}

customElements.define('quantum-confirm', QuantumConfirm);