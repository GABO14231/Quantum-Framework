class CustomDialog extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
  
      // Atributos por defecto
      this.showCloseButton = this.getAttribute('show-close-button') === 'true';
      this.isModal = this.getAttribute('is-modal') === 'true';
      this.isDraggable = this.getAttribute('is-draggable') === 'true';
      this.showButtons = this.getAttribute('show-buttons') === 'true';
      this.acceptButtonText = this.getAttribute('accept-button-text') || 'Aceptar';
      this.cancelButtonText = this.getAttribute('cancel-button-text') || 'Cancelar';
      this.enableResize = this.getAttribute('enable-resize') === 'true'; // Nuevo atributo
  
      // Renderizar el contenido inicial
      this.render();
    }
  
    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${this.isModal ? 'rgba(0, 0, 0, 0.5)' : 'transparent'};
            justify-content: center;
            align-items: center;
            pointer-events: ${this.isModal ? 'auto' : 'none'};
          }
          .dialog {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
            position: absolute;
            pointer-events: auto;
            overflow: hidden; /* Cambié a hidden para evitar que el contenido se desborde */
            min-width: 100px;  /* Puedes poner un valor mínimo si lo deseas */
            min-height: 100px; /* Puedes poner un valor mínimo si lo deseas */
          }
          .close-button {
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            display: ${this.showCloseButton ? 'block' : 'none'};
          }
          .buttons {
            margin-top: 20px;
            display: ${this.showButtons ? 'flex' : 'none'};
            justify-content: space-between;
          }
          button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          button.cancel {
            background: #f44336;
            color: white;
          }
          button.accept {
            background: #4caf50;
            color: white;
          }
          .resize-handle {
            width: 16px;
            height: 16px;
            position: absolute;
            right: 0;
            bottom: 0;
            cursor: se-resize;
            background-color: transparent;
          }
          .resize-handle::before,
          .resize-handle::after {
            content: '';
            position: absolute;
            background: #888;
          }
          .resize-handle::before {
            width: 2px;
            height: 10px;
            right: 4px;
            bottom: 4px;
          }
          .resize-handle::after {
            width: 10px;
            height: 2px;
            right: 4px;
            bottom: 4px;
          }
          .drag-handle {
            width: 100%;
            height: 30px;
            position: absolute;
            top: 0;
            left: 0;
            cursor: grab;
            background-color: transparent;
          }
        </style>
        <div class="dialog">
          <div class="drag-handle"></div>
          <span class="close-button">X</span>
          <h2 id="main-message">${this.getAttribute('main-message') || 'Mensaje Principal'}</h2>
          <p id="sub-message">${this.getAttribute('sub-message') || 'Submensaje'}</p>
          <div class="buttons">
            <button class="cancel">${this.cancelButtonText}</button>
            <button class="accept">${this.acceptButtonText}</button>
          </div>
          <div class="resize-handle"></div>
        </div>
      `;
  
      // Referencias a los elementos del DOM
      this.mainMessage = this.shadowRoot.getElementById('main-message');
      this.subMessage = this.shadowRoot.getElementById('sub-message');
      this.cancelButton = this.shadowRoot.querySelector('.cancel');
      this.acceptButton = this.shadowRoot.querySelector('.accept');
      this.closeButton = this.shadowRoot.querySelector('.close-button');
      this.dialog = this.shadowRoot.querySelector('.dialog');
      this.resizeHandle = this.shadowRoot.querySelector('.resize-handle');
      this.dragHandle = this.shadowRoot.querySelector('.drag-handle');
  
      // Event listeners
      if (this.closeButton) {
        this.closeButton.addEventListener('click', () => this.closeDialog('close'));
      }
      if (this.cancelButton) {
        this.cancelButton.addEventListener('click', () => this.closeDialog('cancel'));
      }
      if (this.acceptButton) {
        this.acceptButton.addEventListener('click', () => this.closeDialog('accept'));
      }
  
      // Hacer el diálogo arrastrable si está habilitado
      if (this.isDraggable) {
        this.makeDraggable();
      }
  
      // Hacer el diálogo redimensionable si está habilitado
      if (this.enableResize) {
        this.makeResizable();
      }
    }
  
    openDialog() {
      this.style.display = 'flex';
    }
  
    closeDialog(action) {
      this.style.display = 'none';
      this.dispatchEvent(new CustomEvent('dialog-closed', { detail: { action } }));
    }
  
    makeDraggable() {
      let isDragging = false;
      let offsetX, offsetY;
  
      this.dragHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        // Calculamos la posición del cursor en relación con el diálogo
        const rect = this.dialog.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
  
        // Aplicamos estilos para que el diálogo siga el cursor
        this.dragHandle.style.cursor = 'grabbing';
      });
  
      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          // Calculamos la nueva posición del diálogo
          const x = e.clientX - offsetX;
          const y = e.clientY - offsetY;
  
          // Movemos el diálogo
          this.dialog.style.left = `${x}px`;
          this.dialog.style.top = `${y}px`;
        }
      });
  
      document.addEventListener('mouseup', () => {
        isDragging = false;
        this.dragHandle.style.cursor = 'grab';
      });
    }
  
    makeResizable() {
      let isResizing = false;
      let startX, startY, startWidth, startHeight;
  
      this.resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(this.dialog).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(this.dialog).height, 10);
        e.preventDefault();
      });
  
      document.addEventListener('mousemove', (e) => {
        if (isResizing) {
          const newWidth = startWidth + (e.clientX - startX); // Redimensionar horizontal
          const newHeight = startHeight + (e.clientY - startY); // Redimensionar vertical
  
          // Aplicamos el nuevo ancho y alto al diálogo
          this.dialog.style.width = `${newWidth}px`;
          this.dialog.style.height = `${newHeight}px`;
        }
      });
  
      document.addEventListener('mouseup', () => {
        isResizing = false;
      });
    }
  
    static get observedAttributes() {
      return [
        'main-message',
        'sub-message',
        'show-close-button',
        'is-modal',
        'is-draggable',
        'show-buttons',
        'accept-button-text',
        'cancel-button-text',
        'enable-resize', // Nuevo atributo
      ];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'main-message') {
        this.mainMessage.textContent = newValue;
      } else if (name === 'sub-message') {
        this.subMessage.textContent = newValue;
      } else if (name === 'show-close-button') {
        this.showCloseButton = newValue === 'true';
        this.closeButton.style.display = this.showCloseButton ? 'block' : 'none';
      } else if (name === 'is-modal') {
        this.isModal = newValue === 'true';
        this.style.background = this.isModal ? 'rgba(0, 0, 0, 0.5)' : 'transparent';
        this.style.pointerEvents = this.isModal ? 'auto' : 'none';
      } else if (name === 'is-draggable') {
        this.isDraggable = newValue === 'true';
        if (this.isDraggable) {
          this.makeDraggable();
        }
      } else if (name === 'show-buttons') {
        this.showButtons = newValue === 'true';
        const buttonsContainer = this.shadowRoot.querySelector('.buttons');
        if (buttonsContainer) {
          buttonsContainer.style.display = this.showButtons ? 'flex' : 'none';
        }
      } else if (name === 'accept-button-text') {
        this.acceptButtonText = newValue;
        if (this.acceptButton) {
          this.acceptButton.textContent = newValue;
        }
      } else if (name === 'cancel-button-text') {
        this.cancelButtonText = newValue;
        if (this.cancelButton) {
          this.cancelButton.textContent = newValue;
        }
      } else if (name === 'enable-resize') {
        this.enableResize = newValue === 'true';
        if (this.enableResize) {
          this.makeResizable();
        }
      }
    }
  }
  
  customElements.define('custom-dialog', CustomDialog);