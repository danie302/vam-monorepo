import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { CurrentUser, Public } from '@nestjs/authentication';
import { User } from '../../../user/domain/user.ts';
import {
  toUserResponse,
  type UserResponse,
} from '../../../user/presentation/http/user.response.ts';
import { SignInUseCase } from '../../application/sign-in.use-case.ts';
import { SignOutUseCase } from '../../application/sign-out.use-case.ts';
import { SignUpUseCase } from '../../application/sign-up.use-case.ts';
import { AuthErrorFilter } from './auth-error.filter.ts';
import { signInSchema, type SignInDto } from './dto/sign-in.dto.ts';
import { signUpSchema, type SignUpDto } from './dto/sign-up.dto.ts';

/** Translates HTTP to the auth use cases and back; no logic of its own. */
@Controller('auth')
@UseFilters(AuthErrorFilter)
export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly signOutUseCase: SignOutUseCase,
  ) {}

  /** Creates the account and signs this browser in. */
  @Public()
  @Post('sign-up')
  async signUp(
    @Body({ schema: signUpSchema }) body: SignUpDto,
  ): Promise<UserResponse> {
    return toUserResponse(await this.signUpUseCase.execute(body));
  }

  /** Checks email and password and signs this browser in. */
  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body({ schema: signInSchema }) body: SignInDto,
  ): Promise<UserResponse> {
    return toUserResponse(await this.signInUseCase.execute(body));
  }

  /** Ends this browser's session. */
  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(): Promise<void> {
    await this.signOutUseCase.execute();
  }

  /** The signed-in user. */
  @Get('me')
  me(@CurrentUser() user: User): UserResponse {
    return toUserResponse(user);
  }
}
