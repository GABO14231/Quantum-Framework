// New animation and circles, a lá MS Rewards, make sure we can handle more than images, implement icon component
// Reset autoplay interval

export class QuantumSlider extends Quantum
{
    constructor(props)
    {
        super();
        this.name = "QuantumSlider";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.built = () => {};
        this.attachShadow({mode: 'open'});
        this._images = [];
        this._captions = [];
        this.currentIndex = 0;
        this.autoplayInterval = null;
    }

    async #getCss() {return await quantum.getCssFile(this.name);}
    async #getSVG(fileName) {return await quantum.getSVG(fileName);}

    #getTemplate()
    {
        return `
            <div class="QuantumSlider">
                <div class="slider">
                    <div class="slides">
                        ${this._images.map((image, index) => `
                            <div class="slide ${index === 0 ? 'active' : ''}" index="${index}">
                                <img src="${image}" alt="photo ${index + 1}" />
                                <p class="caption">${this._captions[index] || ''}</p>
                            </div>
                        `).join('')}
                    </div>
                    <button class="arrow left-arrow"></button>
                    <button class="arrow right-arrow"></button>
                </div>
            </div>
        `;
    }

    async #render(css)
    {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.mainElement = this.shadowRoot.querySelector(".QuantumSlider");
        this.leftArrow = this.mainElement.querySelector('.left-arrow');
        this.rightArrow = this.mainElement.querySelector('.right-arrow');
        this.leftArrow.innerHTML = `<img src="${await this.#getSVG('leftArrow')}" alt="left arrow">` || '<';
        this.rightArrow.innerHTML = `<img src="${await this.#getSVG('rightArrow')}" alt="right arrow">` || '>';
        this.leftArrow.addEventListener('click', () => this.prevSlide());
        this.rightArrow.addEventListener('click', () => this.nextSlide());
        if (this._autoplay) this.startAutoPlay();
        if (this._images.length > 0) setTimeout(() => this.showSlide(0), 0);
    }

    #applyProps()
    {
        if (this.props)
        {
            Object.entries(this.props).forEach(([key, value]) =>
            {
                if (key === 'style') Object.assign(this.mainElement.style, value);
                else if (key === 'events')
                    Object.entries(value).forEach(([event, handler]) => this.mainElement.addEventListener(event, handler));
                else if (key === 'images' || key === 'captions') this[`_${key}`] = value.split(',');
                else {this[key] = value; this.setAttribute(key, value);}
            });
        }
        else
            this.getAttributeNames().forEach(attr =>
            {
                if (attr === 'images') this._images = this.getAttribute('images').split(',');
                else if (attr === 'captions') this._captions = this.getAttribute('captions').split(',');
                else if (!attr.startsWith("on"))
                {
                    const value = this.getAttribute(attr);
                    this.setAttribute(attr, value);
                    this[attr] = value;
                }
            });
    }

    showSlide(index)
    {
        const slides = this.shadowRoot.querySelectorAll('.slide');
        if (slides.length === 0) return console.error("No slides found in the DOM.");
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index % slides.length].classList.add('active');
        this.currentIndex = index;
    }

    prevSlide() {this.showSlide((this.currentIndex - 1 + this._images.length) % this._images.length);}
    nextSlide() {this.showSlide((this.currentIndex + 1) % this._images.length);}

    startAutoPlay()
    {
        this.stopAutoPlay();
        this.autoplayInterval = setInterval(() => this.nextSlide(), 3000);
    }

    stopAutoPlay()
    {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
    }

    async connectedCallback()
    {
        this.#applyProps();
        await this.#render(await this.#getCss());
        this.built();
    }

    get autoplay() {return this._autoplay;}
    set autoplay(val) {this._autoplay = val;}
    hide() {quantum.hide();}
    show() {quantum.show();}
    addToBody() {quantum.addToBody(this);}
}

customElements.define('quantum-slider', QuantumSlider);