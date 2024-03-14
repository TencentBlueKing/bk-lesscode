/**
 * 输出 json
 */
export const OutputJson = (options = { decorator: true }) => (target, propertyKey, descriptor) => {
  const originValue = descriptor.value;
  descriptor.value = async (ctx) => {
    try {
      const data = await originValue.apply(this, [ctx]);
      let outputData = data;
      if (options.decorator) {
        outputData = { code: 0, message: 'success', data };
      }
      ctx.send(outputData);
    } catch (error) {
      ctx.throwError(error);
    }
  };
};
