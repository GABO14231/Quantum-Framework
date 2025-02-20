class CustomCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
  
      // Create elements
      const card = document.createElement('div');
      card.classList.add('card-container');
  
      const media = document.createElement('div');
      media.classList.add('card-media');
  
      const content = document.createElement('div');
      content.classList.add('card-content');
  
      const title = document.createElement('h2');
      title.classList.add('card-title');
  
      const subtitle = document.createElement('h3');
      subtitle.classList.add('card-subtitle');
  
      const description = document.createElement('p');
      description.classList.add('card-description');
  
      // Append elements
      content.appendChild(title);
      content.appendChild(subtitle);
      content.appendChild(description);
      card.appendChild(media);
      card.appendChild(content);
      this.shadowRoot.append(card);
  
      // Attach external CSS
      this.loadExternalCSS();
  
      // Enable drag functionality
      this.enableDrag(card);
    }
  
    connectedCallback() {
      this.render();
    }
  
    static get observedAttributes() {
      return ['title', 'subtitle', 'description', 'image'];
    }
  
    attributeChangedCallback() {
      this.render();
    }
  
    render() {
      const media = this.shadowRoot.querySelector('.card-media');
      const title = this.shadowRoot.querySelector('.card-title');
      const subtitle = this.shadowRoot.querySelector('.card-subtitle');
      const description = this.shadowRoot.querySelector('.card-description');
  
      media.style.backgroundImage = `url(${this.getAttribute('image')})`;
      title.textContent = this.getAttribute('title');
      subtitle.textContent = this.getAttribute('subtitle');
      description.textContent = this.getAttribute('description');
    }
  
    loadExternalCSS() {
      const link = document.createElement('link');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', 'card.css');
      this.shadowRoot.appendChild(link);
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
  }
  
  // Define the custom element
  customElements.define('custom-card', CustomCard);
  