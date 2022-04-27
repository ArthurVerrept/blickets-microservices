import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type UserEventDocument = UserEvent & Document

@Schema()
export class UserEvent {
    @Prop({ required: true })
    userId: string

    @Prop({ default: undefined })
    contractAddress: string[]
}

export const UserEventSchema = SchemaFactory.createForClass(UserEvent)