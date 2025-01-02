const UserService = require('../../services/user.js');
const logger = require('../../utils/log');

const authenticateWithToken = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (authHeader) {
    const m = authHeader.match(/^(Token|Bearer) (.+)/i);
    if (m) {
      UserService.authenticateWithToken(m[2])
        .then((user) => {
          req.user = user;
          next();
        })
        .catch((err) => {
          next(err);
        });
      return;
    }
  }

  next();
};

const requireUser = (req, res, next) => {
  logger.info('Auth middleware - checking user:', {
    user: req.user,
    session: req.session,
    headers: req.headers.authorization
  });
  
  if (!req.user) {
    logger.warn('Authentication required but no user found in request');
    return res.status(401).json({ error: 'Authentication required' });
  }

  logger.info('User authenticated successfully', { userId: req.user._id });
  next();
};

module.exports = {
  authenticateWithToken,
  requireUser,
};