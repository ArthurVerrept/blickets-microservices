import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type EventDocument = Event & Document

@Schema()
export class Event {
    @Prop({ required: true })
    userId: string

    @Prop()
    eventName: string

    @Prop()
    symbol: string

    @Prop()
    ticketPrice: number

    @Prop({ required: true })
    imageUrl: string

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

    @Prop()
    deployerAddress: string
}

export const EventSchema = SchemaFactory.createForClass(Event)