//TODO: add token to .env
export const jwtConstants = {
  secret: 'superSecret',
  expiresIn: '30d',
};

export const AUTH_SERVICE = Symbol('AUTH_SERVICE');
