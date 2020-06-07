export class CommonUtil {


  public static validatePassword = (userPassword: string): boolean => {

    const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[_A-Z-a-z\d@$!%*?&]{6,}$/ugi;
    return passwordRegEx.test(userPassword);

  }

  public static validateEmail = (email: string): boolean => {

    const emailRegEx = /^(?<name>[a-zA-Z0-9_\-\.]+)@(?<domain>[a-zA-Z0-9_\-\.]+)\.(?<extn>[a-zA-Z]{2,5})$/ugm;
    return emailRegEx.test(email);

  };


  public static validateMobile = (mobile: string): boolean => {

    const mobileRegEx = /^(?<mobileNum>\+\d{1,3}[- ]?)?\d{10}$/ugm;
    return mobileRegEx.test(mobile);

  };

}
