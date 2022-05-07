import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type TicketsScannedDocument = TicketsScanned & Document

@Schema()
export class TicketsScanned {
    @Prop({ required: true })
    contractAddress: string
    
    @Prop({ required: true })
    tokenIds: string[]
}

export const TicketsScannedSchema = SchemaFactory.createForClass(TicketsScanned)