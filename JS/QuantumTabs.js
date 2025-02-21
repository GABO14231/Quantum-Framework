export class QuantumTabs extends Quantum
{
    constructor(props)
    {
        super();
        this.name = "QuantumTabs";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.attachShadow({mode: 'open'});
        this.built = () => {};
    }

    async #getCss() { return await quantum.getCssFile("QuantumTabs"); }

    #getTemplate()
    {
        return `
        <div class="tab">
            <button class="tabnav" data-direction="-1">🡄</button>
            <button class="tablinks" data-tab="Tab1">Tab 1</button>
            <button class="tablinks" data-tab="Tab2">Tab 2</button>
            <button class="tablinks" data-tab="Tab3">Tab 3</button>
            <button class="tablinks" data-tab="Tab4">Tab 4</button>
            <button class="tabnav" data-direction="1">🡆</button>
        </div>

        <div id="Tab1" class="tabcontent">
            <h3>Tab 1</h3>
            <p>Contenido del Tab 1.</p>
        </div>

        <div id="Tab2" class="tabcontent">
            <h3>Tab 2</h3>
            <p>Contenido del Tab 2.</p>
        </div>

        <div id="Tab3" class="tabcontent">
            <h3>Tab 3</h3>
            <p>Contenido del Tab 3.</p>
        </div>

        <div id="Tab4" class="tabcontent">
            <h3>Tab 4</h3>
            <p>El lol es malo.</p>
        </div>
        `;
    }

    async #render(css)
    {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.template = document.createElement('template');
        this.template.innerHTML = this.#getTemplate();
        this.shadowRoot.appendChild(this.template.content.cloneNode(true));
        this.mainElement = this.shadowRoot.querySelector('.tab');
        this.tabcontent = this.shadowRoot.querySelectorAll('.tabcontent');
        this.tablinks = this.shadowRoot.querySelectorAll('.tablinks');
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
            });
    }

    initializeEvents()
    {
        // Botones de las pestañas
        const tabButtons = this.shadowRoot.querySelectorAll('.tablinks');
        tabButtons.forEach(button =>
        {
            button.addEventListener('click', (event) => {this.openTab(event, button.getAttribute('data-tab'));});
        });

        // Flechas de navegación
        const navButtons = this.shadowRoot.querySelectorAll('.tabnav');
        navButtons.forEach(button => 
        {
            button.addEventListener('click', () =>
            {
                const direction = parseInt(button.getAttribute('data-direction'));
                this.moveTab(direction);
            });
        });
    }

    openTab(evt, tabName)
    {
        // Ocultar todos los contenidos de las pestañas
        this.tabcontent.forEach(tab => {tab.style.display = "none";});

        // Desactivar todos los botones de las pestañas
        this.tablinks.forEach(link => {link.classList.remove("active");});

        // Mostrar el contenido de la pestaña seleccionada
        const selectedTab = this.shadowRoot.getElementById(tabName);
        if (selectedTab)
            selectedTab.style.display = "block";

        // Activar el botón de la pestaña seleccionada
        if (evt)
            evt.currentTarget.classList.add("active");
        else
            // Activar la primera pestaña por defecto
            this.tablinks[0].classList.add("active");
    }

    moveTab(direction)
    {
        const tabs = this.shadowRoot.querySelectorAll('.tablinks');
        const currentTab = this.shadowRoot.querySelector('.tablinks.active');
        let tabIndex = Array.prototype.indexOf.call(tabs, currentTab);
        let nextTab = tabIndex + direction;

        if (nextTab >= tabs.length)
            nextTab = 0;
        else if (nextTab < 0)
            nextTab = tabs.length - 1;

        tabs[nextTab].click();
    }

    async connectedCallback()
    {
        await this.#render(await this.#getCss());
        await this.#applyProps();
        this.initializeEvents();
        this.openTab(null, 'Tab1');
        this.built();
    }

    addToBody() {quantum.addToBody(this);}
}

customElements.define('quantum-tabs', QuantumTabs);