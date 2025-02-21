export class QuantumTabs extends Quantum {
  constructor(props) {
      super();
      this.name = "QuantumTabs";
      this.props = props;
      if (props?.id) this.id = props.id;
      this.attachShadow({ mode: 'open' });
      this.built = () => {};
  }

  #getTemplate() {
      return `
      <style>
          .tab {
              overflow: hidden;
              border: 1px solid #007BFF;
              background-color: #007BFF;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 10px;
          }

          .tab button {
              background-color: inherit;
              border: none;
              outline: none;
              cursor: pointer;
              padding: 14px 16px;
              transition: 0.3s;
              font-size: 17px;
              color: white;
          }

          .tab button:hover {
              background-color: #0056b3;
          }

          .tab button.active {
              background-color: #0056b3;
          }

          .tabcontent {
              display: none;
              padding: 20px;
              border: 1px solid #007BFF;
              border-top: none;
              background-color: white;
              color: #333;
          }

          .tabnav {
              background-color: inherit;
              border: none;
              outline: none;
              cursor: pointer;
              padding: 10px 15px;
              transition: 0.3s;
              font-size: 20px;
              color: white;
          }

          .tabnav:hover {
              background-color: #0056b3;
          }
      </style>
      <div class="tab">
          <button class="tabnav" data-direction="-1">🡄</button>
          <button class="tablinks" data-tab="Tab1">Tab 1</button>
          <button class="tablinks" data-tab="Tab2">Tab 2</button>
          <button class="tablinks" data-tab="Tab3">Tab 3</button>
          <button class="tablinks" data-tab="Tab4">Tab 4</button>
          <button class="tabnav" data-direction="1">🡆</button>
      </div>

      <div id="Tab1" class="tabcontent">
          <h3>Tab 1</h3>
          <p>Contenido del Tab 1.</p>
      </div>

      <div id="Tab2" class="tabcontent">
          <h3>Tab 2</h3>
          <p>Contenido del Tab 2.</p>
      </div>

      <div id="Tab3" class="tabcontent">
          <h3>Tab 3</h3>
          <p>Contenido del Tab 3.</p>
      </div>

      <div id="Tab4" class="tabcontent">
          <h3>Tab 4</h3>
          <p>El lol es malo.</p>
      </div>
      `;
  }

  async #render() {
      this.shadowRoot.innerHTML = this.#getTemplate();
      this.initializeEvents();
      this.openTab(null, 'Tab1'); // Mostrar la primera pestaña por defecto
  }

  initializeEvents() {
      // Botones de las pestañas
      const tabButtons = this.shadowRoot.querySelectorAll('.tablinks');
      tabButtons.forEach(button => {
          button.addEventListener('click', (event) => {
              this.openTab(event, button.getAttribute('data-tab'));
          });
      });

      // Flechas de navegación
      const navButtons = this.shadowRoot.querySelectorAll('.tabnav');
      navButtons.forEach(button => {
          button.addEventListener('click', () => {
              const direction = parseInt(button.getAttribute('data-direction'));
              this.moveTab(direction);
          });
      });
  }

  openTab(evt, tabName) {
      // Ocultar todos los contenidos de las pestañas
      const tabcontent = this.shadowRoot.querySelectorAll('.tabcontent');
      tabcontent.forEach(tab => {
          tab.style.display = "none";
      });

      // Desactivar todos los botones de las pestañas
      const tablinks = this.shadowRoot.querySelectorAll('.tablinks');
      tablinks.forEach(link => {
          link.classList.remove("active");
      });

      // Mostrar el contenido de la pestaña seleccionada
      const selectedTab = this.shadowRoot.getElementById(tabName);
      if (selectedTab) {
          selectedTab.style.display = "block";
      }

      // Activar el botón de la pestaña seleccionada
      if (evt) {
          evt.currentTarget.classList.add("active");
      } else {
          // Activar la primera pestaña por defecto
          tablinks[0].classList.add("active");
      }
  }

  moveTab(direction) {
      const tabs = this.shadowRoot.querySelectorAll('.tablinks');
      const currentTab = this.shadowRoot.querySelector('.tablinks.active');
      let tabIndex = Array.prototype.indexOf.call(tabs, currentTab);
      let nextTab = tabIndex + direction;

      if (nextTab >= tabs.length) {
          nextTab = 0;
      } else if (nextTab < 0) {
          nextTab = tabs.length - 1;
      }

      tabs[nextTab].click();
  }

  async connectedCallback() {
      await this.#render();
      this.built();
  }

  addToBody() {
      quantum.addToBody(this);
  }
}

customElements.define('quantum-tabs', QuantumTabs);