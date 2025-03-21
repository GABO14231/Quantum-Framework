export class QuantumSelect extends HTMLElement {
    constructor() {
        super();
        this.name = "QuantumSelect";
        this.attachShadow({ mode: 'open' });
        this.options = [];
        this.isOpen = false;
        this.selectedText = "";
        this.built = () => {};
    }

    async #getCss() {
        try {
            const css = await quantum.getCssFile(this.name);
            return css;
        } catch (error) {
            console.error("Error al cargar el CSS:", error);
            return "";
        }
    }

    #getTemplate() {
        return `
            <div class="QuantumSelectContainer">
                <div class="QuantumSelect">
                    <span class="selected-text">${this.selectedText || "Selecciona una opción"}</span>
                    <div class="arrow">▼</div>
                </div>
                <ul class="QuantumSelectOptions">
                    ${this.options.map(option => `
                        <li>${option}</li>
                    `).join('')}
                </ul>
                <div class="QuantumSelectLabel">${this.getAttribute("label") || "Etiqueta"}</div>
            </div>
        `;
    }

    #addEventListenersToOptions() {
        if (this.optionsContainer) {
            const optionsList = this.optionsContainer.querySelectorAll("li");
            optionsList.forEach((option) => {
                option.addEventListener("click", (event) => {
                    event.stopPropagation();
                    this.selectedText = option.textContent;
                    this.selectElement.querySelector(".selected-text").textContent = this.selectedText;
                    this.isOpen = false;
                    this.optionsContainer.classList.remove("open");
                    this.selectElement.classList.remove("active");
                    console.log(`Has seleccionado la opción: ${this.selectedText}`);
                });
            });
        } else {
            console.error("No se encontró el contenedor de opciones.");
        }
    }

    async #render() {
        const css = await this.#getCss();
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.shadowRoot.innerHTML = this.#getTemplate();

        this.selectElement = this.shadowRoot.querySelector(".QuantumSelect");
        this.optionsContainer = this.shadowRoot.querySelector(".QuantumSelectOptions");

        this.selectElement.addEventListener("click", (event) => {
            event.stopPropagation();
            this.isOpen = !this.isOpen;
            this.optionsContainer.classList.toggle("open");
            this.selectElement.classList.toggle("active");
        });

        document.addEventListener("click", () => {
            if (this.isOpen) {
                this.isOpen = false;
                this.optionsContainer.classList.remove("open");
                this.selectElement.classList.remove("active");
            }
        });

        this.#addEventListenersToOptions();
    }

    set addOption(options) {
        if (Array.isArray(options)) {
            this.options = options;
            if (this.shadowRoot) {
                this.optionsContainer = this.shadowRoot.querySelector(".QuantumSelectOptions");
                if (this.optionsContainer) {
                    this.optionsContainer.innerHTML = options.map(option => `
                        <li>${option}</li>
                    `).join('');
                    this.#addEventListenersToOptions();
                }
            }
        } else {
            console.error("addOption debe ser un array de opciones.");
        }
    }

    static get observedAttributes() {
        return ["addOption"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "addOption" && oldValue !== newValue) {
            const options = JSON.parse(newValue);
            this.addOption = options;
        }
    }

    async connectedCallback() {
        if (this.hasAttribute("addoption")) {
            const options = JSON.parse(this.getAttribute("addoption"));
            this.addOption = options;
        }

        await this.#render();
        this.built();
    }
}

customElements.define("quantum-select", QuantumSelect);