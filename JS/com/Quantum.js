export const Quantum = class extends HTMLElement{
    constructor(props){
        super()
        if(props) this.props = props;
        this.modules = new Map();
        this.instances = new Map();
        this.mapcallbackids = new Map();
        this._callBack = ()=>{};
        this.allBuilt = ()=>{};
        this.svgFiles = new Map();
        this.actZIndex = 0;
        this.cssFiles = new Map();
    } 
    
    async getCssFile(filename) {
        if (!this.cssFiles.has(filename)) {
            try {
                let css = await fetch(quantum.routes.css + filename + ".css").then(response => response.text());
                this.cssFiles.set(filename, css);
            } catch (error) {
                console.error(`Failed to fetch CSS file: ${filename}`, error);
                return null;
            }
        }
        return this.cssFiles.get(filename);
    }

    async getSVG(fileName) {
        if (!this.svgFiles.has(fileName)) {
            try {
                let svgResponse = await fetch(quantum.routes.icons + fileName + ".svg");

                if (!svgResponse.ok) {
                    throw new Error(`Error at loading SVG: ${fileName}`);
                }
                let svgText = await svgResponse.text();
                if (!svgText) {
                    throw new Error(`SVG response is empty for: ${fileName}`);
                }

                this.svgFiles.set(fileName, svgText);
                return svgText;

            } catch (err) {
                console.error(`Error en getSVG: ${err.message}`);
                return null;
            }
        } else {
            return this.svgFiles.get(fileName);
        }
    }


    getMaxZIndex(){
        quantum.actZIndex++;
    }

    setCallBackBuilt(extFunct){
        this.callback = extFunct;
        return this;
    }
    
    getInstance(id){
        let e = document.getElementById(id);
        if(e) return e; 
        else 
            if(this.instances.has(id)){ return this.instances.get(id) }else {
            return null
        }
    }

    parseBoolean(val){ 
        return (String(val).toLowerCase() === 'true');
    }

    async getClass(className){
        if(!this.modules.has(className)){
            let clase = await import('./'+className+'.js');
            this.modules.set(className, clase[className]); 
        }
        return  this.modules.get(className);
    }

    notifyBuilt(id){
        if(this.mapcallbackids.has(id)){ 
            this.mapcallbackids.delete(id)  
            if(this.mapcallbackids.size===0) this._callBack();
        }
        return this;
    }

    addHTMLInstance(obj){
        if(!this.instances.has(obj.id)){
            this.instances.set(obj.id, obj);
        }
        return this;
    }

    hide(){this.hidden = true;}
    show(){this.hidden = false;}

    async createInstance(className, props){
        try{
            if(!this.instances.has(props.id)){
                props.notify = false;
                let newClass = await this.getClass(className);
                let i = new newClass(props);
                this.instances.set(props.id, i);
                return i;
            }
            else{return this.instances.get(props.id)}
        }
        catch(e){
            console.log('No se pudo crear la instancia');
            return null;
        }   
    } 
    
    set callback(val){this._callBack = val}
    get callback (){ return this.callback}
    get callbackids () {return this.mapcallbackids}
    set callbackids(arr){ for(let id of arr){this.mapcallbackids.set(id,{}); };}

}

    if (!customElements.get ('x-quantum')) {
        customElements.define ('x-quantum', Quantum);
    }

    window.Quantum = Quantum;
    window.quantum = new Quantum();
    quantum.actZIndex = 0;
    quantum.radioGroup = []
    quantum.checkGroup = []
    quantum.react = () =>{
        for(let attr in quantum){
            if(quantum[attr]){
                if(quantum[attr].value || quantum[attr].equation){
                    if(quantum[attr]._equation){
                        quantum[attr].value = eval(quantum[attr].equation.toString());
                    }
                }
            }
        }
    }
    
    quantum.routes = {
        css : '../js/css/',
        images : '../images/',
        icons : '../images/icons/'
    }

    window.Any = class{
        static observedAttributes = ["equation", "value"];
        constructor(val){
            if(val)this._value = val;else this.value=null;
            this._equation =null;
        }
        get value(){return this._value}
        set value(val){this._value = val; this.react();}
        get equation(){return this._equation}
        set equation(val){this._equation = val; this.react();}
        react(){quantum.react()}
    }
    
    window.Integer = class extends Any{
        constructor(val){super(val);}
        parse(val){this._value = val; return parseInt(this._value, 10)}
    }
    
    window.Float = class extends Any{
        constructor(val){super(val);super.add(this);}
        parse(val){this._value = val; return parseFloat(this._value)}
    }
    