export class QuantumMenuBar extends Quantum {
    constructor(props) {
        super();
        this.name = "QuantumMenuBar";
        this.props = props || {};
        if (props?.id) this.id = props.id;
        this.attachShadow({ mode: 'open' });
        this.built = () => {};
        this.menuItems = []; // Almacenará los elementos del menú
    }

    #getTemplate() {
        return `
        <style>
            .menu {
                display: flex;
                background-color: #007BFF;
                padding: 10px;
                color: white;
            }

            .menu-item {
                position: relative;
                padding: 10px 20px;
                cursor: pointer;
            }

            .menu-item:hover {
                background-color: #0056b3;
            }

            .submenu {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                background-color: #007BFF;
                min-width: 150px;
                box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
                z-index: 1;
            }

            .submenu-item {
                padding: 10px 20px;
                cursor: pointer;
            }

            .submenu-item:hover {
                background-color: #0056b3;
            }
        </style>
        <nav class="menu"></nav>
        `;
    }

    async #render() {
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.renderMenu();
    }

    /**
     * Agrega un elemento al menú.
     * @param {string} title - El título del elemento.
     * @param {Array} subItems - Un array de strings con los subelementos (opcional).
     */
    addMenuItem(title, subItems = []) {
        this.menuItems.push({ title, subItems });
        this.renderMenu(); // Vuelve a renderizar el menú
    }

    /**
     * Renderiza el menú basado en los elementos almacenados en `this.menuItems`.
     */
    renderMenu() {
        const menuContainer = this.shadowRoot.querySelector('.menu');
        menuContainer.innerHTML = ''; // Limpiar el menú antes de renderizar

        this.menuItems.forEach(menuItem => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('menu-item');
            itemElement.textContent = menuItem.title;

            if (menuItem.subItems.length > 0) {
                const submenuElement = document.createElement('div');
                submenuElement.classList.add('submenu');

                menuItem.subItems.forEach(subItem => {
                    const subItemElement = document.createElement('div');
                    subItemElement.classList.add('submenu-item');
                    subItemElement.textContent = subItem;
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
        await this.#render();
        this.built();
    }
}

customElements.define('quantum-menu-bar', QuantumMenuBar);