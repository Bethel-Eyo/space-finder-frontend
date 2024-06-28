import { type AuthUser } from "@aws-amplify/auth";
import { cognitoUserPoolsTokenProvider } from "@aws-amplify/auth/cognito";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { Amplify } from "aws-amplify";
import { getCurrentUser, signIn, signOut } from "aws-amplify/auth";
import { AuthStack } from "../../../space-finder-cdk/outputs.json";

const awsRegion = "us-east-1";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: AuthStack.SpaceUserPoolId,
      userPoolClientId: AuthStack.SpaceUserPoolClientId,
      identityPoolId: AuthStack.SpaceIdentityPoolId,
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        email: {
          required: false,
        },
      },
      allowGuestAccess: true,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
});

export class AuthService {
  private user: AuthUser | undefined;
  private jwtToken: string | undefined;
  private temporaryCredentials: object | undefined;
  
  public async login(username: string, password: string): Promise<object | undefined> {
    try {
        const response = await signIn({ username, password });
        if(response.isSignedIn){
            this.user = await getCurrentUser();
            this.setJwtIdToken();
            return this.user;
        }
    } catch (error) {
        console.log(error);
        return undefined;
    }
    return {
      user: "abc",
    };
  }

  public async logout(){
    await signOut({ global: true });
  }

  public getUserName() {
    return this.user?.username;
  }

  public async getTemporaryCredentails(){
    if(this.temporaryCredentials){
      return this.temporaryCredentials;
    }
    this.temporaryCredentials = await this.generateTemporaryCredentials();
    return this.temporaryCredentials;
  }

  private async generateTemporaryCredentials(){
    const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/${AuthStack.SpaceUserPoolId}`;
    const cognitoIdentity = new CognitoIdentityClient({
      credentials: fromCognitoIdentityPool({
        clientConfig: {
          region: awsRegion
        },
        identityPoolId: AuthStack.SpaceIdentityPoolId,
        logins: {
          [cognitoIdentityPool]: this.jwtToken!
        }
      })
    });
    const credentials = await cognitoIdentity.config.credentials();
    return credentials;
  }

  private async setJwtIdToken(){
   const tokens = await cognitoUserPoolsTokenProvider.getTokens()
   this.jwtToken = tokens?.idToken?.toString();
  }
}
