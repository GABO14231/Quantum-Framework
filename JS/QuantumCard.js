export class QuantumCard extends Quantum {
  constructor(props) {
      super();
      this.name = "QuantumCard";
      this.props = props;
      if (props?.id) this.id = props.id;
      this.attachShadow({ mode: 'open' });
      this.built = () => {};
  }

  #getTemplate() {
      return `
      <div class="card-container">
          <div class="card-media"></div>
          <div class="card-content">
              <h2 class="card-title"></h2>
              <h3 class="card-subtitle"></h3>
              <p class="card-description"></p>
          </div>
      </div>
      `;
  }

  async #getCss() {
      return await quantum.getCssFile("QuantumCard");
  }

  async #render(css) {
      this.template = document.createElement('template');
      this.template.innerHTML = this.#getTemplate();
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      this.shadowRoot.adoptedStyleSheets = [sheet];
      const tpc = this.template.content.cloneNode(true);
      this.mainElement = tpc.firstElementChild;
      this.cardTitle = this.mainElement.querySelector('.card-title');
      this.cardSubtitle = this.mainElement.querySelector('.card-subtitle');
      this.cardDescription = this.mainElement.querySelector('.card-description');
      this.cardMedia = this.mainElement.querySelector('.card-media');
      this.shadowRoot.appendChild(this.mainElement);
      this.enableDrag(this.mainElement);
  }

  async #applyProps() {
      if (this.props) {
          Object.entries(this.props).forEach(([key, value]) => {
              if (key === 'style')
                  Object.assign(this.mainElement.style, value);
              else if (key === 'events')
                  Object.entries(value).forEach(([event, handler]) => this.mainElement.addEventListener(event, handler));
              else {
                  this[key] = value;
                  this.setAttribute(key, value);
              }
          });
      } else {
          this.getAttributeNames().forEach(attr => {
              if (!attr.startsWith("on")) {
                  const value = this.getAttribute(attr);
                  this.mainElement.setAttribute(attr, value);
                  this[attr] = value;
              }
          });
      }
      this.render();
  }

  render() {
      this.cardMedia.style.backgroundImage = `url(${this.getAttribute('image')})`;
      this.cardTitle.textContent = this.getAttribute('title');
      this.cardSubtitle.textContent = this.getAttribute('subtitle');
      this.cardDescription.textContent = this.getAttribute('description');
  }

  enableDrag(card) {
      let offsetX = 0;
      let offsetY = 0;
      let isDragging = false;

      // Mousedown event to start dragging
      card.addEventListener('mousedown', (e) => {
          isDragging = true;
          offsetX = e.clientX - card.offsetLeft;
          offsetY = e.clientY - card.offsetTop;
          card.style.cursor = 'grabbing';
          card.style.zIndex = '10';
      });

      // Mousemove event to move the card
      document.addEventListener('mousemove', (e) => {
          if (isDragging) {
              const x = e.clientX - offsetX;
              const y = e.clientY - offsetY;
              card.style.position = 'absolute';
              card.style.left = `${x}px`;
              card.style.top = `${y}px`;
          }
      });

      // Mouseup event to stop dragging
      document.addEventListener('mouseup', () => {
          isDragging = false;
          card.style.cursor = 'grab';
          card.style.zIndex = '1';
      });
  }

  async connectedCallback() {
      await this.#render(await this.#getCss());
      await this.#applyProps();
      this.built();
  }

  addToBody() {
      quantum.addToBody(this);
  }
}
customElements.define('quantum-card', QuantumCard);