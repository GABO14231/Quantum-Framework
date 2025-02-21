export class QuantumMenuBar extends Quantum {
    constructor(props) {
        super();
        this.name = "QuantumMenuBar";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.attachShadow({ mode: 'open' });
        this.built = () => {};
    }

    #getTemplate() {
        return `
        <nav class="menu">
            <slot></slot> <!-- Aquí se insertarán los elementos hijos -->
        </nav>
        `;
    }

    async #getCss() {
        return await quantum.getCssFile("QuantumMenuBar");
    }

    async #render(css) {
        this.template = document.createElement('template');
        this.template.innerHTML = this.#getTemplate();
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        const tpc = this.template.content.cloneNode(true);
        this.mainElement = tpc.firstElementChild;
        this.shadowRoot.appendChild(this.mainElement);
        this.renderMenu();
    }

    renderMenu() {
        const menuContainer = this.shadowRoot.querySelector('.menu');
        const menuItems = Array.from(this.children);

        menuItems.forEach(menuItem => {
            const title = menuItem.getAttribute('title');
            const itemElement = document.createElement('div');
            itemElement.classList.add('menu-item');
            itemElement.textContent = title;

            const submenuItems = Array.from(menuItem.children);
            if (submenuItems.length > 0) {
                const submenuElement = document.createElement('div');
                submenuElement.classList.add('submenu');

                submenuItems.forEach(submenuItem => {
                    const subTitle = submenuItem.getAttribute('title');
                    const subItemElement = document.createElement('div');
                    subItemElement.classList.add('submenu-item');
                    subItemElement.textContent = subTitle;
                    submenuElement.appendChild(subItemElement);
                });

                itemElement.appendChild(submenuElement);
                itemElement.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const submenus = this.shadowRoot.querySelectorAll('.submenu');
                    submenus.forEach(sub => {
                        if (sub !== submenuElement) {
                            sub.style.display = 'none';
                        }
                    });
                    submenuElement.style.display = submenuElement.style.display === 'block' ? 'none' : 'block';
                });
            }

            menuContainer.appendChild(itemElement);
        });
    }

    async connectedCallback() {
        await this.#render(await this.#getCss());
        this.built();
    }
}

export class QuantumMenuItem extends Quantum {
    constructor(props) {
        super();
        this.name = "QuantumMenuItem";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.attachShadow({ mode: 'open' });
        this.built = () => {};
    }

    async connectedCallback() {
        this.built();
    }
}

export class QuantumSubmenuItem extends Quantum {
    constructor(props) {
        super();
        this.name = "QuantumSubmenuItem";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.attachShadow({ mode: 'open' });
        this.built = () => {};
    }

    async connectedCallback() {
        this.built();
    }
}

customElements.define('quantum-menu-bar', QuantumMenuBar);
customElements.define('quantum-menu-item', QuantumMenuItem);
customElements.define('quantum-submenu-item', QuantumSubmenuItem);