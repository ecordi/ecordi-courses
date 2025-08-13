import { Controller, Post, Body, Get, Req, Res, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { Response } from 'express'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto) { return this.auth.register(dto) }

  @Post('login')
  @ApiOperation({ summary: 'Login with email/password' })
  @ApiBody({ type: LoginDto })
  async login(@Body() dto: LoginDto) { return this.auth.login(dto) }

  @Get('google') @UseGuards(AuthGuard('google')) async google() {}
  @Get('google/callback') @UseGuards(AuthGuard('google')) async googleCb(@Req() req: any, @Res() res: Response) {
    const data = await this.auth.oauthLogin({ provider: 'google', id: req.user.profile.id, name: req.user.profile.displayName, email: req.user.profile.emails?.[0]?.value })
    res.redirect(`/auth/success?token=${data.token}`)
  }

  @Get('facebook') @UseGuards(AuthGuard('facebook')) async facebook() {}
  @Get('facebook/callback') @UseGuards(AuthGuard('facebook')) async facebookCb(@Req() req: any, @Res() res: Response) {
    const data = await this.auth.oauthLogin({ provider: 'facebook', id: req.user.profile.id, name: req.user.profile.displayName, email: req.user.profile.emails?.[0]?.value })
    res.redirect(`/auth/success?token=${data.token}`)
  }
}