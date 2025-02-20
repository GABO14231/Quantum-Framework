class MenuBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                @import url('menu-bar.css');
            </style>
            <nav class="menu"></nav>
        `;
    }

    connectedCallback() {
        this.renderMenu();
    }

    renderMenu() {
        const menuContainer = this.shadowRoot.querySelector('.menu');
        const menuItems = Array.from(this.children);
    
        menuItems.forEach(menuItem => {
            const title = menuItem.getAttribute('title');
            const itemElement = document.createElement('div');
            itemElement.classList.add('menu-item');
            itemElement.textContent = title;
    
            const submenuItems = Array.from(menuItem.children);
            if (submenuItems.length > 0) {
                const submenuElement = document.createElement('div');
                submenuElement.classList.add('submenu');
    
                submenuItems.forEach(submenuItem => {
                    const subTitle = submenuItem.getAttribute('title');
                    const subItemElement = document.createElement('div');
                    subItemElement.classList.add('submenu-item');
                    subItemElement.textContent = subTitle;
                    submenuElement.appendChild(subItemElement);
                });
    
                itemElement.appendChild(submenuElement);
                itemElement.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const submenus = this.shadowRoot.querySelectorAll('.submenu');
                    submenus.forEach(sub => {
                        if (sub !== submenuElement) {
                            sub.style.display = 'none';
                        }
                    });
                    submenuElement.style.display = submenuElement.style.display === 'block' ? 'none' : 'block';
                });
            }
    
            menuContainer.appendChild(itemElement);
        });
    }
}    

class MenuItem extends HTMLElement {}
class SubmenuItem extends HTMLElement {}

customElements.define('menu-bar', MenuBar);
customElements.define('menu-item', MenuItem);
customElements.define('submenu-item', SubmenuItem);
