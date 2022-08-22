/* eslint-disable */
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

export interface AdminIdRequest {
  email: string;
}

export interface AdminIdResponse {
  adminId: string;
}

export interface UserService {
  genGoogleAuthUrl(request: Empty, metadata?: Metadata): Promise<GoogleAuthUrl>;
  googleLogin(request: GoogleAuthCode, metadata?: Metadata): Promise<Tokens>;
  addAddress(request: AddAddressRequest, metadata?: Metadata): Promise<Empty>;
  refresh(request: Empty, metadata?: Metadata): Promise<AccessToken>;
  me(request: Empty, metadata?: Metadata): Promise<User>;
  myAddresses(
    request: Empty,
    metadata?: Metadata
  ): Promise<MyAddressesResponse>;
  adminEmails(
    request: AdminEmailRequest,
    metadata?: Metadata
  ): Promise<AdminEmailResponse>;
  adminId(
    request: AdminIdRequest,
    metadata?: Metadata
  ): Promise<AdminIdResponse>;
}
