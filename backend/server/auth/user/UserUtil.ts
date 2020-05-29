export class UserUtil {


  public static validatePassword = (userPassword: string): boolean => {

    const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[_A-Z-a-z\d@$!%*?&]{6,}$/ugi;
    return passwordRegEx.test(userPassword);

  }

}
