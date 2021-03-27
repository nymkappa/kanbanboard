// 3p
import { createConnection } from 'typeorm';
import { Category } from '../app/entities';

export const schema = {
    additionalProperties: false,
    properties: {
        name: { type: 'string' },
        order: { type: 'number' },
    },
    required: ['name'],
    type: 'object',
};

export async function main(args: { name: string, order: number }) {
    const connection = await createConnection();

    try {
        const category = new Category();
        category.name = args.name;
        category.order = args.order;
        category.cards = [];

        console.log(await category.save());
    } catch (error) {
        console.error(error);
    } finally {
        await connection.close();
    }
}
