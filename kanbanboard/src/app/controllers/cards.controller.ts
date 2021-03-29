import { Context, Get, HttpResponseBadRequest, HttpResponseCreated, HttpResponseInternalServerError, HttpResponseOK, Post, Put, ValidateBody } from '@foal/core';
import { getConnection } from 'typeorm';
import { Card, Category } from '../entities';

export class CardsController {

    @Get('/')
    async getCards() {
        let categories = await Category.find();

        // Create some test card
        let cards: Card[] = [];
        for (let i = 0; i < 5; ++i) {
            let card = new Card();
            card.name = 'Card ' + String(i + 1);
            card.description = 'Card description ' + String(i + 1);
            card.category = categories[0];
            cards.push(card);
        }
        await getConnection().manager.save(cards);

        return new HttpResponseOK();
    }

    /**
     * Create a new card
     */
    @Post('/')
    @ValidateBody({
        additionalProperties: false,
        properties: {
            categoryId: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
        },
        required: ['categoryId', 'name'],
        type: 'object',
    })
    async createCard(ctx: Context) {
        try {
            var category = await Category.findOneOrFail({ id: ctx.request.body.categoryId });
        } catch (e) {
            return new HttpResponseBadRequest("This category id does not exists");
        }

        const card = new Card();
        card.name = ctx.request.body.name;
        card.category = category;
        card.description = ctx.request.body.description ?? null;

        try {
            var createdCard = await card.save();
            return new HttpResponseCreated(createdCard);
        } catch (e) {
            return new HttpResponseInternalServerError("Unable to create the new card");
        }
    }

    /**
     * Update a card data
     */
    @Put('/:cardId')
    @ValidateBody({
        additionalProperties: false,
        properties: {
            name: { type: 'string' },
            description: { type: 'string' },
        },
        required: ['name', 'description'],
        type: 'object',
    })
    async updateCard(ctx: Context, { cardId }) {
        return new HttpResponseOK();
    }

    /**
     * Reorder a card data
     */
    @Put('/reorder/:cardId')
    @ValidateBody({
        additionalProperties: false,
        properties: {
            order: { type: 'integer' },
        },
        required: ['order'],
        type: 'object',
    })
    async reorderCard(ctx: Context, { cardId }) {
        return new HttpResponseOK();
    }

    /**
     * Move a card to a different category
     */
    @Put('/categorize/:cardId')
    @ValidateBody({
        additionalProperties: false,
        properties: {
            categoryId: { type: 'integer' },
            order: { type: 'integer' },
        },
        required: ['categoryId', 'order'],
        type: 'object',
    })
    async categorizeCard(ctx: Context, { cardId }) {
        return new HttpResponseOK();
    }
}
