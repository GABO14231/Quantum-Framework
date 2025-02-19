export let Button = class extends HTMLElement{
    constructor(props){
        super(props);
        this.name = 'Button';
        this.props = props;   
        this._caption = '';
        this.style.visibility = "hidden";
        this.addToBody();    
    }

    show(){
        this.style.visibility = "visible";
        return this;
    }

    hide(){
        this.style.visibility = "hidden";
        return this;
    }

    addToBody(){
        document.body.appendChild(this);
        return this;
    }

    async connectedCallback(){
        fast.fastStyle.append(`@import url("${fast.paths.css}${this.name}.css");`);
        let objContent = await fast.setTemplate(this.name+'Template.html');
        this.mainElement = objContent.mainElement;
        this.template = objContent.template;
        this.mainElement.className = this.name;
        this.className = this.name;
        if(this.props){ 
            Object.assign(this, this.props);
            if(this.props.style){
                Object.assign(this.style, this.props.style)
            }
        }
        // this.disabled = true;
        // console.log(this.template);
        // console.log(this.mainElement);
    } 

    focus(){this.mainElement.focus()}

    /**
    * @property {boolean} caption es el texto que se coloca al botón el cual, se muestra en el centro del mismo
    */
    get caption(){return this._caption;}
    set caption(val){
        this._caption = val; 
        this.innerText = this._caption;
    }
    /**
    * @property {boolean} disabled propiedad que deshabilita o habilita el botón, "true" deshabilita y "false" habilita
    */
    get disabled(){return this.disabled;}
    set disabled(val){
        console.log('DISABLED');
        this.setAttribute('disabled', val);
        // this.setAttribute('inert', val);
    }
}
customElements.define('fast-button', Button);
customElements.whenDefined('fast-button').then((e)=>{
    console.log('WHEN DEFINED', fast.fastStyle);

})
