import {CreateItemDto} from "../../item/dto/createItem.dto";
import { recycling } from "src/common/enum/recycling.enum";

export const getDefaultItems = (stock_id: string, room_id: string) : CreateItemDto[] => {
    
    return [
        { unityKey: 'huonekasvi', name: 'huonekasvi', stock_id, room_id, recycling: recycling.common, weight: 0, isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'roskakori', name: 'roskakori', stock_id, room_id,  recycling: recycling.common, weight: 0, isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'ruokatuoli', name: 'ruokatuoli', stock_id, room_id,  recycling: recycling.common, weight: 0, isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'nojatuoli', name: 'nojatuoli', stock_id, room_id,  recycling: recycling.common, weight: 0, isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'koristepatsas', name: 'koristepatsas', stock_id, room_id,  recycling: recycling.common, weight: 0, isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'nalle', name: 'nalle', stock_id, room_id,  recycling: recycling.common, weight: 0, isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'heikko.pommi', name: 'heikko.pommi', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'hella', name: 'hella', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'pieni.pyöreä.sivupöytä', name: 'pieni.pyöreä.sivupöytä', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'kahden.istuttava.sohva', name: 'kahden.istuttava.sohva', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'matto,.ovaali', name: 'matto,.ovaali', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'tuplapommi', name: 'tuplapommi', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'arkkupakastin', name: 'arkkupakastin', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'soutulaite', name: 'soutulaite', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'sohvapöytä', name: 'sohvapöytä', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'kolmen.istuttava.sohva', name: 'kolmen.istuttava.sohva', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'pitkä.ruokapöytä', name: 'pitkä.ruokapöytä', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'käytävämatto', name: 'käytävämatto', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'keittiösaareke', name: 'keittiösaareke', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'kirjahylly', name: 'kirjahylly', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'tv.taso', name: 'tv.taso', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'kolmen.istuttava.kulmasohva', name: 'kolmen.istuttava.kulmasohva', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'kulmahylly', name: 'kulmahylly', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'ruokapöytä', name: 'ruokapöytä', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'superpommi', name: 'superpommi', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'iso.matto', name: 'iso.matto', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'parisänky', name: 'parisänky', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] }
    ];
}

export const getDefaultItemsNotInStock = (stock_id: string = undefined, room_id: string = undefined) : CreateItemDto[] => {
    return [
        { unityKey: 'huonekasvi', name: 'huonekasvi', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'roskakori', name: 'roskakori', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'ruokatuoli', name: 'ruokatuoli', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'nojatuoli', name: 'nojatuoli', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'koristepatsas', name: 'koristepatsas', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'nalle', name: 'nalle', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'heikko.pommi', name: 'heikko.pommi', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'hella', name: 'hella', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'pieni.pyöreä.sivupöytä', name: 'pieni.pyöreä.sivupöytä', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'kahden.istuttava.sohva', name: 'kahden.istuttava.sohva', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'matto,.ovaali', name: 'matto,.ovaali', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'tuplapommi', name: 'tuplapommi', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'arkkupakastin', name: 'arkkupakastin', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'soutulaite', name: 'soutulaite', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'sohvapöytä', name: 'sohvapöytä', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'kolmen.istuttava.sohva', name: 'kolmen.istuttava.sohva', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'pitkä.ruokapöytä', name: 'pitkä.ruokapöytä', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'käytävämatto', name: 'käytävämatto', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'keittiösaareke', name: 'keittiösaareke', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'kirjahylly', name: 'kirjahylly', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'tv.taso', name: 'tv.taso', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'kolmen.istuttava.kulmasohva', name: 'kolmen.istuttava.kulmasohva', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'kulmahylly', name: 'kulmahylly', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'ruokapöytä', name: 'ruokapöytä', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'superpommi', name: 'superpommi', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'iso.matto', name: 'iso.matto', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] },
        { unityKey: 'parisänky', name: 'parisänky', stock_id, room_id,  recycling: recycling.common, weight: 0,  isFurniture: true, price: 5, location : [1,1] }
    ];
}	