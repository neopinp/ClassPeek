import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  console.log("Session being authenticated:", req.session);
  if (!req.session || !req.session.userId) {
    res.status(401).json({ error: 'Unauthorized: Please log in.' });
    return; // Ensure the function ends after sending a response
  }
  next(); // Proceed to the next middleware or route handler
};
