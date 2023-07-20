import {Body, Controller, Post} from '@nestjs/common';
import {SignInDto} from "./dto/signIn.dto";
import {AuthService} from "./auth.service";
import {ThrowAuthErrorIfFound} from "./decorator/ThrowAuthErrorIfFound";

@Controller('auth')
export class AuthController {
    public constructor(private readonly authService: AuthService) {
    }
    @Post('/signIn')
    @ThrowAuthErrorIfFound()
    public signIn(@Body() body: SignInDto){
        return this.authService.signIn(body.username, body.password);
    }
}
