/* eslint-disable */
import { Observable } from "rxjs";
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
  createEvent(
    request: CreateEventRequest,
    metadata?: Metadata
  ): Observable<Empty>;
  myCreatedEvents(
    request: MyEventsRequest,
    metadata?: Metadata
  ): Observable<MyEvents>;
  updateEventStatus(
    request: UpdateEventRequest,
    metadata?: Metadata
  ): Observable<Empty>;
  /** get all events where deployed status = 'success' */
  allEvents(request: Empty, metadata?: Metadata): Observable<AllEventsResponse>;
  eventByContractAddress(
    request: EventByContractRequest,
    metadata?: Metadata
  ): Observable<Event>;
  createUserEvent(
    request: CreateUserEventRequest,
    metadata?: Metadata
  ): Observable<Empty>;
  deleteUserEvent(
    request: DeleteUserEventRequest,
    metadata?: Metadata
  ): Observable<Empty>;
  allUserEvents(
    request: AllUserEventsRequest,
    metadata?: Metadata
  ): Observable<AllUserEventResponse>;
  eventInfo(
    request: EventInfoRequest,
    metadata?: Metadata
  ): Observable<EventInfoResponse>;
  masterKey(
    request: MasterKeyRequest,
    metadata?: Metadata
  ): Observable<MasterKeyResponse>;
  validateQr(
    request: ValidateQrRequest,
    metadata?: Metadata
  ): Observable<Empty>;
  addAdmin(request: AddAdminRequest, metadata?: Metadata): Observable<Empty>;
}
