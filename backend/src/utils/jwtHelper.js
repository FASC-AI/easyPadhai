import jwt from 'jsonwebtoken';
import config from '../config';

/**
 * Utility functions for handling JWT tokens.
 */
const jwtUtils = {
  /**
   * Generates a JWT token.
   *
   * @param {Object} payload - The payload to encode in the token.
   * @param {string} [expiresIn="8h"] - The token expiration time (optional, default is 8 hours).
   * @returns {string} The generated JWT token.
   *
   * @example
   * const token = jwtUtils.generateToken({ id: '12345' });
   */
  generateToken(payload, expiresIn = '21d') {
    // Ensure payload.id exists and is valid
    if (!payload.id) {
      throw new Error('Payload must contain an id field');
    }
    
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn,
      audience: payload.id.toString(),
      issuer: 'upsdma',
    });
  },

  /**
   * Verifies a JWT token.
   *
   * @param {string} token - The token to verify.
   * @returns {Object} The decoded token payload if verification is successful.
   * @throws {Error} If the token is invalid or expired.
   *
   * @example
   * try {
   *   const decoded = jwtUtils.verifyToken(token);
   *
   * } catch (error) {
   *   console.error('Token verification failed:', error.message);
   * }
   */
  verifyToken(token) {
    try {
      const decoded = jwt.decode(token);
      const audience = decoded.id || decoded.userId;
      
      if (!audience) {
        throw new Error('Token missing audience field');
      }
      
      return jwt.verify(token, config.jwt.secret, {
        audience: audience.toString(),
        issuer: 'upsdma',
      });
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  },
};

export default jwtUtils;
