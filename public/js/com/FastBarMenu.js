export const FastBarMenu = class extends Fast{
    #hasPanelShow = false;
    constructor(props){
        super();  
        this.name = "FastBarMenu";
        this.props = props;     
        if(props){if(props.id){this.id = props.id}} ;
        this.built = ()=>{}; 
        this.attachShadow({mode:'open'});
        this._isBuilt = false;
        this.objectProps = new Map();
        this.node = new Map();
        this._coloricon = '';
        this.initOrder = 0;
        this.ids=[];
        this.idx = -1;
    }

    #getTemplate(){ return `
            <div class='FastBarMenu'></div>
        `    
    }

    async #getCss(){ 
        return await fast.getCssFile("FastBarMenu");
    }

    #render(){
        return new Promise(async (resolve, reject)=>{
            try {
                let sheet = new CSSStyleSheet();
                let css = await this.#getCss();
                sheet.replaceSync(css);
                this.shadowRoot.adoptedStyleSheets = [sheet];
                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();
                let tpc = this.template.content.cloneNode(true);  
                this.mainElement = tpc.firstChild.nextSibling;
                this.shadowRoot.appendChild(this.mainElement);
                resolve(this);
            } catch (error) {
                reject(error);
            }
        })
    }

    #checkAttributes(){
        return new Promise(async (resolve, reject)=>{
            try {
                for(let attr of this.getAttributeNames()){          
                    if(attr.substring(0,2)!="on"){
                        this.mainElement.setAttribute(attr, this.getAttribute(attr));
                        this[attr] = this.getAttribute(attr);
                    }
                    switch(attr){
                        case 'id' : 
                            await fast.createInstance('FastBarMenu', {'id': this[attr]});
                            break;
                    }
                }
                resolve(this);
            } catch (error) {
                reject(error);
            }
        })
    }

    #checkProps(){
        return new Promise(async (resolve, reject) => {
            try {
                if(this.props){
                    for(let attr in this.props){
                        switch(attr){
                            case 'style' :
                                for(let attrcss in this.props.style) this.mainElement.style[attrcss] = this.props.style[attrcss];
                                break;
                            case 'events' : 
                                for(let attrevent in this.props.events){this.mainElement.addEventListener(attrevent, this.props.events[attrevent])}
                                break;
                            default : 
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if(attr==='id')await fast.createInstance('FastBarMenu', {'id': this[attr]});
                        }
                    }
                    resolve(this);
                }
                else { resolve();}        
            } catch (error) {
                reject(error);
            }
        })
    }
    
    async connectedCallback(){
        await this.#render();
        await this.#checkAttributes();
        await this.#checkProps();
        this._isBuilt = true;
        await this.#applyProps();
        this.built();
    }

    #applyProps(){ 
        return new Promise((resolve, reject)=>{
            try{
                for (const [key, value] of this.objectProps.entries()) {
                    this.mainElement[key] = fast.parseBoolean(value);
                    this.objectProps.delete(key);
                }
                resolve(this)
            }
            catch(e){
                reject(e);
            }
        })
    }

    #renderIcon(opt){
        return new Promise(async (resolve, reject) => {
            try {
                if(opt.coloricon){this.coloricon = opt.coloricon}
                let i = await fast.createInstance("FastIcon", {
                    'id': this.id+opt.iconname+opt.text,
                    'iconname' : opt.iconname,
                    'style' : {
                        'position': 'relative',
                        'box-shadow':'none', 
                        'border-style': 'none',
                        'width' : '16px',
                        'height':'16px',
                        'fill' : this._coloricon,
                    }
                });
                resolve(i);      
            } 
            catch (error) {
                reject(error);
            }
        })
    }

    #createPopup(){
        let sm = document.createElement("div");
        sm.className = "FastPanelSubMenu";
        sm.style.display = 'none';
        return sm;
    }

    #closeAllPanel(){
        this.node.forEach(async opt =>{
            if(opt.parentId==='root'){ opt.panelSM.style.display='none' }
            else{ if(opt.panelSM){ opt.panelSM.style.display='none' } }
        });
        this.#hasPanelShow = false;
    }

    #showPanel(opt){
        opt.panelSM.style.display = 'grid';
        this.#hasPanelShow = true;
    }

    #getOptSubMenu(opt){
        return new Promise(async (resolve, reject)=>{
            try {
                opt.panelOpt.className = "FastOptionSM";
                opt.panelText.className = "FastTextOption";
                opt.panelText.innerText = opt.text;
                if(opt.iconname){
                    opt.panelIconLeft.appendChild(await this.#renderIcon(opt));
                    opt.panelOpt.appendChild(opt.panelIconLeft);
                }                
                opt.panelOpt.appendChild(opt.panelText);        
                if(opt.hasIconRight){
                    opt.iconname = 'arrowRight';
                    opt.panelIconRight.appendChild(await this.#renderIcon(opt));
                    opt.panelOpt.appendChild(opt.panelIconRight);
                    // opt.panelIconRight.appendChild(opt.panelSM);
                }
                opt.panelText.addEventListener('click',(e)=>{
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    if(opt.funct) opt.funct();                    
                },false);
                resolve(opt.panelOpt);
            } catch (error) {
                reject(error)
            }
        })
    }

    #processMenu(opt){
        return new Promise(async (resolve, reject)=>{
            try {
                if(opt.parentId==='root'){//RENDER MENU
                    this.mainElement.appendChild(opt.panelMenu);
                    document.body.addEventListener('click', (e)=>{
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        this.#closeAllPanel();
                    })
                    opt.panelMenu.addEventListener('click', (e)=>{
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        if(opt.funct) opt.funct();
                        if(this.#hasPanelShow) { this.#closeAllPanel();}
                        else { this.#showPanel(opt) }
                    },false);   
                    opt.panelMenu.addEventListener('pointerover', (e)=>{
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        if(this.#hasPanelShow){
                            this.#closeAllPanel();
                            this.#showPanel(opt);
                            this.#hasPanelShow = true;
                        }
                    },false);             
                    if(opt.iconname) opt.iconContainer.appendChild(await this.#renderIcon(opt));
                    resolve(true)        
                }
                else{
                    resolve(false);
                }
            } catch (error) {
                reject(error);
            }
        })
    }

    #processSubMenu(opt){
        // console.log(opt.actualOrder);
        return new Promise(async (resolve, reject)=>{
            try {                
                let optPanelSM = this.node.get(opt.parentId);
                if(opt.parentId!=='root'){
                    if(optPanelSM.parentId==='root'){
                        optPanelSM.panelMenu.appendChild(optPanelSM.panelSM);
                        if(optPanelSM.panelSM.style.top.trim()==='') optPanelSM.panelSM.style.top = '100%';
                        console.log(optPanelSM.actualOrder, opt.actualOrder);
                        optPanelSM.panelSM.appendChild(await this.#getOptSubMenu(opt));
                        resolve(optPanelSM);
                    }
                    else{
                        resolve(true);                            
                    }
                }
                else{
                    resolve(true);
                } 
            } catch (error) {
                reject(error);
            }
        })
    }
 
    render(){
        return new Promise(async (resolve, reject) => {
            try {
                this.mainElement.innerHTML = '';
                let array = Array.from(this.node, ([key, value]) => ({ key, value }));
                // let i = -1;
                // while(i<array.length){
                //     if(!await this.#processMenu(array[i].value)){
                //         await this.#processSubMenu(array[i].value); 
                //         i++;
                //     }
                //     else i++;
                // }
                // for(let i=0; i<array.length; i++){
                //     array[i].value.order = i;
                //     await this.#processMenu(array[i].value);
                //     await this.#processSubMenu(array[i].value, i);
                // }
                let i=0;
                await Promise.allSettled(Array.from(this.node).map(async (option)=>{
                    option[1].actualOrder = i;
                    i++;
                    
                    if(!await this.#processMenu(option[1])){ 
                            await this.#processSubMenu(option[1]);
                    }
                }));
                resolve(true);
        
                // for(let opt of array){
                //     // console.log(opt);
                //     await this.#processMenu(opt.value)
                //     await this.#processSubMenu(opt.value); 
                // }
                
                // let opt = this.nextNode();
                // if(opt!==null){            
                //     let prc = await this.#processMenu(opt)
                //     if(!prc){ 
                //         await this.#processSubMenu(opt);
                //         console.log('proceso sub menu '+opt.id);
                //     }
                //     else {
                //         console.log("proceso menu "+opt.id);                
                //     }
                //     console.log('nuevo nodo: '+this.idx);
                    
                //     await this.render(this.idx);    
                //     console.log('retorno...'+opt.id);
                //     resolve(this);
                // }
                // else{
                //     resolve(this);
                //     // return this;
                // }        
            } catch (error) {
                reject(error);
            }
        })
        
    }
    
    nextNode(){
        this.idx++;
        if(this.node.has(this.ids[this.idx])) return this.node.get(this.ids[this.idx]);
        else { return null};
    }

    addNode(opt){
        opt.child=[];
        opt.panelSM = null;
        opt.hasIconRight = false;
        opt.actualOrder=this.initOrder;
        this.ids.push(opt.id);
        this.initOrder++;
        if(!opt.parentId || opt.parentID==='root'){ 
            opt.parentId = 'root';
            opt.panelMenu = document.createElement('div');
            opt.iconContainer = document.createElement('div');
            opt.textContainer = document.createElement('div');
            opt.panelMenu.className = 'FastOptionMenu';
            
            opt.textContainer.innerText = opt.text;
            opt.panelMenu.appendChild(opt.iconContainer);
            opt.panelMenu.appendChild(opt.textContainer);
            
            opt.panelSM = this.#createPopup();
        }
        else{
            if(opt.parentId!=='root'){
                opt.panelIconLeft = document.createElement('div');
                opt.panelIconRight = document.createElement('div');
                opt.panelText = document.createElement('div');
                opt.panelOpt = document.createElement('div');
                if(this.node.has(opt.parentId)){
                    let n = this.node.get(opt.parentId);
                    n.hasIconRight = true;
                    n.child.push(opt); 
                    if(!n.panelSM){n.panelSM = this.#createPopup()}
                }
            }
        }
        this.node.set(opt.id, opt);
        return this;
    }

    addToBody(){document.body.appendChild(this);}
    get coloricon(){return this._coloricon}
    set coloricon(val){this._coloricon = val}
}

if (!customElements.get ('fast-barmenu')) {
    customElements.define ('fast-barmenu', FastBarMenu);
}