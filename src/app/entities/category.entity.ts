// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Card } from './card.entity';

@Entity()
export class Category extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: String;

    @Column()
    order: Number;

    @OneToMany(() => Card, card => card.category)
    cards: Card[];
}
