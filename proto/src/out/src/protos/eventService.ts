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
}
