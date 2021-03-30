// std
import { ok, strictEqual } from 'assert';

// 3p
import { Context, createController, getHttpMethod, getPath, HttpResponseBadRequest, isHttpResponseBadRequest, isHttpResponseCreated, isHttpResponseInternalServerError, isHttpResponseOK } from '@foal/core';

// App
import { CardsController } from './cards.controller';
import { Connection, createConnection } from 'typeorm';
import { Card, Category } from '../entities';

describe('CardsController', () => {

    let connection: Connection;
    let controller: CardsController;
    let initialCategoryNumber: number = 5;
    let initialCardNumber: number = 5;
    let categories: Category[] = []; // We need them to manage cards

    // Create a connection to the database before running all the tests.
    before(async () => {
        connection = await createConnection();

        // Create some test categories
        for (let i = 0; i < initialCategoryNumber; ++i) {
            let newCategory = new Category();
            newCategory.name = 'Category ' + String(i + 1);
            newCategory.order = i + 1;
            categories.push(newCategory);
        }
        await connection.manager.save(categories);

        // Create some test cards
        let cards: Card[] = [];

        let firstCard = new Card();
        firstCard.name = 'Card 1';
        firstCard.order = 1;
        firstCard.category = categories[0];
        cards.push(firstCard);

        for (let i = 1; i < initialCardNumber; ++i) {
            let newCard = new Card();
            newCard.name = 'Card 1-' + String(i + 1);
            newCard.order = 1 + Math.floor(Math.random() * 1000);
            newCard.category = categories[0];
            cards.push(newCard);
        }
        for (let i = 1; i < initialCardNumber; ++i) {
            let newCard = new Card();
            newCard.name = 'Card 2-' + String(i + 1);
            newCard.order = 1 + Math.floor(Math.random() * 1000);
            newCard.category = categories[1];
            cards.push(newCard);
        }
        await connection.manager.save(cards);
    });

    // Close the database connection after running all the tests whether they succeed or failed.
    after(() => connection.close());

    beforeEach(() => {
        controller = createController(CardsController);
    });

    /**
     * POST /cards
     */
    describe('has a "createCard" method that', () => {

        it('should handle requests at POST /cards', () => {
            strictEqual(getHttpMethod(CardsController, 'createCard'), 'POST');
            strictEqual(getPath(CardsController, 'createCard'), '/');
        });

        it('should create a new card with a valid input', async () => {
            let ctx = new Context({
                body: {
                    categoryId: categories[2].id,
                    name: "New Card",
                    description: "Lot of things going on"
                }
            });

            const response = await controller.createCard(ctx);
            ok(isHttpResponseCreated(response), 'response should be an instance of HttpResponseCreated.');

            var body = response.body;

            ok(body instanceof Object, 'The body of the response should be an object');
            ok(body.name == "New Card", 'The name of the created category should be "Card1"');
            ok(body.description == "Lot of things going on", 'The description of the card should be "Lot of things going on"');
            ok(body.order == 999999, 'The default category order index should be 999999');

            // Now we double check that the relation between the card and its category is properly setup
            var category = await Category.findOneOrFail(
                { id: categories[2].id },
                { relations: ['cards'] },
            );

            ok(category.cards[0].id === body.id, 'The relation between the card and its category should be valid');
        });

        it('should fail with a missing categoryId', async () => {
            let ctx = new Context({
                body: {
                }
            });

            const response = await controller.createCard(ctx);
            ok(isHttpResponseBadRequest(response), 'response should be an instance of HttpResponseBadRequest.');
        });

        it('should fail with missing input', async () => {
            let ctx = new Context({
                body: {
                    categoryId: categories[0].id,
                }
            });

            const response = await controller.createCard(ctx);
            ok(isHttpResponseInternalServerError(response), 'response should be an instance of HttpResponseInternalServerError.');
        });
    });

    /**
     * PUT /cards/:cardId
     */
    describe('has a "updateCard" method that', () => {

        it('should handle requests at PUT /cards/:cardId', () => {
            strictEqual(getHttpMethod(CardsController, 'updateCard'), 'PUT');
            strictEqual(getPath(CardsController, 'updateCard'), '/:cardId');
        });

        it('should allow a card details to be updated', async () => {
            var cardToUpdate = (await Card.find())[0]; // We don't check here but there should be some categories already

            let ctx = new Context({
                body: {
                    name: "Card1 - Renamed",
                    description: "Lot of things going on - Updated"
                }
            });

            const response = await controller.updateCard(ctx, { cardId: cardToUpdate.id });
            ok(isHttpResponseOK(response), 'response should be an instance of isHttpResponseOK');

            // Verify
            let updatedCard = await Card.findOneOrFail({ id: cardToUpdate.id });
            ok(updatedCard.name === 'Card1 - Renamed', 'The card name should have been updated properly');
            ok(updatedCard.description === 'Lot of things going on - Updated', 'The card description should have been updated properly');
        });
    });

    /**
     * PUT /cards/reorder/:cardId
     */
    describe('has a "reorderCard" method that', () => {

        it('should handle requests at PUT /cards/reorder/:cardId', () => {
            strictEqual(getHttpMethod(CardsController, 'reorderCard'), 'PUT');
            strictEqual(getPath(CardsController, 'reorderCard'), '/reorder/:cardId');
        });

        it('should allow a card to be reordered', async () => {
            var cards = await Card.find({ where: { category: categories[0] } });
            const lastCard = cards[cards.length - 1]; // Get last card, we will re-order it to index 1

            let ctx = new Context({
                body: {
                    order: 1,
                }
            });

            const response = await controller.reorderCard(ctx, { cardId: lastCard.id });
            ok(isHttpResponseOK(response), 'response should be an instance of isHttpResponseOK');

            // Verify that elements were properly re-orderer
            cards = await Card.find({
                where: { category: categories[0] },
                order: { order: 'ASC' }
            });
            ok(cards[0].id === lastCard.id, 'the card has not been moved properly.');
            for (let i = 0; i < cards.length; ++i) {
                ok(cards[i].order === i + 1, 'cards order index should be set properly.');
            }
        });

    });

    /**
     * PUT /cards/:cardId
     */
    describe('has a "categorizeCard" method that', () => {

        it('should handle requests at PUT /cards/categorize/:cardId', () => {
            strictEqual(getHttpMethod(CardsController, 'categorizeCard'), 'PUT');
            strictEqual(getPath(CardsController, 'categorizeCard'), '/categorize/:cardId');
        });

        it('should allow a card category to be changed', async () => {
            var cards = await Card.find({ where: { category: categories[0] } });
            const cardToUpdate = cards[cards.length - 1]; // Get last card, we will move it to category 2 and re-order it to index 1

            let ctx = new Context({
                body: {
                    categoryId:  categories[1].id,
                    order: 1,
                }
            });

            const response = await controller.categorizeCard(ctx, { cardId: cardToUpdate.id });
            ok(isHttpResponseOK(response), 'response should be an instance of isHttpResponseOK');

            // Verify that elements were properly re-orderer
            cards = await Card.find({
                where: { category: categories[1] },
                order: { order: 'ASC' },
                relations: ['category'],
            });
            ok(cards[0].category.id === categories[1].id, 'the card category has not been updated properly.');
            ok(cards[0].id === cardToUpdate.id, 'the card has not been moved properly.');
            for (let i = 0; i < cards.length; ++i) {
                ok(cards[i].order === i + 1, 'cards order index should be set properly.');
            }
        });

    });

});