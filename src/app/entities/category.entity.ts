// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Card } from './card.entity';

@Entity()
export class Category extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    // Not a great default ("magic number") but it's very unlikely someone will ever need so many categories
    @Column({ default: 999999 })
    order: number;

    @OneToMany(() => Card, card => card.category)
    cards: Card[];
}
