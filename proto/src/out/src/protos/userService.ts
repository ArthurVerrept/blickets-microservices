/* eslint-disable */
import { Observable } from "rxjs";
import { Metadata } from "@grpc/grpc-js";
import { Empty } from "../../google/protobuf/empty";

export const protobufPackage = "user";

export interface GoogleAuthUrl {
  url: string;
}

export interface GoogleAuthCode {
  code: string;
}

export interface AccessToken {
  accessToken: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface UserService {
  genGoogleAuthUrl(
    request: Empty,
    metadata?: Metadata
  ): Observable<GoogleAuthUrl>;
  googleLogin(request: GoogleAuthCode, metadata?: Metadata): Observable<Tokens>;
  refresh(request: Empty, metadata?: Metadata): Observable<AccessToken>;
  me(request: Empty, metadata?: Metadata): Observable<Tokens>;
}
