// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class Card extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Category, category => category.cards)
    category: Category;

    @Column()
    name: String;

    @Column()
    Description: String;

    @Column()
    created_at: Date;

    @Column()
    updated_at: Date;

    @Column()
    order: Number;

    @Column()
    status: String;
}
