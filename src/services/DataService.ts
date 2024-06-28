import { AuthService } from "./AuthService";

export class DataService {
  private authService: AuthService;

  constructor(authservice: AuthService) {
    this.authService = authservice;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async createSpace(name: string, location: string, photo?: File) {
    const credentials = await this.authService.getTemporaryCredentails();
    console.log(credentials);
    return "bla bla bla";
  }

  public isAuthorized() {
    return true;
  }
}
