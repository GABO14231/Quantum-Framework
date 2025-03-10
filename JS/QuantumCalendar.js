export class QuantumCalendar extends Quantum
{
    constructor(props)
    {
        super();
        this.name = "QuantumCalendar";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.date = new Date();
        this.year = this.date.getFullYear();
        this.month = this.date.getMonth();
        this.attachShadow({mode: "open"});
        this.built = () => {};
    }

    #getTemplate()
    {
        return `
            <div class='QuantumCalendar'>
                <input class='QuantumCalendarInput' disabled />
                <div class='calendar-container'>
                    <header class='calendar-header'>
                        <div class="calendar-navigation" id="calendar-navigation-month-prev"></div>
                        <p class="calendar-current-date"></p>
                        <div class="calendar-navigation" id="calendar-navigation-month-next"></div>
                        <div class="calendar-navigation" id="calendar-navigation-year-prev"></div>
                        <input class="calendar-current-year" oninput="this.value = this.value.replace(/[^0-9]/g, '');"/>
                        <div class="calendar-navigation" id="calendar-navigation-year-next"></div>
                    </header>
                    <div class="calendar-body">
                        <div class="calendar-weekdays"></div>
                        <div class="calendar-dates"></div>
                    </div>
                </div>
            </div>
        `;
    }

    async #getCss(name) {return await quantum.getCssFile(name);}

    #render(css)
    {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.mainElement = this.shadowRoot.querySelector('.QuantumCalendar');
        this.calendarInput = this.shadowRoot.querySelector(".QuantumCalendarInput");
        this.calendarContainer = this.mainElement.querySelector(".calendar-container");
        this.calendarWeekdays = this.mainElement.querySelector(".calendar-weekdays");
        this.calendarCurrentDate = this.mainElement.querySelector(".calendar-current-date");
        this.calendarCurrentYear = this.mainElement.querySelector(".calendar-current-year");
        this.calendarDates = this.mainElement.querySelector(".calendar-dates");
    }

    async #renderCSSTemplate(css)
    {
        const aditionalSheet = new CSSStyleSheet();
        aditionalSheet.replaceSync(await this.#getCss(css));
        this.shadowRoot.adoptedStyleSheets = [...this.shadowRoot.adoptedStyleSheets, aditionalSheet]
    }

    #applyProps()
    {
        if (this.props)
        {
            Object.entries(this.props).forEach(([key, value]) =>
            {
                if (key === 'style') this.#renderCSSTemplate(value);
                else if (key === 'events')
                    Object.entries(value).forEach(([event, handler]) => this.mainElement.addEventListener(event, handler));
                else if (key === 'newLanguage' && this.props['language']) this.languages[this.props['language']] = value;
                else {this[key] = value; this.setAttribute(key, value);}
            });
        }
        else
        {
            this.getAttributeNames().forEach(attr =>
            {
                if (attr === 'style')
                {
                    const value = this.getAttribute(attr);
                    this.#renderCSSTemplate(value);
                }
                else if (!attr.startsWith("on"))
                {
                    const value = this.getAttribute(attr);
                    this.setAttribute(attr, value);
                    this[attr] = value;
                }
            });
        }
        if (!this.getAttribute('beginsIn')) this.setAttribute('beginsIn', 0);
        if (!this.getAttribute('input')) this.setAttribute('input', false);
        if (!this.getAttribute('language')) this.setAttribute('language', 'en');
        if (!this.getAttribute('numChar')) this.setAttribute('numChar', 2);
        if (!this.getAttribute('format')) this.setAttribute('format', 'dd/mm/yyyy');
    }

    #addWeekDays()
    {
        const language = this.getAttribute('language');
        let beginsIn = parseInt(this.getAttribute('beginsIn'), 10);
        for (let i in this.languages[language]['days'])
        {
            const div = document.createElement("div");
            div.className = "internal-div";
            div.innerText = this.languages[language]['days'][beginsIn].slice(0, this.getAttribute('numChar'));
            beginsIn += 1;
            if (beginsIn === 7) beginsIn = 0;
            this.calendarWeekdays.appendChild(div);
        }
    }

    #addDays()
    {
        const language = this.getAttribute('language');
        const beginsIn = parseInt(this.getAttribute('beginsIn'), 10);
        const firstDay = new Date(this.year, this.month, 1).getDay();
        const lastDate = new Date(this.year, this.month + 1, 0).getDate();
        const lastDay = new Date(this.year, this.month, lastDate).getDay();
        const monthLastDate = new Date(this.year, this.month, 0).getDate();
        const firstDateShown = new Date(this.year, this.month, 1).getTime();
        let lastDateShown, lastDateAdded = 0, div = "";

        for (let i = firstDay; i > beginsIn; i--)
        {
            div += `<div class="inactive calendar-date-individual" id="d-${String(monthLastDate - i + 1).padStart(2, '0')}${String(this.month - 1 === -1 ? "11" : this.month - 1).padStart(2, '0')}${this.month - 1 === -1 ? this.year - 1 : this.year}"><div class="circle"></div><span class="calendar-date-number">${monthLastDate - i + 1}</span></div>`;
            if (i === firstDay) lastDateShown = new Date(this.year, this.month - 1, monthLastDate - i + 1).getTime();
        }
        lastDateShown = isNaN(lastDateShown) ? firstDateShown : lastDateShown;
        for (let i = 1; i <= lastDate; i++)
            div += `<div class="calendar-date-individual" id="d-${String(i).padStart(2, '0')}${String(this.month).padStart(2, '0')}${this.year}"><div class="circle"></div><span class="calendar-date-number">${i}</span></div>`;
        for (let i = lastDay; i < 6 + beginsIn; i++)
        {
            div += `<div class="inactive calendar-date-individual" id="d-${String(i - lastDay + 1).padStart(2, '0')}${String(this.month + 1).padStart(2, '0')}${this.year}"><div class="circle"></div><span class="calendar-date-number">${i - lastDay + 1}</span></div>`;
            if (i === 5 + beginsIn) lastDateAdded = i - lastDay + 1;
        }

        const msDifference = Math.abs(firstDateShown - lastDateShown);
        const timeDifference = Math.ceil(msDifference / (1000 * 60 * 60 * 24));
        const weekFormat = () =>
        {
            for (let i = 0; i < 7; i++)
            {
                lastDateAdded++;
                div += `<div class="inactive calendar-date-individual" id="d-${String(lastDateAdded).padStart(2, '0')}${String(this.month + 1).padStart(2, '0')}${this.year}"><div class="circle"></div><span class="calendar-date-number">${lastDateAdded}</span></div>`
            }
        }

        if ((timeDifference < 5 || lastDate < 30) || (timeDifference === 5 && lastDate === 30)) weekFormat();
        if (firstDay === beginsIn && lastDate === 28) for (let i = 0; i < 1; i++) weekFormat();

        this.calendarCurrentDate.innerText = `${this.languages[language]['months'][this.month]}`;
        this.calendarCurrentYear.value = this.year;
        this.calendarDates.innerHTML = div;
        this.today = this.mainElement.querySelector(`#d-${String(this.date.getDate()).padStart(2,'0')}${String(new Date().getMonth()).padStart(2,'0')}${new Date().getFullYear()}`);
        if (this.today) this.today.classList.add("today");
        
        if (this.selectedID)
        {
            const selected = this.mainElement.querySelector(`#${this.selectedID}`);
            if (selected) selected.classList.add("clicked");
        }
        this.#daysEvent();
    }

    async #calendarButtons()
    {
        const buttonsAction = (iconID, lookedID) =>
        {
            this.month = iconID === lookedID ? this.month - 1 : this.month + 1;
            if (this.month < 0 || this.month > 11)
            {
                this.date = new Date(this.year, this.month, new Date().getDate());
                this.year = this.date.getFullYear();
                this.month = this.date.getMonth();
            }
            else this.date = new Date();
            this.#addDays();
        }

        const buttonStyles =
        {
            'height': '15px',
            'width': '12px',
            'margin': '0.1px',
            'cursor': 'pointer',
            'border-radius': '50%',
            'user-select': 'none',
            'color': '#aeabab',
            'font-size': '1.9rem',
            'background-color': '#17a3c600'
        }

        const addButton = async (father, passedID ,passedCaption, actionID, changedDate) =>
        {
            const divIcon = this.mainElement.querySelector(father);
            const createdButton = await quantum.createInstance("QuantumButton",
            {
                id: passedID,
                caption: passedCaption,
                style: buttonStyles
            });
            divIcon.appendChild(createdButton);
            createdButton.built = () =>
            {
                if (changedDate === this.month)
                    createdButton.addEventListener('click', () => buttonsAction(createdButton.id, actionID));
                else
                    createdButton.addEventListener('click', () => {this.year = createdButton.id === actionID ? this.year - 1 : this.year + 1; this.#addDays()});
            };
        }

        await addButton(`#calendar-navigation-month-prev`, `calendar-prev-month${this.id}`, `&#8249`, `calendar-prev-month${this.id}`, this.month);
        await addButton(`#calendar-navigation-month-next`, `calendar-next-month${this.id}`, `&#8250`, `calendar-prev-month${this.id}`, this.month);
        await addButton(`#calendar-navigation-year-prev`, `calendar-prev-year${this.id}`, `&#8249`, `calendar-prev-year${this.id}`, this.year);
        await addButton(`#calendar-navigation-year-next`, `calendar-next-year${this.id}`, `&#8250`, `calendar-prev-year${this.id}`, this.year);

        this.calendarCurrentYear.addEventListener('input',() =>
        {
            this.year = parseInt(this.calendarCurrentYear.value);
            this.#addDays();
        })
    }

    #daysEvent()
    {
        const calendarDates = this.mainElement.querySelectorAll(".calendar-date-individual");
        calendarDates.forEach(date =>
        {
            const circle = date.querySelector(".circle");
            const dayNumber = date.querySelector(".calendar-date-number");
            date.addEventListener("click", () =>
            {
                const previousClicked = this.mainElement.querySelector(".clicked");
                if (previousClicked) previousClicked.classList.remove("clicked");
                date.classList.add("clicked");
                this.setDate(date.getAttribute('id'))
                if (this.getAttribute('input') === 'true') this.calendarInput.value = this.getDate();
            });
        });
    }

    #addInputEvent()
    {
        if (this.getAttribute('input') === 'true')
        {
            this.calendarInput.style.display = 'block';
            this.calendarContainer.style.position = 'absolute';
            this.mainElement.addEventListener("mouseover", () => {this.calendarContainer.style.display = 'block';})
            this.mainElement.addEventListener("mouseout", () => {this.calendarContainer.style.display = 'none';})
        }
    }

    getDate()
    {
        if (this.selectedDate) return this.selectedDate;
        else return "No date selected.";
    }

    setDate(date)
    {
        this.selectedID = date;
        const dayNumber = date.substring(2, 4);
        const yearFull = date.substring(6, 10);
        const yearShort = date.substring(8, 10);
        const actualMonth = parseInt(date.substring(4, 6)) + 1;
        const actualDay = new Date(`${date.substring(6, 10)}-${String(actualMonth.toString()).padStart(2, '0')}-${date.substring(2, 4)}`).getDay();
        const monthNumber = String(actualMonth.toString()).padStart(2, '0');
        const {days, months} = this.languages[this.getAttribute('language')];
        const day = days[(actualDay + 1) % 7];
        const month = months[parseInt(date.substring(4, 6))];
        this.selectedDate = this.getAttribute('format').replace('dddd', day).replace('dd', dayNumber)
            .replace('mmmm', month).replace('mm', monthNumber).replace('yyyy', yearFull).replace('yy', yearShort);
    }

    async connectedCallback()
    {
        this.#render(await this.#getCss(this.name));
        this.#applyProps()
        this.#addWeekDays();
        this.#addDays();
        this.#calendarButtons();
        this.#addInputEvent();
        this.built();
    }
    addToBody() {quantum.addToBody(this);}

    languages =
    {
        'es': {'days':["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
            'months': ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]}, 
        'en': {'days': ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            'months': ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]},
        'ch': {'days': ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
            'months': ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]}
    }
}

customElements.define('quantum-calendar', QuantumCalendar);