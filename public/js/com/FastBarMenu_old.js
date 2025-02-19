export const FastBarMenu = class extends Fast{
    constructor(props){
        super();  
        this.name = "FastBarMenu";
        this.props = props;     
        if(props){if(props.id){this.id = props.id}} ;
        this.built = ()=>{}; 
        this.attachShadow({mode:'open'});
        this._isBuilt = false;
        this.objectProps = new Map();
        this.optionMenuData = new Map();
        this.optionSubMenuData = new Map();
        this._coloricon = '';
        this._hasPanelShow = false;
        this.initOrderSM = 0;
        this.durationShowAnimate = 300;
        this.durationHideAnimate = 150;
        this.fontSizeSM = 0;
        this.firstMenu = null;
        this.heightSM = 30;
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

    async #renderIcon(element, iconRight){
        if(element.coloricon){this.coloricon = element.coloricon}
        let iconname = element.iconname;
        if(iconRight) iconname = iconRight;
        let i = await fast.createInstance("FastIcon", {
            'id': this.id+iconname+element.text,
            'iconname' : iconname,
            'style' : {
                'position': 'relative',
                'box-shadow':'none', 
                'border-style': 'none',
                'width' : '16px',
                'height':'16px',
                'fill' : this._coloricon,
            }
        });
        return i;
    }

    #createPopup(){
        let sm = document.createElement("div");
        sm.className = "FastPanelSubMenu";
        sm.style.display = 'none';
        sm.order = this.initOrderSM;
        this.initOrderSM++;
        return sm;
    }

    #closeAllPanel(order){
        this.optionMenuData.forEach(async element =>{
            if(element.subMenu && element.subMenu.popup.order!==order){
                if(element.subMenu.popup){
                    element.subMenu.popup.animate([{ height:'0px',display:'none'}],{duration:this.durationHideAnimate, fill:'both'});
                    // element.subMenu.popup.style.display = 'none';    
                }
            }
            element.subMenu.optionSM.forEach(async ele =>{
                if(ele.parentId){
                    if(this.optionSubMenuData.has(ele.parentId)){
                        let sm = this.optionSubMenuData.get(ele.parentId);
                        element.subMenu.popup.animate([{ height:'0px', display:'none'}],{duration:this.durationHideAnimate, fill:'both'});
                        // sm.panel.style.display = 'none';
                    }
                }
            })
        });
        this._hasPanelShow = false;
    }

    async #getOptSubMenu(ele){
        ele.divOptSM.className = "FastOptionSM";
        ele.divTextSM.className = "FastTextOption";
        ele.divPanelChild.className = "FastOptionSubMenuChild";
        ele.divTextSM.innerText = ele.text;
        if(ele.iconname){
            ele.divIconLeft.appendChild(await this.#renderIcon(ele));
            ele.divOptSM.appendChild(ele.divIconLeft);
        }                
        ele.divOptSM.appendChild(ele.divTextSM);        
        if(ele.hasIconRight){
            ele.divIconRight.appendChild(await this.#renderIcon(ele, 'arrowRight'));
        }
        ele.divOptSM.appendChild(ele.divIconRight);
        ele.divOptSM.appendChild(ele.divPanelChild);
        ele.divTextSM.addEventListener('click',(e)=>{
            e.preventDefault();
            e.stopImmediatePropagation();
            if(ele.funct) ele.funct();                    
        },false);        
        return ele;
    }

    #renderMenuFull(opts){
        this.optionMenuData.clear();
        opts.forEach(element =>{
            this.addOptionMenu(element);                
        })
    }

    async #renderSubMenu(){
        this.optionSubMenuData.forEach(async opt=>{
            if(opt.parentId){
                if(!this.optionMenuData.has(opt.parentId)){
                    let optParent = this.optionSubMenuData.get(opt.parentId);
                    optParent.divPanelChild.style.display = 'none';
                    if(!optParent.hasProcess){
                        optParent.hasProcess = true;
                        opt.panel = optParent.divPanelChild;
                        optParent.optionSM.forEach(async op=>{
                            let ele = this.optionSubMenuData.get(op);
                            let objSM = await this.#getOptSubMenu(ele);
                            let w = objSM.text.length*(this.fontSizeSM/2)+ 16;
                            objSM.divTextSM.style.width = w + 'px';
                            let parent = this.optionSubMenuData.get(ele.parentId);
                            let h = (parent.optionSM.length*this.heightSM);
                            optParent.divPanelChild.appendChild(objSM.divOptSM);
                            optParent.divOptSM.addEventListener('pointerover', (e)=>{
                                e.preventDefault();
                                e.stopImmediatePropagation();
                                optParent.panel.style.overflow = "visible";    
                                // optParent.divPanelChild.style.display = 'grid';
                                // console.log(13);
                                
                                parent.divPanelChild.animate([{ 'height':h+'px', display:'grid'}],{duration:this.durationShowAnimate, fill:'both'});  
                                this._hasPanelShow = true;
                            },false);
                            optParent.divOptSM.addEventListener('pointerout', (e)=>{
                                e.preventDefault();
                                e.stopImmediatePropagation();
                                console.log(e.target, optParent.divOptSM);
                                optParent.panel.style.overflow = "hidden";
                                if(e.target!==optParent.divOptSM){
                                    
                                }
                                this._hasPanelShow = false;
                                // optParent.divPanelChild.style.display = 'none';  
                                // parent.divPanelChild.animate([{ 'height':'0px', display:'none'}],{duration:this.durationHideAnimate, fill:'both'});
                            },false); 
                        })
                    }                    
                }
            }
        })
    }

    async #renderMenu(opts){
        return new Promise(async (resolve, reject)=>{
            try {
                if(opts){ this.#renderMenuFull(opts) }
                this.mainElement.innerHTML = '';
                let i = 0;                
                this.optionMenuData.forEach(async element =>{      
                    if(i===0) this.firstMenu = element;
                    element.panel = document.createElement('div');
                    element.iconContainer = document.createElement('div');
                    element.textContainer = document.createElement('div');
                    if(element.text) element.textContainer.innerText = element.text;
                    element.panel.className = 'FastOptionMenu';
                    this.mainElement.appendChild(element.panel);
                    element.panel.appendChild(element.iconContainer);
                    element.panel.appendChild(element.textContainer);
                    element.order = i;
                    document.body.addEventListener('click', (e)=>{
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        this.#closeAllPanel(-1);
                    },false)
                    element.panel.addEventListener('click', (e)=>{
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        if(element.funct) element.funct();
                        if(this._hasPanelShow) {
                            this.#closeAllPanel(-1);
                        }
                        else {
                            element.subMenu.popup.style.display = 'grid';
                            let dim = this.#calcDim(element)                            
                            element.subMenu.popup.animate([{ 'height':dim.h+'px', display:'grid'}],{duration:this.durationShowAnimate, fill:'both'});
                            this._hasPanelShow = true;
                        }
                    },false);
                    element.panel.addEventListener('pointerover', (e)=>{
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        if(this._hasPanelShow){
                            this.#closeAllPanel(element.subMenu.popup.order);
                            element.subMenu.popup.style.display = 'grid';
                            let dim = this.#calcDim(element);                            
                            element.subMenu.popup.animate([{height:dim.h+'px', display:'grid'}],{duration:this.durationShowAnimate, fill:'both'});                
                            this._hasPanelShow = true;
                        }
                    },false);
                    if(element.iconname) { element.iconContainer.appendChild(await this.#renderIcon(element)); }
                    i++;
                    element.panel.appendChild(element.subMenu.popup);
                    element.subMenu.optionSM.forEach(async ele =>{ 
                        let objDivSM = await this.#getOptSubMenu(ele);
                        element.subMenu.popup.appendChild(objDivSM.divOptSM);                 
                    })
                })        
                this.fontSizeSM = parseInt(window.getComputedStyle(this.firstMenu.subMenu.popup).getPropertyValue('font-size'),10);
                resolve(this)
            } catch (error) {
                reject(error)
            }
        })
    }

    #calcDim(element){
        let h = element.subMenu.optionSM.length*30;
        let w = element.subMenu.optionSM;
        let l=0;                            
        for(let i=0; i<w.length; i++){
            if(i===0){l = w[i].text.length}
            else{
                if(w[i].text.length > w[i-1].text.length) l=w[i].text.length 
                else l = w[i-1].text.length
            }
            let divText = element.subMenu.popup.firstChild.nextSibling.firstChild.nextSibling; 
            this.fontSizeSM = parseInt(window.getComputedStyle(divText).getPropertyValue('font-size'),10);
            l = (l*(this.fontSizeSM/2)+52);
        }
        element.subMenu.popup.style.height = h+'px';
        element.subMenu.popup.style.width = l+'px';
        return {'w': l, 'h':h}
    }

    async render(){
        await this.#renderMenu().then(async r=>{
            await r.#renderSubMenu();
        })
    }

    addSubMenu(opt){
        opt.optionSM = [];
        opt.hasIconRight = false;
        opt.hasProcess = false;
        opt.level = "SM";
        opt.divOptSM = document.createElement('div');
        opt.divIconLeft = document.createElement('div');
        opt.divTextSM = document.createElement('div');
        opt.divIconRight = document.createElement('div');
        opt.divPanelChild = document.createElement('div');        
        if(opt){
            this.optionSubMenuData.set(opt.id, opt);
            if(this.optionSubMenuData.has(opt.parentId)){
                let sm = this.optionSubMenuData.get(opt.parentId);
                sm.optionSM.push(opt.id); 
                sm.hasIconRight = true; 
            }
            if(this.optionMenuData.has(opt.parentId)){
                let m = this.optionMenuData.get(opt.parentId);
                opt.panel = m.subMenu.popup;
                m.subMenu.optionSM.push(opt);
            }
        }
        return this;
    }

    addOptionMenu(opt){
        if(opt) {
            opt.level = "M";
            opt.subMenu = {
                optionSM : [],
                popup : this.#createPopup()
            }
            this.optionMenuData.set(opt.id, opt);
        }
        return this;
    }

    addToBody(){document.body.appendChild(this);}
    get coloricon(){return this._coloricon}
    set coloricon(val){this._coloricon = val}
}

if (!customElements.get ('fast-barmenu')) {
    customElements.define ('fast-barmenu', FastBarMenu);
}