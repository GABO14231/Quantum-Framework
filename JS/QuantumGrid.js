export class QuantumGrid extends Quantum{
    constructor(props){
        super()
        this.name = "QuantumGrid"
        this.props = props
        this.attachShadow({mode: 'open'})
        this.register = []
        this.index = 0
        this.actualPage = 1
    }

    async #getCss(){
        return await quantum.getCssFile("QuantumGrid");
    }


    createElement(element, name){
        let item = document.createElement(element)
        item.className = name
        this.panel.appendChild(item)
        return item
    }

    createRows(number){
        this.panel.style.gridTemplateRows = "repeat("+number+", 1fr)"
    }

    createColumns(number){
        this.panel.style.gridTemplateColumns = "repeat("+number+", 1fr)"
    }

    #initialData(name){
        let array = []
        for(let i=0; i<this.props.pageSize+1; i++){
            for(let j=0; j<this.props.columns.length; j++){
                let div = this.createElement("div", name)
                if(i == 0){
                    div.textContent = this.props.columns[j]
                }else{
                    this.register.push(div)
                    div.textContent = this.props.data[i-1][this.props.columns[j]]
                }
                array.push(div)
            }
            this.index = i
        }
        return array
    }

    addJSON(json){
        this.props = json
    }

    async #render(css){
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css)
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.template = document.createElement("template")
        this.template.innerHTML = `<div class="QuantumGridContainer"></div>`
        this.panel = this.template.content.cloneNode(true).firstChild
        this.createRows(this.props.rowsNumber)
        this.createColumns(this.props.columnsNumber)
        let title = this.createElement("div", "QuantumGridTitle")
        let subtitle = this.createElement("div", "QuantumGridSubtitle")
        title.textContent = this.props.title
        subtitle.textContent = this.props.subtitle
        let array = this.#initialData("QuantumGridInformation")
        for(let i = 1; i<=array.length; i++){
            array[i-1].classList.add("QuantumGridElement"+i)
        }
        this.createElement("output", "QuantumGridRegisterCounter")
        

        let next = this.createElement("button", "QuantumGridRegisterNext")
        next.innerHTML = "Siguiente"
        

        let nextPage = this.createElement("button", "QuantumGridRegisterNextPage")
        nextPage.innerHTML = "Siguiente Pagina"
        

        let back = this.createElement("button", "QuantumGridRegisterBack")
        back.innerHTML = "Retroceder"

        let backPage = this.createElement("button", "QuantumGridRegisterBackPage")
        backPage.innerHTML = "Retroceder Pagina"

        this.shadowRoot.appendChild(this.panel);
        
    }

    async #applyEvents(){
        let counter = this.panel.querySelector(".QuantumGridRegisterCounter")
        this.setRegisterConter(counter)
        let next = this.panel.querySelector(".QuantumGridRegisterNext")
        next.onclick = () =>{
            this.nextRegister(counter)
        }

        let nextPage = this.panel.querySelector(".QuantumGridRegisterNextPage")
        nextPage.onclick = () =>{
            this.nextPage(counter)
        }

        let back = this.panel.querySelector(".QuantumGridRegisterBack")
        back.onclick = () =>{
            this.backRegister(counter)
        }

        let backPage = this.panel.querySelector(".QuantumGridRegisterBackPage")
        backPage.onclick = () =>{
            this.backPage(counter)   
        }
    }

    async connectedCallback()
    {
        await this.#render(await this.#getCss())
        await this.#applyEvents()
    }

    setRegisterConter(counter){
        counter.textContent = this.actualPage+"/"+parseInt((this.props.data.length / this.props.pageSize))
    }

    nextRegister(name){
        if(this.actualPage < (this.props.data.length / this.props.pageSize) && this.index < this.props.data.length){
            for(let i = this.props.pageSize-1; i >= 0; i--){
                for(let j = 0; j < this.props.columns.length; j++){
                    let div = this.register.shift()
                    div.textContent = this.props.data[this.index - i][this.props.columns[j]]
                    this.register.push(div)
                }
            }
            this.index++
            if(this.index % this.props.pageSize == 0 && this.actualPage < (this.props.data.length / this.props.pageSize)){
                this.actualPage++
                this.setRegisterConter(name)
            }
        }else{
            alert("No hay mas informacion que mostrar!")
            return -1
        }
    }

    nextPage(name){
        for(let i = (this.index % this.props.pageSize); i < this.props.pageSize; i++){
           if(this.nextRegister(name) == -1){
                break
           }
        }
    }

    backRegister(name){
        if(this.actualPage <= (this.props.data.length / this.props.pageSize) && this.index > this.props.pageSize){
            for(let i = 2; i < this.props.pageSize+2; i++){
                for(let j = this.props.columns.length-1; j >= 0; j--){
                    let div = this.register.pop()
                    div.textContent = this.props.data[this.index-i][this.props.columns[j]]
                    this.register.unshift(div)
                }
            }    
            if(this.index % this.props.pageSize == 0  && this.actualPage > 1){
                this.actualPage--
                this.setRegisterConter(name)
            }
            this.index--
        }else{
            alert("No hay mas informacion que mostrar!")
            return -1
        }
    }

    backPage(name){
        let limit = (this.index % this.props.pageSize)
        if(limit == 0){
            limit = this.props.pageSize
        }
        for(let i = 0 ; i < limit; i++){
            if(this.backRegister(name) == -1){
                break
            }
         }
    }

    clear(){
        let elements = this.panel.children
        let length = elements.length
        while(length > 0){
            elements[0].remove()
            length--
        }
        this.props = null
        this.register = []
        this.index = 0
        this.actualPage = 1
    }

    addRecord(record){
        this.props.data.push(record)
    }

    deleteRecord(index){
        this.props.data.splice(index - 1, 1)
        for(let i = 0; i < this.props.data.length; i++){
            this.props.data[i][this.props.columns[0]] = i +1
        }
        
    }

    getDataCell(f,c){
        let row = (f + this.props.pageSize * (f - 1)) - 1
        return this.register[row + (c - 1)].textContent
    }

    setDataCell(f,c, data){
        let row = (f + this.props.pageSize * (f - 1)) - 1
        this.register[row + (c - 1)].textContent = data
    }

    getDataRow(f){
        let row = (f + this.props.pageSize * (f - 1)) - 1
        for(let i = 0; i < this.props.data.length; i++){
            if(this.register[row].textContent == this.props.data[i][this.props.columns[0]]){
                return this.props.data[i]
            }
        }
    }

    setDataRow(f, data){
        let row = (f + this.props.pageSize * (f - 1)) - 1
        for(let i = 0; i < this.props.data.length; i++){
            if(this.register[row].textContent == this.props.data[i][this.props.columns[0]]){
                this.props.data[i] = data
            }
        }
    }

    addToBody(){
        quantum.addToBody(this)
    }

}

customElements.define('quantum-grid', QuantumGrid);