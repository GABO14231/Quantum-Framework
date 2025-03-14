export class QuantumDialog extends Quantum
{
    constructor(props)
    {
        super();
        this.name = "QuantumDialog";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.attachShadow({mode: 'open'});
        this.built = () => {};
    }

    async #getCss() {return await quantum.getCssFile(this.name);}

    #getTemplate()
    {
        return `
        <div class="QuantumDialog">
            <div class="drag-handle"></div>
                <span class="close-button">X</span>
                <h2 class="main-message"></h2>
                <p class="sub-message"></p>
                <div class="buttons">
                    <button class="cancel"></button>
                    <button class="accept"></button>
                </div>
            <div class="resize-handle"></div>
        </div>
        `;
    }

    #render(css)
    {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.mainElement = this.shadowRoot.querySelector('.QuantumDialog');
        this.mainMessage = this.mainElement.querySelector('.main-message');
        this.subMessage = this.mainElement.querySelector('.sub-message');
        this.buttons = this.mainElement.querySelector('.buttons');
        this.cancelButton = this.mainElement.querySelector('.cancel');
        this.acceptButton = this.mainElement.querySelector('.accept');
        this.closeButton = this.mainElement.querySelector('.close-button');
        this.resizeHandle = this.mainElement.querySelector('.resize-handle');
        this.dragHandle = this.mainElement.querySelector('.drag-handle');
    }

    #initializeAttributes()
    {
        this.acceptButtonText = this.getAttribute('acceptButtonText') || '';
        this.cancelButtonText = this.getAttribute('cancelButtonText') || '';
        this.mainMessageText = this.getAttribute('mainMessage') || '';
        this.subMessageText = this.getAttribute('subMessage') || '';
        this.showButtons = this.getAttribute('showButtons') === 'true';
        this.showCloseButton = this.getAttribute('closeButton') === 'true';
        this.isModal = this.getAttribute('isModal') === 'true';
    }

    #applyProps()
    {
        if (this.props)
        {
          Object.entries(this.props).forEach(([key, value]) =>
          {
              if (key === 'acceptButtonText') this.acceptButton.innerText = value;
              else if (key === 'cancelButtonText') this.cancelButton.innerText = value;
              else if (key === 'mainMessage') this.mainMessage.innerText = value;
              else if (key === 'subMessage') this.subMessage.innerText = value;
              else if (key === 'showButtons')
              {
                  if (value === true) this.buttons.style.display = 'flex';
                  else this.buttons.style.display = 'none';
              }
              else if (key === 'closeButton' && value === true) this.closeButton.style.display = 'block';
              else if (key === 'isModal' && value === true)
              {
                  this.style.background = 'rgba(0, 0, 0, 0.5)';
                  this.style.pointerEvents = 'auto';
              }
              else if (key === 'style') Object.assign(this.mainElement.style, value);
              else if (key === 'events')
                  Object.entries(value).forEach(([event, handler]) => this.mainElement.addEventListener(event, handler));
              else {this[key] = value; this.setAttribute(key, value);}
          });
        }
        else
        {
            this.acceptButton.innerText = this.acceptButtonText;
            this.cancelButton.innerText = this.cancelButtonText;
            this.mainMessage.innerText = this.mainMessageText;
            this.subMessage.innerText = this.subMessageText;
            this.buttons.style.display = this.showButtons ? 'flex' : 'none';
            this.closeButton.style.display = this.showCloseButton ? 'block' : 'none';
            if (this.isModal)
            {
                this.style.background = 'rgba(0, 0, 0, 0.5)';
                this.style.pointerEvents = 'auto';
            }
        }
    }

    async connectedCallback()
    {
        this.#render(await this.#getCss());
        this.#initializeAttributes();
        this.#applyProps();
        this.#events();
        this.built();
    }

    #events()
    {
        this.cancelButton.addEventListener('click', () => this.closeDialog('cancel'));
        this.acceptButton.addEventListener('click', () => this.closeDialog('accept'));
        if (this.getAttribute('showCloseButton') === 'true')
            this.closeButton.addEventListener('click', () => this.closeDialog('close'));
        if (this.getAttribute('isDraggable') === 'true') this.makeDraggable();
        if (this.getAttribute('enableResize') === 'true') this.makeResizable();
    }

    openDialog() {this.style.display = 'flex';}
    closeDialog(action)
    {
        this.style.display = 'none';
        this.dispatchEvent(new CustomEvent('dialog-closed', {detail: {action}}));
    }

    makeDraggable()
    {
        let isDragging = false;
        let offsetX, offsetY;

        this.dragHandle.addEventListener('mousedown', (e) =>
        {
            isDragging = true;
            // Calculamos la posición del cursor en relación con el diálogo
            const rect = this.mainElement.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            // Aplicamos estilos para que el diálogo siga el cursor
            this.dragHandle.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) =>
        {
            if (isDragging)
            {
              // Calculamos la nueva posición del diálogo
              const x = e.clientX - offsetX;
              const y = e.clientY - offsetY;
              // Movemos el diálogo
              this.mainElement.style.left = `${x}px`;
              this.mainElement.style.top = `${y}px`;
            }
        });

        document.addEventListener('mouseup', () =>
        {
            isDragging = false;
            this.dragHandle.style.cursor = 'grab';
        });
    }

    makeResizable()
    {
        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        this.resizeHandle.addEventListener('mousedown', (e) =>
        {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(this.mainElement).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(this.mainElement).height, 10);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) =>
        {
            if (isResizing)
            {
                const newWidth = startWidth + (e.clientX - startX); // Redimensionar horizontal
                const newHeight = startHeight + (e.clientY - startY); // Redimensionar vertical
                // Aplicamos el nuevo ancho y alto al diálogo
                this.mainElement.style.width = `${newWidth}px`;
                this.mainElement.style.height = `${newHeight}px`;
            }
        });

        document.addEventListener('mouseup', () => {isResizing = false;});
    }
    addToBody() {quantum.addToBody(this);}
}

customElements.define('quantum-dialog', QuantumDialog);