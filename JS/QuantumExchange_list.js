class ExchangeList extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });

        // Clonamos el template desde el HTML
        const template = document.getElementById('exchange-list-template');
        const templateContent = template.content.cloneNode(true);

        // Cargar los estilos desde el css
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = 'exchange_list.css';

        this.shadow.appendChild(style);
        this.shadow.appendChild(templateContent);
    }

    connectedCallback() {
        this.initializeEvents();
    }

    initializeEvents() {
        const leftInput = this.shadow.querySelector('.left-input');
        const leftList = this.shadow.querySelector('.left-list');
        const rightList = this.shadow.querySelector('.right-list');
        const addToLeftButton = this.shadow.querySelector('.add-to-left');
        const moveToRightButton = this.shadow.querySelector('.move-to-right');
        const moveToLeftButton = this.shadow.querySelector('.move-to-left');

        // Agregar un nuevo elemento a la lista izquierda
        addToLeftButton.addEventListener('click', () => {
            const text = leftInput.value.trim();
            if (text) {
                const li = document.createElement('li');
                li.textContent = text;
                leftList.appendChild(li);
                leftInput.value = '';
            }
        });

        // Mover elementos seleccionados a la lista derecha
        moveToRightButton.addEventListener('click', () => {
            this.moveSelectedItems(leftList, rightList);
        });

        // Mover elementos seleccionados a la lista izquierda
        moveToLeftButton.addEventListener('click', () => {
            this.moveSelectedItems(rightList, leftList);
        });

        // seleccionar elementos en ambas listas
        leftList.addEventListener('click', (event) => {
            if (event.target.tagName === 'LI') {
                this.toggleSelection(event.target);
            }
        });

        rightList.addEventListener('click', (event) => {
            if (event.target.tagName === 'LI') {
                this.toggleSelection(event.target);
            }
        });
    }

    // Mover elementos seleccionados entre listas
    moveSelectedItems(sourceList, targetList) {
        const selectedItems = sourceList.querySelectorAll('.selected');
        selectedItems.forEach((item) => {
            item.classList.remove('selected'); // Quitamos la selección
            targetList.appendChild(item); // Movemos el elemento
        });
    }

    // Alternar la selección de un elemento
    toggleSelection(item) {
        item.classList.toggle('selected');
    }
}

customElements.define('exchange-list', ExchangeList);




