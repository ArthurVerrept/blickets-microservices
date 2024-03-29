/* eslint-disable */
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

export interface EventDisplayRequest {
  contractAddress: string;
}

export interface EventDisplayResponse {
  ticketPrice: number;
  ticketIdCounter: number;
  ticketAmount: number;
}

export interface EthPriceResponse {
  ethPriceUSD: number;
  lastTime: number;
}

export interface BuyTicketsParamsRequest {
  contractAddress: string;
  walletAddress: string;
  purchaseAmount: number;
}

export interface BuyTicketsParamsResponse {
  to: string;
  data: string;
  value: string;
}

export interface TicketPriceWeiRequest {
  contractAddress: string;
}

export interface TicketPriceWeiResponse {
  ticketPriceWei: string;
}

export interface MyEvent {
  media: string;
  contractAddress: string;
  ticketNumber: string;
  eventName: string;
  symbol: string;
  eventDate: string;
  ticketAmount: string;
  title: string;
  description: string;
}

export interface AllMyEventsRequest {
  walletAddress: string;
}

export interface AllMyEventsResponse {
  events: MyEvent[];
}

export interface DoesAddressOwnTicketRequest {
  contractAddress: string;
  address: string;
}

export interface DoesAddressOwnTicketResponse {
  result: boolean;
}

export interface BlockchainEventInfoRequest {
  contractAddress: string;
}

export interface BlockchainEventInfoResponse {
  currentBalance: string;
  ticketAmount: string;
  ticketsSold: string;
  ticketPrice: string;
  resalePrice: string;
}

export interface WithdrawRequest {
  contractAddress: string;
  address: string;
}

export interface WithdrawResponse {
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
  ): Promise<WalletKeys>;
  uploadFile(
    request: UploadImageRequest,
    metadata?: Metadata
  ): Promise<UploadImageResponse>;
  deleteFile(request: DeleteImageRequest, metadata?: Metadata): Promise<Empty>;
  getAllDeployedEvents(
    request: Empty,
    metadata?: Metadata
  ): Promise<AllDeployedEvents>;
  deployEventParameters(
    request: DeployEventRequest,
    metadata?: Metadata
  ): Promise<DeployEventResponse>;
  transactionStatus(
    request: TransactionStatusRequest,
    metadata?: Metadata
  ): Promise<Empty>;
  eventDisplayDetails(
    request: EventDisplayRequest,
    metadata?: Metadata
  ): Promise<EventDisplayResponse>;
  ethPrice(request: Empty, metadata?: Metadata): Promise<EthPriceResponse>;
  buyTicketParams(
    request: BuyTicketsParamsRequest,
    metadata?: Metadata
  ): Promise<BuyTicketsParamsResponse>;
  ticketPriceWei(
    request: TicketPriceWeiRequest,
    metadata?: Metadata
  ): Promise<TicketPriceWeiResponse>;
  allMyEvents(
    request: AllMyEventsRequest,
    metadata?: Metadata
  ): Promise<AllMyEventsResponse>;
  doesAddressOwnTicket(
    request: DoesAddressOwnTicketRequest,
    metadata?: Metadata
  ): Promise<DoesAddressOwnTicketResponse>;
  blockchainEventInfo(
    request: BlockchainEventInfoRequest,
    metadata?: Metadata
  ): Promise<BlockchainEventInfoResponse>;
  withdraw(
    request: WithdrawRequest,
    metadata?: Metadata
  ): Promise<WithdrawResponse>;
}
