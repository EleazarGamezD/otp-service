import {createParamDecorator, ExecutionContext} from '@nestjs/common';

export const CurrentClient = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user; // El client se guarda en user por Passport
    },
);
