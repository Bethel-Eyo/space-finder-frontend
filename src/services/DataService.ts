import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AuthService } from "./AuthService";
import { DataStack, ApiStack } from "../../../space-finder-cdk/outputs.json";

interface Space {
  name: string;
  location: string;
  photoUrl?: string | undefined;
}

const spacesUrl = ApiStack.SpacesApiEndpoint36C4F3B6 + "spaces";
export class DataService {
  private authService: AuthService;
  private s3Client: S3Client | undefined;
  private awsRegion: string = "us-east-1";

  constructor(authservice: AuthService) {
    this.authService = authservice;
  }

  public async createSpace(name: string, location: string, photo?: File) {
    let uploadUrl: string | undefined;
    if (photo) {
      uploadUrl = await this.uploadPublicFile(photo);
    }
    const space: Space = {
      name,
      location,
      photoUrl: uploadUrl,
    };

    const postResult = await fetch(spacesUrl, {
      method: 'POST',
      body: JSON.stringify(space),
      headers: {
        'Authorization': this.authService.jwtToken!
      }
    });
    const postResultJSON = await postResult.json();
    return postResultJSON.id;
  }

  private async uploadPublicFile(file: File) {
    const credentials = await this.authService.getTemporaryCredentails();
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        credentials: credentials as any, // type AwsCredentialIdentity is currently not available
        region: this.awsRegion,
      });
    }

    const command = new PutObjectCommand({
      Bucket: DataStack.SpaceFinderPhotosBucketName,
      Key: file.name,
      ACL: "public-read",
      Body: file,
    });
    await this.s3Client.send(command);
    return `https://${command.input.Bucket}.s3.${this.awsRegion}.amazonaws.com/${command.input.Key}`;
  }

  public isAuthorized() {
    return true;
  }
}
