import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

const createToken = (
  payload: string | object | Record<string, unknown>,
  secret: Secret,
  expireTime: string | number,
): string => {
  return jwt.sign(payload as string | object, secret, {
    expiresIn: expireTime,
  } as SignOptions);
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtUtils = {
  createToken,
  verifyToken,
};
