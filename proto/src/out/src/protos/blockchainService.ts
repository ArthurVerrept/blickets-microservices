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
  /**
   * currently creating account on server, this is a security concern for that one request
   * it does however save me lots of headaches on the front end.
   */
  createEthereumAccount(
    request: Empty,
    metadata?: Metadata
  ): Observable<WalletKeys>;
}
