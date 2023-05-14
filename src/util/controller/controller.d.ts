//abstract class instead of interface?
interface IController{
    public create: Function;
    public get: Function;
    public getAll: Function;
    public update: Function;
    public delete: Function;
}

export { IController };