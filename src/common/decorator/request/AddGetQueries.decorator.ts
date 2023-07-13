export const AddGetQueries = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      descriptor.value = function (this: any, ...args: any[]) {
          validateController(this);
          const {_id, query} = extractArguments(args);

          if(query.with && query.with !== '')
              return this.service.readOneWithCollections(_id, query.with);
          else if(query.all != null)
              return this.service.readOneWithAllCollections(_id);

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

function extractArguments(args: any[]) {
    if(!args[0]._id)
        throw new Error('The first argument must be "_id" type of MongoId');

    if(!args[1])
        throw new Error('The second argument must be query object');

    return {_id: args[0]._id as string, query: args[1]}
}