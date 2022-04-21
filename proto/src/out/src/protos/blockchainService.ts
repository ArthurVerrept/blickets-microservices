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
  imageUrl: string;
}

export interface DeleteImageRequest {
  id: string;
}

export interface AllDeployedEvents {
  addresses: string[];
}

export interface DeployEventRequest {
  name: string;
  symbol: string;
  ticketAmount: string;
  ticketPrice: string;
  resaleCost: string;
}

export interface DeployEventResponse {
  to: string;
  data: string;
}

export interface TransactionStatusRequest {
  txHash: string;
}

export interface EventNameRequest {
  contractAddress: string;
}

export interface EventNameResponse {
  eventName: string;
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
  getAllDeployedEvents(
    request: Empty,
    metadata?: Metadata
  ): Observable<AllDeployedEvents>;
  deployEventParameters(
    request: DeployEventRequest,
    metadata?: Metadata
  ): Observable<DeployEventResponse>;
  transactionStatus(
    request: TransactionStatusRequest,
    metadata?: Metadata
  ): Observable<Empty>;
  eventName(
    request: EventNameRequest,
    metadata?: Metadata
  ): Observable<EventNameResponse>;
}
