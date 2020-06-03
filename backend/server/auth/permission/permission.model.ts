import { Document, Schema, model } from 'mongoose';
import { SchemaDef } from '../../../types';
import {PermissionS} from 'fivebyone';

interface PermissionDoc extends PermissionS, Document {
}
const permissionSchemaDef: SchemaDef<PermissionS> = {

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
};

// Declare the model schema
const permissionSchema = new Schema(permissionSchemaDef);

export default model<PermissionDoc>('Permission', permissionSchema);
