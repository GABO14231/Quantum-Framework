export const QuantumCheckBox = class extends Quantum{
    static observedAttributes = ["caption"];

    constructor(props){
        super();  
        this.name = "QuantumCheckBox";
        this.props = props;     
        this.built = ()=>{}; 
        this._master = false;
        this._isBuilt = false;
        this.objectProps = new Map();
        this.attachShadow({mode:'open'});
    
    }

    #getTemplate(){
        return `
        <label class="QuantumCheckBox">
            <input type="checkbox">
            <span class="checkmark"></span>
            <label class="caption"></label>
        </label>
        `        
    }

    async #getCss(){ 
      return await quantum.getCssFile("QuantumCheckBox");
    }

    async #checkAttributes() {
        try {
            for (const attr of this.getAttributeNames()) {  
                const attrValue = this.getAttribute(attr);
                if (!attr.startsWith("on")) {
                    this.setAttribute(attr, attrValue);
                    this[attr] = attrValue;
                } else {
                    this.checkElement[attr] = this[attr];
                    this[attr] = null;
                }
    
                if (attr === "id") {
                    quantum.createInstance("QuantumCheckBox", { id: attrValue });
                    this.mainElement.id = attrValue;
                }
            }
            return this;
        } catch (error) {
            throw error;
        }
    }
    

    async #checkProps() {
        try {
            if (typeof this.props !== 'object' || !this.props) return this;
    
            for (const attr in this.props) {
                const value = this.props[attr];
    
                switch (attr) {
                    case 'style':
                        if (typeof value === 'object' && value !== null) {
                            Object.assign(this.mainElement.style, value);
                        }
                        break;
                    
                    case 'events':
                        if (typeof value === 'object' && value !== null) {
                            for (const event in value) {
                                if (typeof value[event] === 'function') {
                                    this.spanElement.addEventListener(event, (ev) => {
                                        ev.preventDefault();
                                        ev.stopImmediatePropagation();
                                        if (!this.disabled) value[event]();
                                    }, false);
                                }
                            }
                        }
                        break;
                    
                    default:
                        this.setAttribute(attr, value);
                        this[attr] = value;
                        if (attr === 'id') {
                            quantum.createInstance('QuantumCheckBox', { id: value });
                            this.mainElement.id = value;
                            this.id = value;
                        }
                        break;
                }
            }
    
            return this;
        } catch (error) {
            console.error("Error in checkProps:", error);
            throw error;
        }
    }
    
    
    
    async connectedCallback(){
        let sheet = new CSSStyleSheet();
        sheet.replaceSync(await this.#getCss());
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.template = document.createElement('template');
        this.template.innerHTML = this.#getTemplate();
        let tpc = this.template.content.cloneNode(true);  
        this.mainElement = tpc.firstChild.nextSibling;
        this.checkElement = this.mainElement.firstChild.nextSibling;
        this.labelElement = this.mainElement.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;
        this.spanElement = this.mainElement.firstChild.nextSibling.nextSibling.nextSibling;
        this.shadowRoot.appendChild(this.mainElement);        
        await this.#checkAttributes();
        await this.#checkProps();
        this.builtEvents();
        this.#applyProps();
        this._isBuilt = true;
        quantum.notifyBuilt(this.id);
        this.built();
        console.log("hola");
        
    }


    builtEvents(){
        this.checkElement.addEventListener('keyup', (ev)=>{
            ev.preventDefault(); 
            ev.stopImmediatePropagation();
            if(ev.key === 'Enter' && !this.disabled){
                if(this.checked)this.checked = false; else this.checked=true; 
                this.dispatchEvent(new CustomEvent("enter", {bubbles: true})); 
            };
        }, false);  
        this.checkElement.addEventListener('change', (ev)=>{
            ev.preventDefault();
            ev.stopImmediatePropagation();if(!this.disabled){ 
             }
        }, false);
    }

    addToBody(){
        document.body.appendChild(this);
    }

    async #applyProps() {
        try {
            for (const [key, val] of this.objectProps.entries()) {
                switch (val.obj) {
                    case 'mainElement':
                        this.mainElement[key] = val.value;
                        break;
                    case 'checkElement':
                        this.checkElement[key] = val.value;
                        break;
                    case 'labelElement':
                        this.labelElement[key] = val.value;
                        break;
                    case 'funct':
                        await val.funct(val.value);
                        break;
                }
                this.objectProps.delete(key);
            }
            return this;
        } catch (e) {
            throw e;
        }
    }
    
    #checking(val){
        this.checkElement.checked = val;

    }

    #checkDisable(val){
        if(val){this.style.opacity = 0.3

        } else {
            this.style.opacity = 1
        }
    }

    get caption (){
        return this.mainElement.innerText
    }    
    set caption(val){
        this.setAttribute('caption', val);
        if(this.labelElement) this.labelElement.innerText = val;
        else {this.objectProps.set('innerText', {'obj' :'labelElement', 'value':val})}
        this.dispatchEvent(new CustomEvent("changeCaption", {bubbles: true}));        
    }
    
    get checked (){return this.checkElement.checked}

    set checked (val){        
        if(this.checkElement){
            this.checkElement.checked = val;
            this.#checking(val);
        }
        else{
            this.objectProps.set('checked', {'obj' :'checkElement', 'value':val, 'funct':this.#checking})
        }
    }
    get disabled (){return this.checkElement.disabled}
    set disabled(val){
        this.setAttribute('disabled', val);
        if(this.checkElement) {this.checkElement.disabled = val; this.#checkDisable(val)}
        else{ this.objectProps.set('disabled', {'obj' :'checkElement', 'value':val, 'funct':this.#checkDisable})}
    }
    
}
if (!customElements.get ('quantum-check')) {
    customElements.define ('quantum-check', QuantumCheckBox);
}