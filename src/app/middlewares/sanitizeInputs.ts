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

const sanitizeObject = (obj: Record<string, any>): void => {
  const sanitized = mongoSanitize.sanitize(obj);
  const cleaned = replaceCurliesDeep(sanitized);

  // Mutate in place instead of reassigning
  for (const key of Object.keys(obj)) {
    delete obj[key];
  }
  Object.assign(obj, cleaned);
};

export const sanitizeInputs: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    if (req.body && Object.keys(req.body).length > 0) {
      sanitizeObject(req.body);
    }

    if (req.params && Object.keys(req.params).length > 0) {
      sanitizeObject(req.params);
    }

    // For Express 5, req.query is read-only, so we mutate its contents in place
    if (req.query && Object.keys(req.query).length > 0) {
      const sanitized = mongoSanitize.sanitize(req.query);
      const cleaned = replaceCurliesDeep(sanitized);

      for (const key of Object.keys(req.query)) {
        delete req.query[key];
      }
      Object.assign(req.query, cleaned);
    }

    next();
  } catch (error) {
    next(error);
  }
};
