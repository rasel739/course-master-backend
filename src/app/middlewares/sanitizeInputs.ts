import { Request, Response, NextFunction, RequestHandler } from 'express';
import mongoSanitize from 'express-mongo-sanitize';

const replaceCurliesDeep = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return obj.replace(/{/g, '[').replace(/}/g, ']');
  }

  if (Array.isArray(obj)) {
    return obj.map(replaceCurliesDeep);
  }

  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceCurliesDeep(value);
    }
    return result;
  }

  return obj;
};

export const sanitizeInputs: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    if (req.body) {
      req.body = mongoSanitize.sanitize(req.body);
    }

    if (req.params && Object.keys(req.params).length > 0) {
      req.params = mongoSanitize.sanitize(req.params);
    }

    if (req.query && Object.keys(req.query).length > 0) {
      req.query = mongoSanitize.sanitize(req.query) as typeof req.query;
    }

    if (req.body) {
      req.body = replaceCurliesDeep(req.body);
    }

    if (req.params && Object.keys(req.params).length > 0) {
      req.params = replaceCurliesDeep(req.params);
    }

    if (req.query && Object.keys(req.query).length > 0) {
      req.query = replaceCurliesDeep(req.query);
    }

    next();
  } catch (error) {
    next(error);
  }
};
