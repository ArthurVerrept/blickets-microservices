import { Exclude } from "class-transformer"
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
class User {
    @Exclude()
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({ unique: true })
    email: string

    @Exclude()
    @Column({ default: false })
    isCreatedWithGoogle: boolean

    @Exclude()
    @Column({ nullable: true })
    thirdPartyRefreshToken?: string

    @Exclude()
    @Column({ nullable: true })
    currentRefreshToken?: string
}

export default User