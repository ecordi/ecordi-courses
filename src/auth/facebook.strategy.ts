import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-facebook'
import { Injectable } from '@nestjs/common'

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_REDIRECT_URI,
      profileFields: ['id', 'displayName', 'emails']
    })
  }
  async validate(accessToken: string, refreshToken: string, profile: any) {
    return { accessToken, profile }
  }
}