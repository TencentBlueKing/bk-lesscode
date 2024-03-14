import { getNamespace, createNamespace } from 'node-request-context';

class RequestContext {
  static spaceName = 'lesscode';

  constructor(ctx) {
    this.ctx = ctx;
  }

  static currentRequestContext() {
    let res = '';
    const session = getNamespace(RequestContext.spaceName);
    if (session) res = session.get(RequestContext.name);
    return res;
  }

  static getCurrentUser() {
    const curRequestContext = RequestContext.currentRequestContext();
    if (curRequestContext) {
      const user = curRequestContext.ctx.session.userInfo;
      return user;
    }
    return {};
  }

  static getCurrentCtx() {
    const curRequestContext = RequestContext.currentRequestContext();
    if (curRequestContext) return curRequestContext.ctx;
    return {};
  }
}

const setRequestContext = (ctx) => {
  const requestContext = new RequestContext(ctx);
  const session = getNamespace(RequestContext.spaceName) || createNamespace(RequestContext.spaceName);

  session.run(async () => {
    session.set(RequestContext.name, requestContext);
  });
};

const requestContextMiddleware = () => async function (ctx, next) {
  setRequestContext(ctx);
  await next();
};

module.exports = {
  setRequestContext,
  requestContextMiddleware,
  RequestContext,
};
