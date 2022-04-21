/* eslint-disable */
import { Observable } from "rxjs";
import { Metadata } from "@grpc/grpc-js";
import { Empty } from "../../google/protobuf/empty";

export const protobufPackage = "event";

export interface CreateEventRequest {
  txHash: string;
  imageUrl: string;
  eventDate: number;
  eventName: string;
  symbol: string;
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
  eventDate: number;
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
  eventDate: number;
  ticketPrice: string;
  ticketAmount: string;
  ticketIdCounter: string;
}

export interface EventService {
  createEvent(
    request: CreateEventRequest,
    metadata?: Metadata
  ): Observable<Empty>;
  myCreatedEvents(request: Empty, metadata?: Metadata): Observable<MyEvents>;
  updateEventStatus(
    request: UpdateEventRequest,
    metadata?: Metadata
  ): Observable<Empty>;
  /** get all events where deployed status = 'success' */
  allEvents(request: Empty, metadata?: Metadata): Observable<AllEventsResponse>;
}
