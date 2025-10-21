import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { prisma } from '@/backend/config/prisma';
import { JWT_SECRET } from '@/backend/config/auth';
import { JWTPayload } from '@/backend/types/auth.types';

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(options, async (payload: JWTPayload, done) => {
    try {
      const user = await prisma.users.findUnique({
        where: { id: payload.userId },
      });

      if (user) {
        return done(null, user);
      }

      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
