export class QuantumCalendar extends Quantum
{
    constructor(props){
        super();
        this.name = "QuantumCalendar";
        this.props = props;
        this.date = new Date();
        this.year = this.date.getFullYear();
        this.month = this.date.getMonth();

        this.attachShadow({mode: "open"});
        this.built = () => {};
    }

    #getTemplate()
    {
        let text =`
            <div class='QuantumCalendar'>
                <input class='QuantumCalendarInput' disabled />
                <div class='calendar-container'>
                    <header class='calendar-header'>
                        <p class="calendar-current-date"></p>
                        <div class="calendar-navigation" id="calendar-navigation-month"></div>
                        <input class="calendar-current-year" oninput="this.value = this.value.replace(/[^0-9]/g, '');"/>
                        <div class="calendar-navigation" id="calendar-navigation-year"></div>
                    </header>
                    <div class="calendar-body">
                        <div class="calendar-weekdays"></div>
                        <div class="calendar-dates"></div>
                    </div>
                </div>
            </div>
        `;
        return text;
    }

    #addWeekDays(){
        this.calendarWeekdays = this.mainElement.querySelector(".calendar-weekdays");
        
        for (let i in this.languages[this.props['language']]['days']){
            let div = document.createElement("div");
            div.className = "internal-div";
            div.innerText = this.languages[this.props['language']]['days'][this.props['beginsIn']].slice(0, this.props['numChar']);
            this.props['beginsIn']+=1;
            if(this.props['beginsIn']===7) this.props['beginsIn']=0;
            this.calendarWeekdays.appendChild(div);
        }
    }

    // Añade los días al calendario
    #addDays(){
        // Primer dia del mes
        let firstDay = new Date(this.year, this.month, 1).getDay();

        // Ultima fecha del mes
        let lastDate = new Date(this.year, this.month + 1, 0).getDate();

        // Ultimo dia del mes
        let lastDay = new Date(this.year, this.month, lastDate).getDay();

        // Ultima fecha del mes anterior
        let monthLastDate = new Date(this.year, this.month, 0).getDate();

        // Ultima fecha del mes anterior mostrada en el calendario en ms
        let lastDateShown;
        // Primera fecha del mes en ms
        let firstDateShown = new Date(this.year, this.month, 1).getTime();

        let div = "";
        

        // Añadir fechas del mes anterior
        for (let i = firstDay; i > this.props['beginsIn']; i--) {
            
            div +=
                `<div class="inactive calendar-date-individual" id="d-${monthLastDate - i + 1}${this.month-1 === -1 ? "12": this.month-1}${this.month-1 === -1 ? this.year-1: this.year}"><div class="circle"></div><span class="calendar-date-number">${monthLastDate - i + 1}</span></div>`;
            if (i === firstDay) lastDateShown = new Date (this.year, this.month-1, monthLastDate - i +1).getTime();
        }
        if(isNaN(lastDateShown)) lastDateShown = firstDateShown;
        

        // Añadir fechas de este mes
        for (let i = 1; i <= lastDate; i++) {
            div += `<div class="calendar-date-individual" id="d-${i}${this.month}${this.year}"><div class="circle"></div><span class="calendar-date-number">${i}</span></div>`;
        }
        
        // Añade los siguientes dias del mes
        let lastDateAdded = 0;
        for (let i = lastDay; i < 6+this.props['beginsIn']; i++) {
            div += `<div class="inactive calendar-date-individual" id="d-${i - lastDay + 1}${this.month+1 }${this.year}"><div class="circle"></div><span class="calendar-date-number">${i - lastDay + 1}</span></div>`;
            if (i=== 5+this.props['beginsIn']) lastDateAdded = i - lastDay + 1;
        }
        
        // Coloca todo los meses en formatode 6 semanas
        let msDifference = Math.abs(firstDateShown-lastDateShown);
        let timeDifference = Math.ceil(msDifference / (1000*60*60*24));

        if ((timeDifference<5 || lastDate<30) || (timeDifference===5 && lastDate===30)){
            for (let i = 0; i < 7; i++) {
                lastDateAdded++;
                div += `<div class="inactive calendar-date-individual"><div class="circle"></div><span class="calendar-date-number">${lastDateAdded}</span></div>`
            }
        }

        // En el hipotético caso de que aparezca un febrero 4 semanas exactas, lo convierte en 6 semanas
        if(firstDay===this.props['beginsIn'] &&lastDate===28){
            for (let i = 0; i < 7; i++) {
                lastDateAdded++;
                div += `<div class="inactive calendar-date-individual"><div class="circle"></div><span class="calendar-date-number">${lastDateAdded}</span></div>`
            }
        }
        
        // Muestra mes y año actual
        this.calendarCurrentDate = this.mainElement.querySelector(".calendar-current-date");
        this.calendarCurrentDate.innerText = `${this.languages[this.props['language']]['months'][this.month]}`;

        this.calendarCurrentYear = this.mainElement.querySelector(".calendar-current-year");
        this.calendarCurrentYear.value = this.year;

        // Añade las fechas
        this.calendarDates = this.mainElement.querySelector(".calendar-dates");
        this.calendarDates.innerHTML = div;
        this.today = this.mainElement.querySelector(`#d-${this.date.getDate()}${new Date().getMonth()}${new Date().getFullYear()}`);
        if(this.today) {
            this.today.classList.add("today");
            let circle = this.today.querySelector('.circle');
            if (circle) circle.style.backgroundColor = this.todayColor;
        }
        
        this.#daysEvent();
    }

    // Añade los cambios de meses
    async #monthButtons(){
        let buttonsAction = (iconID, lookedID) => {
            // Verificacion de mes
            this.month = iconID === lookedID ? this.month - 1 : this.month + 1;
    
            
            if (this.month < 0 || this.month > 11) {
    
                this.date = new Date(this.year, this.month, new Date().getDate());

                this.year = this.date.getFullYear();
            
                this.month = this.date.getMonth();
            }
    
            else {
                this.date = new Date();
            }
            this.#addDays();
        }

        let buttonStyles = {
            'height': '20px',
            'width': '20px',
            'margin': '0 1px',
            'cursor': 'pointer',
            'text-align': 'center',
            'line-height': '20px',
            'border-radius': '50%',
            'user-select': 'none',
            'color': '#aeabab',
            'font-size': '1.9rem',
            'background-color': '#17a3c600',
            'rotate':'90deg',
            'text-aling':'end'
        }

        let addButton = async (father, passedID ,passedCaption, actionID, changedDate) =>{
            let divIcon = this.mainElement.querySelector(father);
            const createdButton = await quantum.createInstance("QuantumButton",
                {
                    id: passedID,
                    caption: passedCaption,
                    style: buttonStyles
                });
            divIcon.appendChild(createdButton);
            
            createdButton.built = () => {
                if(changedDate === this.month) createdButton.addEventListener('click', () => buttonsAction(createdButton.id, actionID));
                else createdButton.addEventListener('click', () => {this.year = createdButton.id === actionID ? this.year - 1 : this.year + 1; this.#addDays()});
            };
        }

        let creatingButtons = async () =>{
            await addButton(`#calendar-navigation-month`, `calendar-next-month${this.id}`, `&#8249`, `calendar-prev-month${this.id}`, this.month);
            await addButton(`#calendar-navigation-month`, `calendar-prev-month${this.id}`, `&#8250`, `calendar-prev-month${this.id}`, this.month);

            await addButton(`#calendar-navigation-year`, `calendar-next-year${this.id}`, `&#8249`, `calendar-prev-year${this.id}`, this.year);
            await addButton(`#calendar-navigation-year`, `calendar-prev-year${this.id}`, `&#8250`, `calendar-prev-year${this.id}`, this.year);

        }
        creatingButtons();

        let yearInput = this.mainElement.querySelector(".calendar-current-year");
        yearInput.addEventListener('input',() => {
            this.year = yearInput.value;
            this.#addDays();
        })
    }

    #daysEvent(){
        let calendarDatesIndiviual = this.mainElement.querySelectorAll(".calendar-date-individual");
        this.input = this.shadowRoot.querySelector(".QuantumCalendarInput");
        calendarDatesIndiviual.forEach(calendarDateIndividual => {
            let circle = calendarDateIndividual.querySelector(".circle");
            let dayNumber = calendarDateIndividual.querySelector(".calendar-date-number")
            calendarDateIndividual.addEventListener("mouseover", () => {
                if (calendarDateIndividual.classList.contains('today')) circle.style.backgroundColor = this.todayFocusColor//"#3f207d";
                else circle.style.backgroundColor = this.dayFocusColor;//"#e4e1e1";
            });
            calendarDateIndividual.addEventListener("mouseout", () => {
                if (calendarDateIndividual.classList.contains('today')) circle.style.backgroundColor = this.todayColor;
                else circle.style.backgroundColor = "";
            });
            calendarDateIndividual.addEventListener("click", () => {
                let before = this.mainElement.querySelector(".clicked");
                if (before) {
                    before.style.borderColor = '#ffffff00';
                    before.classList.remove("clicked");
                }
                circle.classList.add("clicked");
                this.day = dayNumber.innerHTML;
                if(this.clicked){
                    let circleColor = this.mainElement.querySelector(".clicked");
                    circleColor.style.borderColor = this.clicked;
                }    
                if(this.props['input']===true){
                    this.input.value = `${String(this.day).padStart(2,'0')}/${String(this.month+1).padStart(2,'0')}/${this.year}`;
                }
            })
        });
    }

    #addInputEvent(){
        if (this.props['input']===true)
        {
            let calendarContainer = this.mainElement.querySelector(".calendar-container");
            calendarContainer.style.display = 'none';
            calendarContainer.style.position = 'absolute';
            this.mainElement.addEventListener("mouseover", () => {calendarContainer.style.display = 'block';})
            this.mainElement.addEventListener("mouseout", () => {calendarContainer.style.display = 'none';})
        } else this.input.style.display = 'none';
    }

    async #getCss() {return await quantum.getCssFile("QuantumCalendar");}

    
    #applyStyles(){
        if (this.props['style']){
            let value = this.props['style'];
            if (value['color']!==undefined){
                let hexToRGB =(hex) =>{
                    hex = hex.replace(/^#/, '');
                    let r = parseInt(hex.slice(1, 3), 16);
                    let g = parseInt(hex.slice(3, 5), 16);
                    let b = parseInt(hex.slice(5, 7), 16);
                    return [r,g,b];
                }
                let RGBToHex = (r,g,b) => {return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`}
    
                
                let complementaryColors = (hex) => {
                    const [r, g, b] = hexToRGB(hex);
                    // Calcular los colores complementarios
                    const comp1 = RGBToHex((255 - r), (255 - g), (255 - b));
                    const comp2 = RGBToHex((r + 128) % 256, (g + 128) % 256, (b + 128) % 256);
                    
                    return [comp1, comp2];
                }
                const [comp1, comp2] = complementaryColors(value['color']);
                
                let adjustBright = (hex, percent)=> {
                    let [r,g,b] = hexToRGB(hex)
                    r = Math.min(255, Math.max(0, Math.round(r + (r * percent))));
                    g = Math.min(255, Math.max(0, Math.round(g + (g * percent))));
                    b = Math.min(255, Math.max(0, Math.round(b + (b * percent))));
                    
                    return RGBToHex(r,g,b);
                }
                
                Object.assign(this.mainElement.querySelector(".QuantumCalendarInput").style, {backgroundColor:`${value['color']}44`});
                Object.assign(this.mainElement.querySelector(".calendar-container").style, {backgroundColor:`${value['color']}44`});
                this.clicked = comp2;
                this.todayColor = value['color'];
                this.todayFocusColor = `${comp1}bb`;
                this.dayFocusColor = `${comp2}55`;
    
            } else{
                if (value['input']) Object.assign(this.mainElement.querySelector(".QuantumCalendarInput").style, value['input']);
                if (value['container']) Object.assign(this.mainElement.querySelector(".QuantumCalendarInput").style, value['container']);
            }
        }
        else{
            this.clicked = "#FF0000";
            this.todayColor = "#7F00FF";
            this.todayFocusColor = "#4C0099";
            this.dayFocusColor = `#C0C0C0`;

        }
    }

    #checkProps()
    {
        if (this.props)
        {   
            Object.entries(this.props).forEach(([key, value]) =>
            {
                
                if (key === 'style'){
                    //this.#applyStyles(value);
                    //Object.assign(this.mainElement.querySelector("div").style, value);
                    
                }
                else if (key === 'events')
                    Object.entries(value).forEach(([event, handler]) => this.mainElement.addEventListener(event, handler));
                else if (key === 'newLanguage' && this.props['language']){
                    this.languages[this.props['language']] = value;
                }
                else if (key !== 'beginsIn' || key !== 'input' || key !== 'language' || key !== 'numChar')
                {
                    this[key] = value;
                    this.setAttribute(key, value);
                }
            });
        } else {
            this.props = {};
            this.getAttributeNames().forEach(attr =>
                {
                    if (attr ==='begins-in')
                    {
                        this.props['beginsIn'] = this.getAttribute(attr);
                    }
                    else if (attr === 'input')
                    {
                        if (this.getAttribute(attr)==="true") this.props['input'] = true;
                        else this.props['input'] = false;
                    } else if (attr === 'language')
                        {
                            this.props['language'] = this.getAttribute(attr);
                        }else if (attr === 'numChar')
                            {
                                this.props['numChar'] = this.getAttribute(attr);
                            }
                        });
                    }
                    
                    if (this.props['beginsIn']===undefined) this.props['beginsIn']=0;
                    if (this.props['input']===undefined) this.props['input']=false;
                    if (!this.props['language']) this.props['language']='en';
                    if (!this.props['numChar']) this.props['numChar']=2;
                    if (!this.id) this.id = Math.floor(Math.random() * (10000+2)) + 1;
                }

    async #render(css)
    {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];

        this.template = document.createElement("template");
        this.template.innerHTML = this.#getTemplate();
        this.shadowRoot.appendChild(this.template.content.cloneNode(true).querySelector(".QuantumCalendar"));
        this.mainElement = this.shadowRoot.querySelector('.QuantumCalendar');
        this.#checkProps()
        this.#addWeekDays();
        this.#applyStyles();
        this.#addDays();
        this.#monthButtons();
        this.#addInputEvent();
    }
                
    async connectedCallback()
    {
        await this.#render(await this.#getCss());
        this.built();
    }
    addToBody() {quantum.addToBody(this);}

    languages = {
        'es':
            {'days':["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
            'months': ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]}, 
        'en':
            {'days': ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            'months': ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]},
        'ch':
            {'days': ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
            'months': ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]}
    }
}


customElements.define('quantum-calendar', QuantumCalendar);