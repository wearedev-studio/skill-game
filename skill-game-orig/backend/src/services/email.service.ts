// В этом файле будет использоваться Nodemailer для реальной отправки
export class EmailService {
  public static async sendVerificationCode(email: string, code: string): Promise<void> {
    console.log(`--- MOCK EMAIL ---`);
    console.log(`To: ${email}`);
    console.log(`Subject: Код подтверждения`);
    console.log(`Your code is: ${code}`);
    console.log(`------------------`);
    // В реальном проекте здесь будет transport.sendMail(...)
    return Promise.resolve();
  }

  public static async sendPasswordResetCode(email: string, code: string): Promise<void> {
    console.log(`--- MOCK EMAIL ---`);
    console.log(`To: ${email}`);
    console.log(`Subject: Код для сброса пароля`);
    console.log(`Your reset code is: ${code}`);
    console.log(`------------------`);
    return Promise.resolve();
  }
}