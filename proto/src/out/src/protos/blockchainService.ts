/* eslint-disable */
import { Observable } from "rxjs";
import { Metadata } from "@grpc/grpc-js";
import { Empty } from "../../google/protobuf/empty";

export const protobufPackage = "blockchain";

export interface WalletKeys {
  address: string;
  privateKey: string;
}

export interface UploadImageRequest {
  binary: Uint8Array;
  mime: string;
}

export interface UploadImageResponse {
  cid: string;
  url: string;
}

export interface DeleteImageRequest {
  id: string;
}

export interface Events {
  addresses: string[];
}

export interface DeployEventRequest {
  file: UploadImageResponse | undefined;
  name: string;
  eventName: string;
  ticketAmount: string;
  ticketPrice: string;
  resaleCost: string;
  date: string;
}

export interface DeployEventResponse {
  to: string;
  data: string;
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
  uploadFile(
    request: UploadImageRequest,
    metadata?: Metadata
  ): Observable<UploadImageResponse>;
  deleteFile(
    request: DeleteImageRequest,
    metadata?: Metadata
  ): Observable<Empty>;
  getEvents(request: Empty, metadata?: Metadata): Observable<Events>;
  deployEventParameters(
    request: DeployEventRequest,
    metadata?: Metadata
  ): Observable<DeployEventResponse>;
}
