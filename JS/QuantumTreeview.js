export class QuantumTreeview extends Quantum {
    constructor(props) {
        super();
        this.name = "QuantumTreeview";
        this.props = props || {};
        this.id = props?.id || null;
        this.attachShadow({ mode: 'open' });
        this.built = () => { };
    }

    async connectedCallback() {
        await this.#render(await this.#getCss());
        this.#initializeEvents();
        this.built();
    }

    #getTemplate() {
        return `
            <div class="tree-container">
                ${this.#generateTreeHTML(this.props?.data || [])}
            </div>
        `;
    }

    async #getCss() {
        return await quantum.getCssFile("QuantumTreeview");
    }

    async #render(css) {
        const template = document.createElement('template');
        template.innerHTML = this.#getTemplate();

        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [styleSheet];

        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    #generateTreeHTML(data) {
        if (!Array.isArray(data) || data.length === 0) return '<p>No hay datos disponibles.</p>';

        return `
            <ul>
                ${data.map(item => `
                    <li>
                        <label>
                            <input type="checkbox" class="tree-checkbox" name="${item.name}"> ${item.name}
                        </label>
                        ${item.children?.length ? this.#generateTreeHTML(item.children) : ''}
                    </li>
                `).join('')}
            </ul>
        `;
    }

    #initializeEvents() {
        this.shadowRoot.querySelector('.tree-container').addEventListener('change', (event) => {
            this.#handleCheckboxChange(event.target);
        });
    }

    #handleCheckboxChange(checkbox) {
        const listItem = checkbox.closest('li');

        console.log('checkbox', checkbox)

        // Update child checkboxes if any
        this.#toggleChildCheckboxes(listItem, checkbox.checked);

        // Update all parent checkboxes recursively
        this.#updateParentCheckboxes(listItem);
    }

    #toggleChildCheckboxes(listItem, isChecked) {
        const childCheckboxes = listItem.querySelector('ul')?.querySelectorAll(':scope > li > label > .tree-checkbox') || [];
        childCheckboxes.forEach(child => {
            child.checked = isChecked;
            child.indeterminate = false;
        });
    }

    #updateParentCheckboxes(listItem) {
        while (listItem.parentElement && listItem.parentElement.closest('li')) {
            const parentLi = listItem.parentElement.closest('ul');
            const parentCheckbox = parentLi.parentElement.querySelector('.tree-checkbox');
            const siblingCheckboxes = parentLi.querySelectorAll(':scope > li > label > .tree-checkbox') || [];
            const childrenCheckboxes = listItem.parentElement.querySelectorAll(':scope > ul > li > label > .tree-checkbox') || [];

            const allChecked = [...siblingCheckboxes].every(cb => cb.checked);
            const someChecked = [...childrenCheckboxes].some(cb => cb.checked);

            parentCheckbox.checked = allChecked;
            parentCheckbox.indeterminate = !allChecked && someChecked;

            listItem = parentLi;
        }
    }

    addToBody() {
        quantum.addToBody(this);
    }
}

customElements.define('quantum-treeview', QuantumTreeview);
