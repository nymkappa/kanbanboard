// std
// The `assert` module provides a simple set of assertion tests.
import { ok, strictEqual } from 'assert';

// 3p
import { Context, createController, getHttpMethod, getPath, isHttpResponseBadRequest, isHttpResponseCreated, isHttpResponseInternalServerError, isHttpResponseOK } from '@foal/core';
import { Connection, createConnection } from 'typeorm';

// App
import { Card, Category } from '../entities';
import { CategoriesController } from './categories.controller';

// Define a group of tests.
describe('CategoriesController', () => {

    let controller: CategoriesController;
    let connection: Connection;
    let initialCategoryNumber: number = 5;
    let initialCardNumber: number = 5;

    // Create a connection to the database before running all the tests.
    before(async () => {
        connection = await createConnection();

        // Create some test categories
        let categories: Category[] = [];

        let fistCategory = new Category();
        fistCategory.name = 'Category 1';
        fistCategory.order = 1;
        categories.push(fistCategory);

        for (let i = 1; i < initialCategoryNumber; ++i) {
            let newCategory = new Category();
            newCategory.name = 'Category ' + String(i + 1);
            newCategory.order = 1 + Math.floor(Math.random() * 1000);
            categories.push(newCategory);
        }
        await connection.manager.save(categories);

        // Create some test cards
        let cards: Card[] = [];
        for (let i = 1; i < initialCardNumber; ++i) {
            let newCard = new Card();
            newCard.name = 'Card 1-' + String(i + 1);
            newCard.order = 1 + Math.floor(Math.random() * 1000);
            newCard.category = categories[0];
            cards.push(newCard);
        }
    });

    // Close the database connection after running all the tests whether they succeed or failed.
    after(() => connection.close());

    // Create or re-create the controller before each test.
    beforeEach(() => controller = createController(CategoriesController));

    /**
     * GET /categories
     */
    describe('has a "getCategories" method that', () => {

        /******************/
        it('should handle requests at GET /categories', () => {
            strictEqual(getHttpMethod(CategoriesController, 'getCategories'), 'GET');
            strictEqual(getPath(CategoriesController, 'getCategories'), '/');
        });

        /******************/
        it('should return an HttpResponseOK', async () => {
            const response = await controller.getCategories();
            ok(isHttpResponseOK(response), 'response should be an instance of HttpResponseOK.');

            const body = response.body;

            ok(Array.isArray(body), 'The body of the response should be an array.');
            ok(body.length == initialCategoryNumber, 'The body of the response should be an array of size ' + String(initialCategoryNumber) + '.');

            strictEqual(body[0].name, 'Category 1');
            strictEqual(body[0].order, 1);
        });
    });

    /**
     * GET /categories/:categoryId
     */
    describe('has a "getCategory" method that', () => {

        /******************/
        it('should handle requests at GET /categories/:categoryId', () => {
            strictEqual(getHttpMethod(CategoriesController, 'getCategory'), 'GET');
            strictEqual(getPath(CategoriesController, 'getCategory'), '/:categoryId');
        });

        /******************/
        it('should return an HttpResponseOK with a valid category id', async () => {
            const response = await controller.getCategory(new Context({}), { categoryId: 1 });

            ok(isHttpResponseOK(response), 'response should be an instance of HttpResponseOK.');

            const body = response.body;

            ok(Array.isArray(body), 'The body of the response should be an array');
            ok(body.length == 1, 'The body of the response should be an array of size 1.');

            strictEqual(body[0].name, 'Category 1');
            strictEqual(body[0].order, 1);
        });

        /******************/
        it('should return an empty HttpResponseOK with an invalid category id', async () => {
            const response = await controller.getCategory(new Context({}), { categoryId: 424242424242424 });
            ok(isHttpResponseBadRequest(response), 'response should be an instance of HttpResponseBadRequest.');
            ok(response.body, 'This category id does not exists');
        });
    });

    /**
     * DELETE /categories
     */
    describe('has a "deleteCategory" method that', () => {

        /******************/
        it('should handle requests at DELETE /categories/:categoryId', () => {
            strictEqual(getHttpMethod(CategoriesController, 'deleteCategory'), 'DELETE');
            strictEqual(getPath(CategoriesController, 'deleteCategory'), '/:categoryId');
        });

        /******************/
        it('should properly handle an invalid id', async () => {
            const response = await controller.deleteCategory(new Context({}), { categoryId: -1 });
            ok(isHttpResponseBadRequest(response), 'response should be an instance of HttpResponseBadRequest.');
            ok(response.body, 'Nothing to delete');
        });

        /******************/
        // Terra: User can delete column
        it('should return a HttpResponseOK and properly delete a category id', async () => {
            var categoryToDelete = (await Category.find())[0]; // We don't check here but there should be some categories already

            const response = await controller.deleteCategory(new Context({}), { categoryId: categoryToDelete.id });
            ok(isHttpResponseOK(response), 'response should be an instance of HttpResponseOK.');

            // Verify that the element was properly deleted
            const responseGet = await controller.getCategory(new Context({}), { categoryId: categoryToDelete.id });
            ok(isHttpResponseBadRequest(responseGet), 'Category should be properly deleted');
        });

    });

    /**
     * POST /categories
     */
    describe('has a "createCategory" method that', () => {

        /******************/
        it('should handle requests at POST /categories', () => {
            strictEqual(getHttpMethod(CategoriesController, 'createCategory'), 'POST');
            strictEqual(getPath(CategoriesController, 'createCategory'), '/');
        });

        /******************/
        // Terra: User can add column with name
        it('should create a new category with a valid input', async () => {
            const ctx = new Context({
                body: {
                    name: "New category"
                }
            });
            const response = await controller.createCategory(ctx);
            ok(isHttpResponseCreated(response), 'response should be an instance of HttpResponseCreated.');

            var body = response.body;

            ok(body instanceof Object, 'The body of the response should be an object');
            ok(body.name == "New category", 'The name of the create category should be "New category"');
            ok(body.order == 999999, 'The default category order index should be 999999');

            // Verify that the element was properly created
            const responseGet = await controller.getCategory(new Context({}), { categoryId: body.id });
            ok(isHttpResponseOK(responseGet), 'Category should be properly created');
        });

        /******************/
        it('should fail to create a new category with an invalid input', async () => {
            const ctx = new Context({
                body: {
                    // Missing "name" input
                }
            });
            const response = await controller.createCategory(ctx);
            ok(isHttpResponseInternalServerError(response), 'response should be an instance of HttpResponseInternalServerError.');
        });

    });

    /**
     * PUT /categories
     */
    describe('has a "updateCategory" method that', () => {

        /******************/
        it('should handle requests at PUT /categories/:categoryId', () => {
            strictEqual(getHttpMethod(CategoriesController, 'updateCategory'), 'PUT');
            strictEqual(getPath(CategoriesController, 'updateCategory'), '/:categoryId');
        });

        /******************/
        // Terra: User can modify column name
        it('should update a category with a valid input', async () => {
            var categoryToUpdate = (await Category.find())[0]; // We don't check here but there should be some categories already

            const ctx = new Context({
                body: {
                    name: "Updated category name"
                }
            });

            const response = await controller.updateCategory(ctx, { categoryId: categoryToUpdate.id });
            ok(isHttpResponseOK(response), 'response should be an instance of HttpResponseOK.');

            // Verify that the element was properly created
            const updatedCategory = await (await controller.getCategory(new Context({}), { categoryId: categoryToUpdate.id })).body[0];
            ok(updatedCategory.name === "Updated category name", "The category name should be properly updated");
        });

        /******************/
        it('should fail to update a category with an invalid category id', async () => {
            const ctx = new Context({
                body: {
                    name: "Does not matter"
                }
            });

            const response = await controller.updateCategory(ctx, { categoryId: -1 });
            ok(isHttpResponseBadRequest(response), 'response should be an instance of HttpResponseBadRequest.');
        });

        /******************/
        it('should fail to update a category with a missing category name', async () => {
            var categoryToUpdate = (await Category.find())[0]; // We don't check here but there should be some categories already

            const ctx = new Context({
                body: {
                    // Missing "name" input
                }
            });
            const response = await controller.updateCategory(ctx, { categoryId: categoryToUpdate.id });
            ok(isHttpResponseInternalServerError(response), 'response should be an instance of HttpResponseInternalServerError.');
        });

    });

    /**
     * PUT /categories/reorder
     */
    describe('has a "reorderCategory" method that', () => {

        /******************/
        it('should handle requests at PUT /catgories/reorder/:categoryId', () => {
            strictEqual(getHttpMethod(CategoriesController, 'reorderCategory'), 'PUT');
            strictEqual(getPath(CategoriesController, 'reorderCategory'), '/reorder/:categoryId');
        });

        /******************/
        // Terra: User can change column ordering
        it('should allow re-ordering a category', async () => {
            var categories = await Category.find();
            const lastCategory = categories[categories.length - 1]; // Get last category, we will re-order it to index 1

            const ctx = new Context({
                body: {
                    order: 1,
                }
            });

            const response = await controller.reorderCategory(ctx, { categoryId: lastCategory.id });
            ok(isHttpResponseOK(response), 'response should be an instance of HttpResponseOK.');

            // Verify that elements were properly re-orderer
            categories = await Category.find({ order: { order: 'ASC' } });
            ok(categories[0].id === lastCategory.id, 'the category has not been moved properly.');
            for (let i = 0; i < categories.length; ++i) {
                ok(categories[i].order === i + 1, 'categories order index should be set properly.');
            }
        });

        /******************/
        it('should fail to re-order a category with an invalid category id', async () => {
            const ctx = new Context({
                body: {
                    name: "Does not matter"
                }
            });

            const response = await controller.reorderCategory(ctx, { categoryId: -1 });
            ok(isHttpResponseBadRequest(response), 'response should be an instance of HttpResponseBadRequest.');
        });

        /******************/
        it('should fail to update a category with a missing order index', async () => {
            const categoryToUpdate = (await Category.find())[0];

            const ctx = new Context({
                body: {
                    // Missing "order" input
                }
            });
            const response = await controller.reorderCategory(ctx, { categoryId: categoryToUpdate.id });
            ok(isHttpResponseBadRequest(response), 'response should be an instance of HttpResponseBadRequest.');
        });

    });
});
