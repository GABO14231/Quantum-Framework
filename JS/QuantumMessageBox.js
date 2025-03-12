export class QuantumMessageBox extends Quantum{
    constructor(props){
        super()
        this.name = "QuantumMessageBox"
        this.props = props
        this.attachShadow({mode: 'open'})
        this.hide()
    }

    async #getCss(){
        return await quantum.getCssFile("QuantumMessageBox");
    }

    async #render(css){
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css)
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.template = document.createElement('template');
        this.template.innerHTML = `<div class="QuantumMessageBoxContainer" id="Container">

            <div class="QuantumMessageBoxTitleContainer">
                <label class="QuantumMessageBoxTitle"></label>
                <button class="QuantumMessageBoxExit">X</button>
            </div>

            <img class="QuantumMessageBoxIcon">
            <label class="QuantumMessageBoxInformation"></label>
            <button class="QuantumMessageBoxButton">Aceptar</button>

        </div>`;
        this.mainElement = this.template.content.cloneNode(true).firstChild
        this.titleLabel = this.mainElement.querySelector(".QuantumMessageBoxTitle")
        this.titleLabel.textContent = this.props.titleLabel
        this.informationLabel = this.mainElement.querySelector(".QuantumMessageBoxInformation")
        this.informationLabel.textContent = this.props.informationLabel
        this.icon = this.mainElement.querySelector(".QuantumMessageBoxIcon")
        this.icon.src = this.props.icon.src

        this.exitButton = this.mainElement.querySelector(".QuantumMessageBoxExit")
        this.acceptButton = this.mainElement.querySelector(".QuantumMessageBoxButton")
        
        this.shadowRoot.appendChild(this.mainElement);
    }

    async #setDragAndDropAnimation(){
        let offsetX = 0, offsetY = 0, isDragging = false;

        this.mainElement.addEventListener('mousedown', (e) => {
            offsetX = e.clientX - this.mainElement.getBoundingClientRect().left;
            offsetY = e.clientY - this.mainElement.getBoundingClientRect().top;
            isDragging = true;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                this.mainElement.style.left = `${e.clientX - offsetX}px`;
                this.mainElement.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    async #applyEvents(){
        this.exitButton.addEventListener("click", () => this.hide())
        this.acceptButton.addEventListener("click", () => this.hide())
    }

    async connectedCallback()
    {
        await this.#render(await this.#getCss())
        await this.#applyEvents()
        await this.#setDragAndDropAnimation()
    }

    addToBody(){
        quantum.addToBody(this)
    }
}

customElements.define('quantum-messagebox', QuantumMessageBox);