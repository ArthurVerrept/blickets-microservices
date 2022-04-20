import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type EventDocument = Event & Document

@Schema()
export class Event {
    @Prop({ required: true })
    userId: string

    @Prop()
    name: string

    @Prop({ required: true })
    cid: string

    @Prop({ default: '' })
    contractAddress: string

    @Prop({ required: true })
    txHash: string

    @Prop({ default: 'pending' })
    deployedStatus: string
    
    @Prop({ default: undefined })
    admins: number[]

    @Prop({ required: true })
    createdTime: Date

    @Prop()
    eventDate: string
}

export const EventSchema = SchemaFactory.createForClass(Event)