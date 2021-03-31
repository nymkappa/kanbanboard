// 3p
import { createConnection } from 'typeorm';
import { Card } from '../app/entities';

export const schema = {
    additionalProperties: false,
    properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        created_at: { type: 'string' },
        updated_at: { type: 'number' },
        order: { type: 'number' },
        status: { type: 'string' },
    },
    required: ['name', 'order'],
    type: 'object',
};

export async function main(args: { name: string, order: number, description: string }) {
    const connection = await createConnection();

    try {
        const card = new Card();
        card.name = args.name;
        card.description = args.description;
        card.order = args.order;

        console.log(await card.save());
    } catch (error) {
        console.error(error);
    } finally {
        await connection.close();
    }
}
