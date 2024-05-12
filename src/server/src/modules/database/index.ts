/**
 * @description Примитивная база для хранения ключ-значение
 */
class GlobalVariables {
    private storage: Record<string, any[]>;

    constructor() {
        this.storage = {}; // Инициализация хранилища
    }

    get(key: string): any[] | undefined {
        return this.storage[key];
    }

    set(key: string, value: any[]): any[] {
        this.storage[key] = value;
        return value;
    }
}

const _globalVariables = new GlobalVariables();
globalVariables = _globalVariables;