export class QuantumExchange extends Quantum
{
    constructor(props)
    {
        super();
        this.name = "QuantumExchange";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.attachShadow({mode: 'open'});
        this.built = () => {};
    }

    #getTemplate()
    {
        return `
        <div class="list-container">
            <div class="list left">
                <h3>Lista Izquierda</h3>
                <ul class="left-list"></ul>
                <input type="text" class="left-input" placeholder="Agregar texto">
                <button class="add-to-left">Agregar</button>
            </div>
            <div class="controls">
                <button class="move-to-right">&gt;</button>
                <button class="move-to-left">&lt;</button>
            </div>
            <div class="list right">
                <h3>Lista Derecha</h3>
                <ul class="right-list"></ul>
            </div>
        </div>
        `;
    }

    async #getCss() {return await quantum.getCssFile("QuantumExchange");}

    async #render(css)
    {
        this.template = document.createElement('template');
        this.template.innerHTML = this.#getTemplate();
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        const tpc = this.template.content.cloneNode(true);
        this.mainElement = tpc.firstElementChild;
        this.leftInput = this.mainElement.querySelector('.left-input');
        this.leftList = this.mainElement.querySelector('.left-list');
        this.rightList = this.mainElement.querySelector('.right-list');
        this.addToLeftButton = this.mainElement.querySelector('.add-to-left');
        this.moveToRightButton = this.mainElement.querySelector('.move-to-right');
        this.moveToLeftButton = this.mainElement.querySelector('.move-to-left');
        this.shadowRoot.appendChild(this.mainElement);
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
        this.addToLeftButton.addEventListener('click', () =>
        {
            const text = this.leftInput.value.trim();
            if (text) {
                const li = document.createElement('li');
                li.textContent = text;
                this.leftList.appendChild(li);
                this.leftInput.value = '';
            }
        });

        // Mover elementos seleccionados a la lista derecha
        this.moveToRightButton.addEventListener('click', () => {
            this.moveSelectedItems(this.leftList, this.rightList);
        });

        // Mover elementos seleccionados a la lista izquierda
        this.moveToLeftButton.addEventListener('click', () => {
            this.moveSelectedItems(this.rightList, this.leftList);
        });

        // seleccionar elementos en ambas listas
        this.leftList.addEventListener('click', (event) => {
            if (event.target.tagName === 'LI') {
                this.toggleSelection(event.target);
            }
        });

        this.rightList.addEventListener('click', (event) => {
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

    async connectedCallback() {
        await this.#render(await this.#getCss());
        await this.#applyProps();
        this.initializeEvents();
        this.built();
    }
    addToBody() {quantum.addToBody(this);}
}

customElements.define('quantum-exchange', QuantumExchange);