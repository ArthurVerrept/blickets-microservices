import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type KeysDocument = Keys & Document

@Schema()
export class Keys {
    @Prop({ required: true })
    id: string
    
    @Prop({ required: true })
    createTime: string

    @Prop({ required: true })
    expiryTime: string

    @Prop({ required: true })
    masterKey: string

}

export const KeysSchema = SchemaFactory.createForClass(Keys)