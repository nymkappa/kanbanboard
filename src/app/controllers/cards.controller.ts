import { Context, Delete, Get, HttpResponseBadRequest, HttpResponseCreated, HttpResponseInternalServerError, HttpResponseOK, Post, Put, ValidateBody, ValidatePathParam } from '@foal/core';
import { Equal, getConnection, Not, RelationCount } from 'typeorm';
import { Card, Category } from '../entities';

export class CardsController {

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
            var category: Category = await Category.findOneOrFail({ id: ctx.request.body.categoryId });
        } catch (e) {
            return new HttpResponseBadRequest("This category id does not exists");
        }

        const card = new Card();
        card.name = ctx.request.body.name;
        card.category = category;
        if (ctx.request.body.description) {
            card.description = ctx.request.body.description;
        }

        try {
            var createdCard: Card = await card.save();
            return new HttpResponseCreated(createdCard);
        } catch (e) {
            return new HttpResponseInternalServerError("Unable to create the new card");
        }
    }

    /**
     * Update a card
     */
    @Put('/:cardId')
    @ValidateBody({
        additionalProperties: false,
        properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string' },
        },
        type: 'object',
    })
    async updateCard(ctx: Context, { cardId }) {
        try {
            var card: Card = await Card.findOneOrFail({ id: cardId });
            if (ctx.request.body.name) {
                card.name = ctx.request.body.name;
            }
            if (ctx.request.body.description) {
                card.description = ctx.request.body.description;
            }
            if (ctx.request.body.status) {
                card.status = ctx.request.body.status;
                // If we archive a card, consider that it also has no category anymore
                card.category = null;
            }
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
        var newCardOrderIndex: number = ctx.request.body.order ?? 0;
        if (!newCardOrderIndex || newCardOrderIndex < 1) {
            return new HttpResponseBadRequest("Invalid card order index");
        }

        // Find the card matching the id
        try {
            var cardToUpdate: Card = await Card.findOneOrFail({ id: cardId }, { relations: ['category'] });
        } catch (e) {
            return new HttpResponseBadRequest("This card id does not exists");
        }

        // Get all card from the 'cardToUpdate.category' and reorder them
        try {
            // NOTE: Maybe we could avoid this process. See CategoriesController::reorderCategory()

            // Get all cards from the same category
            var cards: Card[] = await Card.find({
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
        // Find the card matching the id and update its category
        try {
            var category: Category = await Category.findOneOrFail({ id: ctx.request.body.categoryId });
            var cardToUpdate: Card = await Card.findOneOrFail({ id: cardId }, { relations: ['category'] });
            cardToUpdate.category = category;
            await cardToUpdate.save();
        } catch (e) {
            return new HttpResponseBadRequest("This card id does not exists");
        }

        // Now re-order the category cards
        return this.reorderCard(ctx, { cardId });
    }

    /**
     * Get all cards
     */
    @Get('/')
    async getCards() {
        var cards: Card[] = await Card.find({ relations: ['category'] });
        return new HttpResponseOK(cards);
    }

    /**
    * Get one card
    */
    @Get('/:cardId')
    @ValidatePathParam('cardId', { type: 'integer' })
    async getCard(ctx: Context, { cardId }) {
        var card: Card | undefined = await Card.findOne({ id: cardId }, { relations: ['category'] });
        if (!card) {
            return new HttpResponseBadRequest("This card id does not exists");
        } else {
            return new HttpResponseOK([card]);
        }
    }

    /**
     * Delete one card
     */
     @Delete('/:cardId')
     @ValidatePathParam('cardId', { type: 'integer' })
     async deleteCard(ctx: Context, { cardId }) {
         try {
             var card: Card = await Card.findOneOrFail({ id: cardId }, { relations: ['category'] });
             card.category = null;
             card.save();

             var res = await Card.delete({ id: cardId });
             if (res.affected != 1) {
                 return new HttpResponseBadRequest("Unable to delete the card");
             } else {
                 return new HttpResponseOK();
             }
         } catch (e) {
             return new HttpResponseBadRequest("This card id does not exists");
         }
     }
 }
