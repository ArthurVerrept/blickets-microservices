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

export interface AddAddressRequest {
  address: string;
}

export interface AccessToken {
  accessToken: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  addresses: string[];
}

export interface User {
  email: string;
  name: string;
  picture: string;
}

export interface MyAddressesResponse {
  addresses: string[];
}

export interface AdminEmailRequest {
  adminIds: string[];
}

export interface AdminEmailResponse {
  admins: string[];
}

export interface UserService {
  genGoogleAuthUrl(
    request: Empty,
    metadata?: Metadata
  ): Observable<GoogleAuthUrl>;
  googleLogin(request: GoogleAuthCode, metadata?: Metadata): Observable<Tokens>;
  addAddress(
    request: AddAddressRequest,
    metadata?: Metadata
  ): Observable<Empty>;
  refresh(request: Empty, metadata?: Metadata): Observable<AccessToken>;
  me(request: Empty, metadata?: Metadata): Observable<User>;
  myAddresses(
    request: Empty,
    metadata?: Metadata
  ): Observable<MyAddressesResponse>;
  adminEmails(
    request: AdminEmailRequest,
    metadata?: Metadata
  ): Observable<AdminEmailResponse>;
}
