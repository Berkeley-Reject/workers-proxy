import { Pipeline, Middleware } from '../types/middleware';

export const usePipeline = (
  ...initMiddlewares: Middleware[]
): Pipeline => {
  const stack: Middleware[] = [...initMiddlewares];

  const push: Pipeline['push'] = (
    ...middlewares: Middleware[]
  ) => {
    stack.push(...middlewares);
  };

  const execute: Pipeline['execute'] = async (context) => {
    const runner = async (
      prevIndex: number,
      index: number,
    ): Promise<void> => {
      if (index === prevIndex) {
        throw new Error('next() called multiple times');
      }
      if (index >= stack.length) {
        return;
      }

      const middleware = stack[index];
      const next = async () => runner(index, index + 1);
      await middleware(context, next);
    };

    await runner(-1, 0);
  };

  return {
    push,
    execute,
  };
};
