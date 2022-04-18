/* eslint-disable */
import { Observable } from "rxjs";
import { Metadata } from "@grpc/grpc-js";
import { Empty } from "../../google/protobuf/empty";

export const protobufPackage = "event";

export interface CreateEventRequest {
  txnId: string;
  cid: string;
}

export interface EventService {
  createEvent(
    request: CreateEventRequest,
    metadata?: Metadata
  ): Observable<Empty>;
}
