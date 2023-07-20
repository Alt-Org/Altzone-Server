import {Discriminator} from "../../enum/discriminator.enum";

export const AddGetQueries = (searchField: string = '_id') => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      descriptor.value = function (this: any, ...args: any[]) {
          validateController(this);
          const {field, query} = extractArguments(args, searchField);

          if(searchField === '_id'){
              throwErrorIfServiceInvalid(this, Discriminator.IBasicService);

              if(query.with && query.with !== '')
                  return this.service.readOneWithCollections(field, query.with);
              else if(query.all != null)
                  return this.service.readOneWithAllCollections(field);
          } else {
              throwErrorIfServiceInvalid(this, Discriminator.IConditionService);

              const condition = {[searchField]: field};
              if(query.with && query.with !== '')
                  return this.service.readOneByConditionWithCollections(condition, query.with);
              else if(query.all != null)
                  return this.service.readOneByConditionWithAllCollections(condition, query.with);
          }

          return originalMethod.apply(this, args);
      }
      return descriptor;
  }
}

function validateController(controller: any) {
    if(!controller)
        throw new Error('"this" is undefined. Please check that it is accessible in the context');

    if(!controller.service)
        throw new Error('Field "service" (type IBasicService) is not defined in the controller class. Please define one');

    if(!controller.service.readOneWithCollections || !controller.service.readOneWithAllCollections)
        throw new Error('Methods "readOneWithCollections()" and "readOneWithAllCollections()" are not defined in the service member');
}

function extractArguments(args: any[], searchField) {
    if(!args[0][searchField])
        throw new Error(`The first argument must be "${searchField}" type of MongoId`);

    if(!args[1])
        throw new Error('The second argument must be query object');

    return {field: args[0][searchField] as string, query: args[1]}
}

function throwErrorIfServiceInvalid(instance: any, discriminator: Discriminator) {
    if(!instance.service.discriminators || !Array.isArray(instance.service.discriminators) || !instance.service.discriminators.includes(discriminator)){
        throw new Error(`Field service must implement "${discriminator}" interface and include "${discriminator}" in discriminators[]`);
    }
}