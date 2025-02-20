class TreeView extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });

        // Leer el atributo 'data' y convertirlo en JSON
        this.data = this.getAttribute('data') ? JSON.parse(this.getAttribute('data')) : [];

        this.render();
    }

    render() {
        this.shadow.innerHTML = ''; // Limpiar el shadow

        
        const styleLink = document.createElement('link');
        styleLink.setAttribute('rel', 'stylesheet');
        styleLink.setAttribute('href', 'treeview.css');

        // Crear contenedor del árbol
        const container = document.createElement('div');
        container.classList.add('tree-container');
        container.innerHTML = this.generateTreeHTML(this.data); 

        
        this.shadow.appendChild(styleLink);
        this.shadow.appendChild(container);

        
        this.initializeEvents();
    }

    generateTreeHTML(data) {
        if (!Array.isArray(data) || data.length === 0) return '<p>No hay datos disponibles.</p>'; //s no es arreglo bye

        let html = '<ul>';
        data.forEach(item => {
            const hasChildren = item.children && item.children.length > 0;

            html += `
                <li>
                    <label>
                        <input type="checkbox" class="parent"> ${item.name}
                    </label>
                    ${hasChildren ? `<ul>${this.generateTreeHTML(item.children)}</ul>` : ''}
                </li>
            `;
        });
        html += '</ul>';
        return html;
    }

    initializeEvents() {
        const parentCheckboxes = this.shadow.querySelectorAll('.parent');

        parentCheckboxes.forEach(parentCheckbox => {
            const childCheckboxes = parentCheckbox.closest('li').querySelectorAll('ul input[type="checkbox"]');

            // ✅ Evento para actualizar hijos cuando cambia el padre
            parentCheckbox.addEventListener('change', () => {
                this.toggleChildCheckboxes(parentCheckbox, childCheckboxes);
            });

            // ✅ Evento para actualizar el estado del padre cuando cambian los hijos o nter
            childCheckboxes.forEach(child => {
                child.addEventListener('change', () => {
                    this.updateParentState(parentCheckbox, childCheckboxes);
                });
            });
        });
    }

    toggleChildCheckboxes(parentCheckbox, childCheckboxes) {
        const isChecked = parentCheckbox.checked; // Verificar si el padre está marcado
        childCheckboxes.forEach((child) => {
            child.checked = isChecked; // Marcar/desmarcar hijos según el estado del padre
            child.dispatchEvent(new Event('change')); //  Disparar evento de cambio en los hijos
        });
    }

    updateParentState(parentCheckbox, childCheckboxes) {
        // Verificar si todos los hijos están marcados
        const allChecked = Array.from(childCheckboxes).every((checkbox) => checkbox.checked);
        // Verificar si algunos hijos están marcados
        const someChecked = Array.from(childCheckboxes).some((checkbox) => checkbox.checked);

        // Actualizar el estado del padre
        parentCheckbox.checked = allChecked; // Si todos los hijos están marcados, el padre también lo está
        parentCheckbox.indeterminate = !allChecked && someChecked; // Si no todos los hijos están marcados pero algunos sí, el padre está indeterminado
    }

    static get observedAttributes() {
        return ['data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data') {
            this.data = JSON.parse(newValue);
            this.render(); // Volver a renderizar cuando cambien los datos
        }
    }
}


customElements.define('tree-view', TreeView);











