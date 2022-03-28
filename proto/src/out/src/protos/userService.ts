/* eslint-disable */
import { Observable } from "rxjs";
import { Metadata } from "@grpc/grpc-js";
import { Empty } from "../../google/protobuf/empty";

export const protobufPackage = "user";

export interface AuthCode {
  code: string;
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
  login(request: AuthCode, metadata?: Metadata): Observable<Tokens>;
  me(request: Empty, metadata?: Metadata): Observable<Tokens>;
}
