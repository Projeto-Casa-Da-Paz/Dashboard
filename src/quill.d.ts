declare module 'quill' {
    export default class Quill {
        constructor(container: Element | string, options?: any);
        static import(name: string): any;
        static register(module: any): void;
    }
}