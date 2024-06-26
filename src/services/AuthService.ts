import { type AuthUser } from "@aws-amplify/auth";
import { Amplify } from "aws-amplify";
import { signIn, getCurrentUser } from "aws-amplify/auth";
import { AuthStack } from "../../../space-finder-cdk/outputs.json";

// const awsRegion = "us-east-1";

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
  public async login(username: string, password: string): Promise<object | undefined> {
    try {
        const response = await signIn({ username, password });
        if(response.isSignedIn){
            this.user = await getCurrentUser();
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

  public getUserName() {
    return this.user?.username;
  }
}
