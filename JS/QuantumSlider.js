export class QuantumSlider extends Quantum {
    constructor(props) {
        super();
        this.name = "QuantumSlider";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.built = () => {};
        this.attachShadow({ mode: 'open' });
        this._images = [];
        this._captions = [];
        this.currentIndex = 0;
        this.autoplayInterval = null;
    }

    async #getCss() {
        return await quantum.getCssFile(this.name);
    }
    async #getSVG(fileName) {
        return await quantum.getSVG(fileName);
    }

    #getTemplate() {
        return `
            <div class="QuantumSlider">
                <div class="slider">
                    <div class="slides">
                        ${this._images.map(
                            (image, index) => `
                            <div class="slide ${
                                index === 0 ? 'active' : ''
                            }" index="${index}">
                                <img src="${image}" alt="photo ${index + 1}" />
                                <p class="caption">${
                                    this._captions[index] || ''
                                }</p>
                            </div>
                        `
                        ).join('')}
                    </div>
                    <button class="arrow left-arrow" disabled></button>
                    <button class="arrow right-arrow"></button>
                </div>
                <div class="nav-dots">
                    ${this._images.map(
                        (_, index) => `
                        <span class="dot ${
                            index === 0 ? 'active' : ''
                        }" data-index="${index}"></span>
                    `
                    ).join('')}
                </div>
            </div>
        `;
    }
    

    async #render(css) {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.mainElement = this.shadowRoot.querySelector(".QuantumSlider");
        this.leftArrow = this.mainElement.querySelector(".left-arrow");
        this.rightArrow = this.mainElement.querySelector(".right-arrow");
        this.navDots = this.mainElement.querySelectorAll(".dot");
    
        this.leftArrow.innerHTML = `<img src="${await this.#getSVG("leftArrow")}" alt="left arrow">` || "<";
        this.rightArrow.innerHTML = `<img src="${await this.#getSVG("rightArrow")}" alt="right arrow">` || ">";
        this.leftArrow.addEventListener("click", () => this.prevSlide());
        this.rightArrow.addEventListener("click", () => this.nextSlide());
    
        this.navDots.forEach(dot => {
            dot.addEventListener("click", () => {
                const index = parseInt(dot.getAttribute("data-index"), 10);
                this.showSlide(index);
            });
        });
    
        if (this._autoplay) this.startAutoPlay();
        if (this._images.length > 0) setTimeout(() => this.showSlide(0), 0);
    }
    

    #applyProps() {
        if (this.props) {
            Object.entries(this.props).forEach(([key, value]) => {
                if (key === "style") Object.assign(this.mainElement.style, value);
                else if (key === "events")
                    Object.entries(value).forEach(([event, handler]) =>
                        this.mainElement.addEventListener(event, handler)
                    );
                else if (key === "images" || key === "captions")
                    this[`_${key}`] = value.split(",");
                else {
                    this[key] = value;
                    this.setAttribute(key, value);
                }
            });
        } else
            this.getAttributeNames().forEach((attr) => {
                if (attr === "images")
                    this._images = this.getAttribute("images").split(",");
                else if (attr === "captions")
                    this._captions = this.getAttribute("captions").split(",");
                else if (!attr.startsWith("on")) {
                    const value = this.getAttribute(attr);
                    this.setAttribute(attr, value);
                    this[attr] = value;
                }
            });
    }

    showSlide(index) {
        const slides = this.shadowRoot.querySelectorAll(".slide");
        if (slides.length === 0) return console.error("No slides found in the DOM.");
        
        slides.forEach(slide => 
            slide.classList.remove(
                "active",
                "incoming-left",
                "incoming-right",
                "outgoing-left",
                "outgoing-right"
            )
        );
    
        const incomingSlide = slides[index % slides.length];
        if (index === 0 && this.currentIndex === 0) {
            if (incomingSlide) incomingSlide.classList.add("active");
        } else {
            const outgoingSlide = slides[this.currentIndex];
            const direction = index > this.currentIndex ? "left" : "right";
            if (outgoingSlide) outgoingSlide.classList.add(`outgoing-${direction}`);
            if (incomingSlide) incomingSlide.classList.add(`incoming-${direction}`, "active");
        }
    
        // Actualiza las bolitas
        this.navDots.forEach(dot => dot.classList.remove("active"));
        this.navDots[index].classList.add("active");
    
        this.currentIndex = index % slides.length;
        this.updateArrows();
    }
    
    
    
    
    prevSlide() {
        this.showSlide((this.currentIndex - 1 + this._images.length) % this._images.length);
    }
    
    
    nextSlide() {
        this.showSlide((this.currentIndex + 1) % this._images.length);
    }

    updateArrows() {
    
        if (this.currentIndex === 0) {
            this.leftArrow.classList.add("hidden");
        } else {
            this.leftArrow.removeAttribute("disabled");
            this.leftArrow.classList.remove("hidden");
        }

        if (this.currentIndex === this._images.length - 1) {
            this.rightArrow.classList.add("hidden");
        } else {
            this.rightArrow.removeAttribute("disabled");
            this.rightArrow.classList.remove("hidden");
        }
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoplayInterval = setInterval(() => this.nextSlide(), 3000);
    }

    stopAutoPlay() {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
    }

    async connectedCallback() {
        this.#applyProps();
        await this.#render(await this.#getCss());
        setTimeout(() => this.showSlide(0), 0);
        this.built();
    }
    
    get autoplay() {
        return this._autoplay;
    }
    set autoplay(val) {
        this._autoplay = val;
    }
    hide() {
        quantum.hide();
    }
    show() {
        quantum.show();
    }
    addToBody() {
        quantum.addToBody(this);
    }
}

customElements.define("quantum-slider", QuantumSlider);
