export class QuantumTabs extends Quantum {
    constructor(props) {
        super();
        this.name = "QuantumTabs";
        this.props = props || {};
        if (props?.id) this.id = props.id;
        this.attachShadow({ mode: 'open' });
        this.built = () => {};
    }
  
    #getTemplate() {
        // Obtener los tabs desde las props, con un valor por defecto si no se proporcionan
        const tabs = this.props.tabs || [
            { label: "Tab 1", content: "Contenido del Tab 1." },
            { label: "Tab 2", content: "Contenido del Tab 2." },
            { label: "Tab 3", content: "Contenido del Tab 3." },
            { label: "Tab 4", content: "El lol es malo." },
        ];
  
        // Generar los botones de los tabs dinámicamente
        const tabButtons = tabs.map((tab, index) => `
            <button class="tablinks" data-tab="Tab${index + 1}">${tab.label}</button>
        `).join('');
  
        // Generar el contenido de los tabs dinámicamente
        const tabContents = tabs.map((tab, index) => `
            <div id="Tab${index + 1}" class="tabcontent">
                <h3>${tab.label}</h3>
                <p>${tab.content}</p>
            </div>
        `).join('');
  
        return `
        <style>
            .tab {
                overflow: hidden;
                border: 1px solid #007BFF;
                background-color: #007BFF;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
            }
  
            .tab button {
                background-color: inherit;
                border: none;
                outline: none;
                cursor: pointer;
                padding: 14px 16px;
                transition: 0.3s;
                font-size: 17px;
                color: white;
            }
  
            .tab button:hover {
                background-color: #0056b3;
            }
  
            .tab button.active {
                background-color: #0056b3;
            }
  
            .tabcontent {
                display: none;
                padding: 20px;
                border: 1px solid #007BFF;
                border-top: none;
                background-color: white;
                color: #333;
            }
  
            .tabnav {
                background-color: inherit;
                border: none;
                outline: none;
                cursor: pointer;
                padding: 10px 15px;
                transition: 0.3s;
                font-size: 20px;
                color: white;
            }
  
            .tabnav:hover {
                background-color: #0056b3;
            }
        </style>
        <div class="tab">
            <button class="tabnav" data-direction="-1">🡄</button>
            ${tabButtons}
            <button class="tabnav" data-direction="1">🡆</button>
        </div>
        ${tabContents}
        `;
    }
  
    async #render() {
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.initializeEvents();
        this.openTab(null, 'Tab1'); // Mostrar la primera pestaña por defecto
    }
  
    initializeEvents() {
        // Botones de las pestañas
        const tabButtons = this.shadowRoot.querySelectorAll('.tablinks');
        tabButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                this.openTab(event, button.getAttribute('data-tab'));
            });
        });
  
        // Flechas de navegación
        const navButtons = this.shadowRoot.querySelectorAll('.tabnav');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const direction = parseInt(button.getAttribute('data-direction'));
                this.moveTab(direction);
            });
        });
    }
  
    openTab(evt, tabName) {
        // Ocultar todos los contenidos de las pestañas
        const tabcontent = this.shadowRoot.querySelectorAll('.tabcontent');
        tabcontent.forEach(tab => {
            tab.style.display = "none";
        });
  
        // Desactivar todos los botones de las pestañas
        const tablinks = this.shadowRoot.querySelectorAll('.tablinks');
        tablinks.forEach(link => {
            link.classList.remove("active");
        });
  
        // Mostrar el contenido de la pestaña seleccionada
        const selectedTab = this.shadowRoot.getElementById(tabName);
        if (selectedTab) {
            selectedTab.style.display = "block";
        }
  
        // Activar el botón de la pestaña seleccionada
        if (evt) {
            evt.currentTarget.classList.add("active");
        } else {
            // Activar la primera pestaña por defecto
            tablinks[0].classList.add("active");
        }
    }
  
    moveTab(direction) {
        const tabs = this.shadowRoot.querySelectorAll('.tablinks');
        const currentTab = this.shadowRoot.querySelector('.tablinks.active');
        let tabIndex = Array.prototype.indexOf.call(tabs, currentTab);
        let nextTab = tabIndex + direction;
  
        if (nextTab >= tabs.length) {
            nextTab = 0;
        } else if (nextTab < 0) {
            nextTab = tabs.length - 1;
        }
  
        tabs[nextTab].click();
    }
  
    async connectedCallback() {
        await this.#render();
        this.built();
    }
  
    addToBody() {
        quantum.addToBody(this);
    }
  }
  
  customElements.define('quantum-tabs', QuantumTabs);