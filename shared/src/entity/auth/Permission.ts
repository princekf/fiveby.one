export interface PermissionS {
  name: string;
  description: string;
}

export interface Permission extends PermissionS {
  _id: string;
}
