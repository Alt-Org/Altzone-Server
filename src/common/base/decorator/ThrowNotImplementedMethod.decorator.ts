/**
 * @deprecated
 */
export const ThrowNotImplementedMethod = (
  className: string,
  decoratorName: string | string[],
): any => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    descriptor.value = function () {
      let decorator = '';
      if (decoratorName instanceof Array) {
        for (let i = 0; i < decoratorName.length; i++) {
          const currentDecorator = '@' + decoratorName[i] + '() ';
          decorator += currentDecorator;
        }
      } else decorator = '@' + decoratorName + '() ';

      const notImplementedError = new Error(
        `You are trying to use ${propertyKey}() of ${className} class, which does implement any methods by itself.\n` +
          `You have to implement the method yourself or use the ${decorator}with a class, you are extending with ${className} class`,
      );

      return Promise.reject(() => {
        throw notImplementedError;
      });
    };

    return descriptor;
  };
};
