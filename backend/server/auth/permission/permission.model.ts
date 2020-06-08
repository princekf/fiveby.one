import { Document, Schema, Model, connection } from 'mongoose';
import {PermissionS} from 'fivebyone';

interface PermissionDoc extends PermissionS, Document {
}
export class PermissionModel {

  private static permissionSchema = new Schema<PermissionDoc>({
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      index: true,
    }
  });

  public static createModel = (dbName: string): Model<PermissionDoc, {}> => {

    const mongoConnection = connection.useDb(dbName);
    return mongoConnection.model('Permission', PermissionModel.permissionSchema);

  }

}

