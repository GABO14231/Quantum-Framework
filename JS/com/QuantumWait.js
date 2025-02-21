import { Quantum } from './Quantum.js';

export const QuantumWait = class extends Quantum {
    constructor(props) {
        super(props);
        this.attachShadow({ mode: 'open' });
        this.template = this.#getTemplate();
        this.QuantumWait = document.importNode(this.template.content, true);
        this.styleLoaded = false;
    }

    #getTemplate() {
        const template = document.createElement('template');
        template.innerHTML = `
        <div>
            <img src="" class="QuantumWaitIcon" style="width: 50px; height: 50px;" />
        </div>                
        `;
        return template;
    }

    static get observedAttributes() {
        return ['icon-name', 'rotate', 'size'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.styleLoaded) {
            switch (name) {
                case 'icon-name':
                    this.updateIcon();
                    break;
                case 'rotate':
                    this.updateRotation();
                    break;
                case 'size':
                    this.updateSize();
                    break;
            }
        }
    }

    async applyStyles(cssFileName) {
        try {
            const cssText = await this.getCssFile(cssFileName);
            if (!cssText) {
                throw new Error(`Failed to load CSS: ${cssFileName}`);
            }
            this.style.visibility = 'hidden';

            const styleElement = document.createElement('style');
            styleElement.textContent = cssText;
            this.shadowRoot.appendChild(styleElement);
            this.styleLoaded = true;
            this.shadowRoot.appendChild(this.QuantumWait);
            this.updateAttributes();
            this.style.visibility = 'visible';

        } catch (error) {
            console.error('Error applying CSS file:', error);
        }
    }

    async connectedCallback() {
        console.log("QuantumWait connected!");
        await this.applyStyles('QuantumWait');
    }

    async updateIcon() {
        const iconName = this.getAttribute('icon-name');
        const svgText = await this.getSVG(iconName);
        const imgElement = this.shadowRoot.querySelector('.QuantumWaitIcon');
        if (svgText) {
            const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            imgElement.src = url;
        } else {
            imgElement.src = '';
        }
    }

    updateRotation() {
        const imgElement = this.shadowRoot.querySelector('.QuantumWaitIcon');
        const rotateValue = this.getAttribute('rotate');
        const rotateSpeed = rotateValue ? rotateValue : '2s';
        if (this.hasAttribute('rotate')) {
            imgElement.style.animation = `rotate ${rotateSpeed} linear infinite`;
        } else {
            imgElement.style.animation = '';
        }
    }

    updateSize() {
        const size = this.getAttribute('size') || '50px';
        const imgElement = this.shadowRoot.querySelector('.QuantumWaitIcon');
        imgElement.style.width = size;
        imgElement.style.height = size;
    }

    updateAttributes() {
        this.updateIcon();
        this.updateRotation();
        this.updateSize();
    }
}

window.customElements.define('quantum-wait', QuantumWait);