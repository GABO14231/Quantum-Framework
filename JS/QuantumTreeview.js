export class QuantumTreeview extends Quantum {
    constructor(props) {
        super();
        this.name = "QuantumTreeview";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.attachShadow({ mode: 'open' });
        this.built = () => {};
    }

    #getTemplate() {
        return `
        <div class="tree-container">
            ${this.#generateTreeHTML(this.props?.data || [])}
        </div>
        `;
    }

    async #getCss() { return await quantum.getCssFile("QuantumTreeview"); }

    async #render(css) {
        this.template = document.createElement('template');
        this.template.innerHTML = this.#getTemplate();
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        const tpc = this.template.content.cloneNode(true);
        this.mainElement = tpc.firstElementChild;
        this.shadowRoot.appendChild(this.mainElement);
    }

    #generateTreeHTML(data) {
        if (!Array.isArray(data) || data.length === 0) return '<p>No hay datos disponibles.</p>';

        let html = '<ul>';
        data.forEach(item => {
            const hasChildren = item.children && item.children.length > 0;
            html += `
                <li>
                    <label>
                        <input type="checkbox" class="parent"> ${item.name}
                    </label>
                    ${hasChildren ? `<ul>${this.#generateTreeHTML(item.children)}</ul>` : ''}
                </li>
            `;
        });
        html += '</ul>';
        return html;
    }

    #initializeEvents() {
        const parentCheckboxes = this.shadowRoot.querySelectorAll('.parent');

        parentCheckboxes.forEach(parentCheckbox => {
            const childCheckboxes = parentCheckbox.closest('li').querySelectorAll('ul input[type="checkbox"]');

            parentCheckbox.addEventListener('change', () => {
                this.#toggleChildCheckboxes(parentCheckbox, childCheckboxes);
            });

            childCheckboxes.forEach(child => {
                child.addEventListener('change', () => {
                    this.#updateParentState(parentCheckbox, childCheckboxes);
                });
            });
        });
    }

    #toggleChildCheckboxes(parentCheckbox, childCheckboxes) {
        const isChecked = parentCheckbox.checked;
        childCheckboxes.forEach(child => {
            child.checked = isChecked;
            child.dispatchEvent(new Event('change'));
        });
    }

    #updateParentState(parentCheckbox, childCheckboxes) {
        const allChecked = Array.from(childCheckboxes).every(checkbox => checkbox.checked);
        const someChecked = Array.from(childCheckboxes).some(checkbox => checkbox.checked);
        parentCheckbox.checked = allChecked;
        parentCheckbox.indeterminate = !allChecked && someChecked;
    }

    async connectedCallback() {
        await this.#render(await this.#getCss());
        this.#initializeEvents();
        this.built();
    }

    addToBody() { quantum.addToBody(this); }
}

customElements.define('quantum-treeview', QuantumTreeview);