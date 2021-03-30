import { Context, Get, HttpResponseBadRequest, HttpResponseCreated, HttpResponseInternalServerError, HttpResponseOK, Post, Put, ValidateBody } from '@foal/core';
import { notEqual } from 'assert';
import { Equal, getConnection, Not } from 'typeorm';
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
        try {
            var card = await Card.findOneOrFail({ id: cardId });
            card.name = ctx.request.body.name;
            card.description = ctx.request.body.description ?? null;
            await card.save();

            return new HttpResponseOK();
        } catch (e) {
            return new HttpResponseInternalServerError("Unable to update the card");
        }
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
        var newCardOrderIndex = ctx.request.body.order ?? 0;
        if (!newCardOrderIndex || newCardOrderIndex < 1) {
            return new HttpResponseBadRequest("Invalid card order index");
        }

        // Find the card matching the id
        try {
            var cardToUpdate = await Card.findOneOrFail({ id: cardId }, { relations: ['category'] });
        } catch (e) {
            return new HttpResponseBadRequest("This card id does not exists");
        }

        // Get all card from the 'cardToUpdate.category' and reorder them
        try {
            // NOTE: Maybe we could avoid this process. See CategoriesController::reorderCategory()

            // Get all cards from the same category
            var cards = await Card.find({
                where: { category: cardToUpdate.category, id: Not(Equal(cardToUpdate.id)) },
                order: { order: 'ASC' }
            });

            // Insert the card we've updated at the desired position
            cards.splice(newCardOrderIndex - 1, 0, cardToUpdate);

            // Update all order index and save all entities in the db
            cards.forEach((entity, newOrderIndex) => {
                entity.order = newOrderIndex + 1;
            })
            var connection = await getConnection();
            await connection.manager.save(cards);

            return new HttpResponseOK();
        } catch (e) {
            return new HttpResponseInternalServerError("Unable to update the new category");
        }
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
