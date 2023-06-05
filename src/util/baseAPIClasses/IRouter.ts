import {Router} from "express";

export default interface IRouter{
    addPost(path?: string, handlers?: any[]): void;
    addGet(path?: string, handlers?: any[]): void;
    addPut(path?: string, handlers?: any[]): void;
    addDelete(path?: string, handlers?: any[]): void;

    router: Router;
}