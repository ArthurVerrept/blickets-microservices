/* eslint-disable */
import { Observable } from "rxjs";
import { Metadata } from "@grpc/grpc-js";
import { Empty } from "../../google/protobuf/empty";

export const protobufPackage = "event";

export interface CreateEventRequest {
  txHash: string;
  cid: string;
  eventDate: string;
}

export interface MyEvents {
  events: MongoEvent[];
}

export interface MongoEvent {
  userId: string;
  cid: string;
  contractAddress: string;
  txHash: string;
  deployedStatus: boolean;
  admins: number[];
  eventDate: string;
}

export interface UpdateEventRequest {
  contractAddress?: string | undefined;
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
}
