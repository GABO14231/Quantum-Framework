export const QuantumCore = class {
    constructor() {
        console.log("QuantumCore constructor");
        this.modules = new Map();
        this.instances = new Map(); 
        this.cssFiles = new Map(); 
        this.svgFiles = new Map(); 
        this._callBack = () => {}; 
    }

    async getCssFile(fileName, cssPath = "./css/") {
        if (!this.cssFiles.has(fileName)) {
            try {
                const css = await fetch(`${cssPath}${fileName}.css`).then(response => response.text());
                this.cssFiles.set(fileName, css);
                console.log(`Archivo CSS cargado: ${fileName}`);
            } catch (error) {
                console.error(`Error cargando el archivo CSS: ${fileName}`, error);
                return null;
            }
        }
        return this.cssFiles.get(fileName);
    }

    async getSVG(fileName, svgPath = "./icons/") {
        if (!this.svgFiles.has(fileName)) {
            try {
                const svg = await fetch(`${svgPath}${fileName}.svg`);
                if (!svg.ok) throw new Error(`Error al cargar SVG: ${fileName}`);
                const svgText = await svg.text();
                this.svgFiles.set(fileName, svgText);
                return svgText;
            } catch (error) {
                console.error(`Error en getSVG: ${error.message}`);
                return null;
            }
        }
        return this.svgFiles.get(fileName);
    }

    async getClass(className) {
        if (!this.modules.has(className)) {
            try {
                const module = await import(`./${className}.js`);
                this.modules.set(className, module[className]);
                console.log(`Clase importada: ${className}`);
            } catch (error) {
                console.error(`Error al importar la clase: ${className}`, error);
                return null;
            }
        }
        return this.modules.get(className);
    }

    addInstance(id, instance) {
        if (!this.instances.has(id)) {
            this.instances.set(id, instance);
        }
        return this;
    }

    getInstance(id) {
        return this.instances.get(id) || null;
    }

    setCallBack(callback) {
        this._callBack = callback;
    }

    notifyBuilt() {
        if (this._callBack) this._callBack();
    }
};
