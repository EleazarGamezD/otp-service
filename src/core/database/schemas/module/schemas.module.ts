import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {Client, ClientSchema} from '../clients/client.schema';
import {OTP, OTPSchema} from '../otp/otp.schema';

export const schemas = [
    {name: OTP.name, schema: OTPSchema},
    {name: Client.name, schema: ClientSchema},
];

@Module({
    imports: [
        MongooseModule.forFeature(schemas),
    ],
    exports: [MongooseModule],
})
export class SchemasModule { }
