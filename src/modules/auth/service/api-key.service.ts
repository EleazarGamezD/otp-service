import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Client} from '../../../core/database/schemas/clients/client.schema';

@Injectable()
export class ApiKeyService {
  constructor(@InjectModel(Client.name) private clientModel: Model<Client>) { }
  async validateApiKey(apiKey: string) {
    return this.clientModel.findOne({apiKey});
  }
}
