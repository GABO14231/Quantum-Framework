export class QuantumPopupmenu extends Quantum {
    constructor(props) {
        super(props);
        this.name = "QuantumPopupmenu";
        this.attachShadow({ mode: 'open' });
        this.currentMenu = 'main'; // Menú inicial
        this.previousMenus = []; // Pila para manejar el historial de menús
        this.menus = props?.menus || this.#parseMenusFromAttributes(); // Estructura de menús
    }
    // Método para obtener el CSS
    async #getCssFile() {
        try {
            const css = await quantum.getCssFile(this.name);
            if (!css) {
                console.error(`El archivo CSS para ${this.name} está vacío o no se encontró.`);
                return ""; // Devolver una cadena vacía si no hay CSS
            }
            return css;
        } catch (error) {
            console.error(`Error al obtener el CSS de ${this.name}:`, error);
            return ""; // Evitar fallos si no se encuentra el CSS
        }
    }

    // Método privado para parsear el atributo "menus" desde HTML
    #parseMenusFromAttributes() {
        if (this.hasAttribute("menus")) {
            try {
                const menusAttribute = this.getAttribute("menus");
                return JSON.parse(menusAttribute); // Convertir la cadena JSON en un objeto
            } catch (error) {
                console.error("Error al parsear el atributo 'menus':", error);
                return {}; // Devolver un objeto vacío si hay un error
            }
        }
        return {}; // Devolver un objeto vacío si no hay atributo "menus"
    }

    // Método para generar el template del menú actual
    #getTemplate() {
        const menu = this.menus[this.currentMenu];
        if (!menu) {
            console.error(`El menú ${this.currentMenu} no está definido.`);
            return '<div>Error: Menú no definido</div>'; // Mensaje de error en el DOM
        }
    
        return `
            <div class="QuantumPopupmenu">
                <div class="header">${menu.title}</div>
                <div class="container">
                    ${menu.items.map(item => `
                        <div class="menu-item" data-submenu="${item.submenu || ''}">
                            ${item.title}
                            ${item.submenu ? '<span class="arrow">▶</span>' : ''}
                        </div>
                    `).join('')}
                    ${this.currentMenu !== 'main' ? '<div class="back-button" id="back-button">Atrás</div>' : ''}
                </div>
            </div>
        `;
    }

    // Método para renderizar el menú actual
    async #render() {
        const css = await this.#getCssFile(); // Obtener el CSS
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
    
        // Limpiar el contenido del shadow DOM antes de renderizar
        this.shadowRoot.innerHTML = '';
    
        // Aplicar el CSS y renderizar el menú
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.#addEventListeners();
    }

    // Método para agregar eventos
    #addEventListeners() {
        const items = this.shadowRoot.querySelectorAll('.menu-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const submenu = item.getAttribute('data-submenu');
                if (submenu) {
                    this.previousMenus.push(this.currentMenu); // Guardar el menú actual
                    this.currentMenu = submenu;
                    this.#render(); // Renderizar el nuevo menú
                } else {
                    console.log(`Seleccionaste: ${item.textContent.trim()}`); // Acción para el último menú
                }
            });
        });
    
        const backButton = this.shadowRoot.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                if (this.previousMenus.length > 0) {
                    this.currentMenu = this.previousMenus.pop(); // Recuperar el menú anterior
                    this.#render(); // Renderizar el menú anterior
                }
            });
        }
    }

    // Método llamado cuando el componente se conecta al DOM
    async connectedCallback() {
        const css = await this.#getCssFile(); // Obtener el CSS
        await this.#render(css); // Renderizar el menú inicial
    }

    // Método llamado cuando el componente se elimina del DOM
    disconnectedCallback() {
        console.log(`${this.name} se eliminó del DOM`);
    }
}

// Registrar el componente como un custom element
customElements.define("quantum-popupmenu", QuantumPopupmenu);