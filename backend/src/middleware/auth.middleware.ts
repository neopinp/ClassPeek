import { Request, Response, NextFunction } from 'express';

// Middleware for authentication restricted actions
// After the route (i.e. '/users/me'), requireAuth is inserted as a parameter.
// When calling APIs with either of these, withCredentials MUST be set to true or this will fail
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  console.log("Session being authenticated:", req.session);
  if (!req.session || !req.session.userId) {
    res.status(401).json({ error: 'Unauthorized: Please log in.' });
    return;
  }
  next(); // Proceed to the next middleware or route handler
};

// Middleware for role restricted actions
export const restrictTo = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userType = req.session?.userType;

    if (!userType || !allowedRoles.includes(userType)) {
      res.status(403).json({ error: "Access denied" }); // Send 403 response if role is restricted
      return; // Prevent further execution
    }

    next(); // Call the next middleware if access is allowed
  };
};
