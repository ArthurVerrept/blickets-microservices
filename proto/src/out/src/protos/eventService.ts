/* eslint-disable */
import { Observable } from "rxjs";
import { Metadata } from "@grpc/grpc-js";

export const protobufPackage = "event";

export interface CreateEventRequest {
  txHash: string;
  cid: string;
  date: string;
}

export interface Event {
  id: string;
  userId: string;
  cid: string;
  contractAddress?: string | undefined;
  txHash: string;
  deployedStatus: boolean;
  admins: string[];
  date: string;
}

export interface EventService {
  createEvent(
    request: CreateEventRequest,
    metadata?: Metadata
  ): Observable<Event>;
}
