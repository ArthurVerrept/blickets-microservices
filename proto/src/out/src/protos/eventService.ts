/* eslint-disable */
import { Metadata } from "@grpc/grpc-js";
import { Empty } from "../../google/protobuf/empty";

export const protobufPackage = "event";

export interface CreateEventRequest {
  txHash: string;
  imageUrl: string;
  eventDate: string;
  eventName: string;
  symbol: string;
  deployerAddress: string;
}

export interface MyEventsRequest {
  address: string;
}

export interface MyEvents {
  events: MongoEvent[];
}

export interface MongoEvent {
  userId: string;
  eventName: string;
  symbol: string;
  imageUrl: string;
  contractAddress: string;
  txHash: string;
  deployedStatus: string;
  admins: number[];
  eventDate: string;
}

export interface UpdateEventRequest {
  txHash: string;
  contractAddress?: string | undefined;
}

export interface AllEventsResponse {
  events: Event[];
}

export interface Event {
  eventName: string;
  symbol: string;
  imageUrl: string;
  contractAddress: string;
  eventDate: string;
  ticketPrice: string;
  ticketAmount: string;
  ticketIdCounter: string;
}

export interface EventByContractRequest {
  contractAddress?: string | undefined;
}

export interface CreateUserEventRequest {
  contractAddress: string;
  walletAddress: string;
}

export interface DeleteUserEventRequest {
  contractAddress: string;
  walletAddress: string;
}

export interface AllUserEventsRequest {
  walletAddress: string;
}

export interface AllUserEventResponse {
  contractAddresses: string[];
}

export interface EventInfoRequest {
  contractAddress: string;
  address: string;
}

export interface EventInfoResponse {
  eventName: string;
  symbol: string;
  imageUrl: string;
  txHash: string;
  deployedStatus: string;
  createdTime: string;
  eventDate: string;
  deployerAddress: string;
  admins: string[];
  currentBalance: string;
  ticketAmount: string;
  ticketsSold: string;
  ticketPrice: string;
  resalePrice: string;
}

export interface MasterKeyRequest {
  contractAddress: string;
  address: string;
}

export interface MasterKeyResponse {
  expiryTime: string;
  masterKey: string;
}

export interface ValidateQrRequest {
  masterCode: string;
  contractAddress: string;
  address: string;
  ticketId: string;
  accessToken: string;
}

export interface ValidateQrResponse {
  message: string;
  code: string;
}

export interface AddAdminRequest {
  email: string;
  address: string;
  contractAddress: string;
}

export interface EventService {
  createEvent(request: CreateEventRequest, metadata?: Metadata): Promise<Empty>;
  myCreatedEvents(
    request: MyEventsRequest,
    metadata?: Metadata
  ): Promise<MyEvents>;
  updateEventStatus(
    request: UpdateEventRequest,
    metadata?: Metadata
  ): Promise<Empty>;
  /** get all events where deployed status = 'success' */
  allEvents(request: Empty, metadata?: Metadata): Promise<AllEventsResponse>;
  eventByContractAddress(
    request: EventByContractRequest,
    metadata?: Metadata
  ): Promise<Event>;
  createUserEvent(
    request: CreateUserEventRequest,
    metadata?: Metadata
  ): Promise<Empty>;
  deleteUserEvent(
    request: DeleteUserEventRequest,
    metadata?: Metadata
  ): Promise<Empty>;
  allUserEvents(
    request: AllUserEventsRequest,
    metadata?: Metadata
  ): Promise<AllUserEventResponse>;
  eventInfo(
    request: EventInfoRequest,
    metadata?: Metadata
  ): Promise<EventInfoResponse>;
  masterKey(
    request: MasterKeyRequest,
    metadata?: Metadata
  ): Promise<MasterKeyResponse>;
  validateQr(request: ValidateQrRequest, metadata?: Metadata): Promise<Empty>;
  addAdmin(request: AddAdminRequest, metadata?: Metadata): Promise<Empty>;
}
