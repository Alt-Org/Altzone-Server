import {CreateItemDto} from "../../item/dto/createItem.dto";

export const getDefaultItems = (stock_id: string) : CreateItemDto[] => {
    
    return [
        { unityKey: 'huonekasvi', name: 'huonekasvi', stock_id, recycling: 'recycling', weight: 0, isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'roskakori', name: 'roskakori', stock_id, recycling: 'recycling', weight: 0, isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'ruokatuoli', name: 'ruokatuoli', stock_id, recycling: 'recycling', weight: 0, isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'nojatuoli', name: 'nojatuoli', stock_id, recycling: 'recycling', weight: 0, isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'koristepatsas', name: 'koristepatsas', stock_id, recycling: 'recycling', weight: 0, isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'nalle', name: 'nalle', stock_id, recycling: 'recycling', weight: 0, isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'heikko.pommi', name: 'heikko.pommi', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'hella', name: 'hella', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'pieni.pyöreä.sivupöytä', name: 'pieni.pyöreä.sivupöytä', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'kahden.istuttava.sohva', name: 'kahden.istuttava.sohva', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'matto,.ovaali', name: 'matto,.ovaali', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'tuplapommi', name: 'tuplapommi', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'arkkupakastin', name: 'arkkupakastin', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'soutulaite', name: 'soutulaite', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'sohvapöytä', name: 'sohvapöytä', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'kolmen.istuttava.sohva', name: 'kolmen.istuttava.sohva', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'pitkä.ruokapöytä', name: 'pitkä.ruokapöytä', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'käytävämatto', name: 'käytävämatto', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'keittiösaareke', name: 'keittiösaareke', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'kirjahylly', name: 'kirjahylly', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'tv.taso', name: 'tv.taso', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'kolmen.istuttava.kulmasohva', name: 'kolmen.istuttava.kulmasohva', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'kulmahylly', name: 'kulmahylly', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'ruokapöytä', name: 'ruokapöytä', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'superpommi', name: 'superpommi', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'iso.matto', name: 'iso.matto', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true },
        { unityKey: 'parisänky', name: 'parisänky', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: true }
    ];
}

export const getDefaultItemsNotInStock = (stock_id: string = undefined) : CreateItemDto[] => {
    return [
        { unityKey: 'huonekasvi', name: 'huonekasvi', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'roskakori', name: 'roskakori', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'ruokatuoli', name: 'ruokatuoli', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'nojatuoli', name: 'nojatuoli', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'koristepatsas', name: 'koristepatsas', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'nalle', name: 'nalle', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'heikko.pommi', name: 'heikko.pommi', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'hella', name: 'hella', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'pieni.pyöreä.sivupöytä', name: 'pieni.pyöreä.sivupöytä', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'kahden.istuttava.sohva', name: 'kahden.istuttava.sohva', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'matto,.ovaali', name: 'matto,.ovaali', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'tuplapommi', name: 'tuplapommi', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'arkkupakastin', name: 'arkkupakastin', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'soutulaite', name: 'soutulaite', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'sohvapöytä', name: 'sohvapöytä', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'kolmen.istuttava.sohva', name: 'kolmen.istuttava.sohva', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'pitkä.ruokapöytä', name: 'pitkä.ruokapöytä', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'käytävämatto', name: 'käytävämatto', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'keittiösaareke', name: 'keittiösaareke', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'kirjahylly', name: 'kirjahylly', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'tv.taso', name: 'tv.taso', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'kolmen.istuttava.kulmasohva', name: 'kolmen.istuttava.kulmasohva', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'kulmahylly', name: 'kulmahylly', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'ruokapöytä', name: 'ruokapöytä', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'superpommi', name: 'superpommi', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'iso.matto', name: 'iso.matto', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false },
        { unityKey: 'parisänky', name: 'parisänky', stock_id, recycling: 'recycling', weight: 0,  isFurniture: true, price: 5, location : [1,1], isInStock: false }
    ];
}	