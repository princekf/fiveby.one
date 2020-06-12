import { CompanyModel } from './company.model';
const CODE_LENGTH = 5;


export class CompanyImpl {

    private code: string;

    public async setCode() {

      let result = '';
      const characters = 'abcdefghijklmnopqrstuvwxyz';
      for (let counter = 0; counter < CODE_LENGTH; counter++) {

        result += characters.charAt(Math.floor(Math.random() * characters.length));

      }
      const CompanySchema = CompanyModel.createModel();
      const codeCount: number = await CompanySchema.count({ code: result });

      if (codeCount > 0) {

        this.setCode();

      } else {

        this.code = result;

      }

    }

}
