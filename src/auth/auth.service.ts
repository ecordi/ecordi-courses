import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { JwtService } from '@nestjs/jwt'
import { User, UserDocument } from '../db/schemas/user.schema'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const exists = await this.userModel.findOne({ email: dto.email })
    if (exists) throw new BadRequestException('Email ya registrado')
    const user = new this.userModel({ name: dto.name, email: dto.email, role: 'STUDENT' })
    await (user as any).setPassword(dto.password)
    await user.save()
    return this.sign(user)
  }

  async login(dto: LoginDto) {
    try {
      console.log('Login attempt for email:', dto.email)
      const user = await this.userModel.findOne({ email: dto.email }).select('+passwordHash')
      console.log('User found:', !!user)
      if (!user) throw new UnauthorizedException('Credenciales inválidas')
      
      console.log('Validating password, passwordHash exists:', !!user.passwordHash)
      const ok = await (user as any).validatePassword(dto.password)
      console.log('Password validation result:', ok)
      
      if (!ok) throw new UnauthorizedException('Credenciales inválidas')
      return this.sign(user)
    } catch (error) {
      console.error('Login error:', error)
      // Si algo falla (p.ej. bcrypt), devolvemos 401 para no exponer detalles
      throw new UnauthorizedException('Credenciales inválidas')
    }
  }

  async oauthLogin(profile: { provider: 'google' | 'facebook'; id: string; name: string; email?: string }) {
    const byOauth = profile.provider === 'google' ? { 'oauth.googleId': profile.id } : { 'oauth.facebookId': profile.id }
    let user = await this.userModel.findOne(byOauth)
    if (!user && profile.email) user = await this.userModel.findOne({ email: profile.email })
    if (!user) {
      user = new this.userModel({
        name: profile.name,
        email: profile.email || `${profile.provider}_${profile.id}@nomail.local`,
        role: 'STUDENT',
        oauth: profile.provider === 'google' ? { googleId: profile.id } : { facebookId: profile.id }
      })
      await user.save()
    } else {
      if (profile.provider === 'google' && !(user as any).oauth?.googleId) (user as any).oauth = { ...(user as any).oauth, googleId: profile.id }
      if (profile.provider === 'facebook' && !(user as any).oauth?.facebookId) (user as any).oauth = { ...(user as any).oauth, facebookId: profile.id }
      await user.save()
    }
    return this.sign(user)
  }

  async logout(userId: string) {
    // En una implementación con tokens de refresco o lista negra de tokens,
    // aquí invalidaríamos el token. Como usamos JWT simples, solo devolvemos éxito.
    // Para una implementación más segura, se podría:
    // 1. Mantener una lista negra de tokens en Redis
    // 2. Actualizar un campo tokenVersion en el usuario
    // 3. Implementar tokens de refresco
    
    return { success: true, message: 'Sesión cerrada correctamente' }
  }

  private sign(user: UserDocument) {
    try {
      const payload = { sub: user._id.toString(), role: user.role }
      // Debug: ensure JWT secret is present
      // Note: JwtService uses configured secret; this checks env as a quick sanity check
      console.log('JWT secret present:', !!process.env.JWT_SECRET)
      const token = this.jwt.sign(payload)
      return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }
    } catch (e) {
      console.error('JWT sign error:', e)
      throw new InternalServerErrorException('Auth token generation failed')
    }
  }
}