import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type EventDocument = Event & Document

@Schema()
export class Event {
    @Prop()
    userId: number

    @Prop({ required: true })
    cid: string

    @Prop()
    contractAddress: string

    @Prop()
    txHash: string

    @Prop({ default: false })
    deployedStatus: boolean
    
    @Prop()
    admins: number[]

    @Prop()
    createdTime: Date

    @Prop()
    eventDate: Date
}

export const EventSchema = SchemaFactory.createForClass(Event)