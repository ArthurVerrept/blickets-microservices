/* eslint-disable */
import { Observable } from "rxjs";
import { Metadata } from "@grpc/grpc-js";
import { Empty } from "../../google/protobuf/empty";

export const protobufPackage = "blockchain";

export interface WalletKeys {
  address: string;
  privateKey: string;
}

export interface BlockchainService {
  createAccount(request: Empty, metadata?: Metadata): Observable<WalletKeys>;
}
