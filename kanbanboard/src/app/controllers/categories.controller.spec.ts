// std
// The `assert` module provides a simple set of assertion tests.
import { ok, strictEqual } from 'assert';

// 3p
import { Context, createController, getHttpMethod, getPath, isHttpResponseBadRequest, isHttpResponseCreated, isHttpResponseOK } from '@foal/core';
import { Connection, createConnection } from 'typeorm';

// App
import { Category } from '../entities';
import { CategoriesController } from './categories.controller';

// Define a group of tests.
describe('CategoriesController', () => {

    let controller: CategoriesController;
    let connection: Connection;

    // Create a connection to the database before running all the tests.
    before(async () => {
        // The connection uses the configuration defined in the file config/test.json.
        // By default, the file has three connection options:
        //  "database": "./test_db.sqlite3" -> Use a different database for running the tests.
        // "synchronize": true ->  Auto create the database schema when the connection is established.
        // "dropSchema": true -> Drop the schema when the connection is established (empty the database).
        connection = await createConnection();
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
            strictEqual(getPath(CategoriesController, 'getCategory'), '/:categoryId');
        });

        /******************/
        it('should return an HttpResponseOK', async () => {
            const category1 = new Category();
            category1.name = 'Category 1';
            category1.order = 1;

            const category2 = new Category();
            category2.name = 'Category 2';
            category2.order = 2;

            await connection.manager.save([category1, category2]);

            const response = await controller.getCategories();
            ok(isHttpResponseOK(response), 'response should be an instance of HttpResponseOK.');

            const body = response.body;

            ok(Array.isArray(body), 'The body of the response should be an array.');
            ok(body.length == 2, 'The body of the response should be an array of size 2.');

            strictEqual(body[0].name, 'Category 1');
            strictEqual(body[0].order, 1);
            strictEqual(body[1].name, 'Category 2');
            strictEqual(body[1].order, 2);
        });
    });

    /**
     * GET /categories/:categoryId
     */
    describe('has a "getCategory" method that', () => {

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
        it('should return an empty HttpResponseOK with a invalid category id', async () => {
            const response = await controller.getCategory(new Context({}), { categoryId: 424242424242424 });
            ok(isHttpResponseBadRequest(response), 'response should be an instance of isHttpResponseBadRequest.');
            ok(response.body, 'This category id does not exists');
        });
    });

    /**
     * DELETE /categories
     */
    describe('has a "deleteCategory" method that', () => {

        /******************/
        it('should handle requests at DELETE /categories', () => {
            strictEqual(getHttpMethod(CategoriesController, 'deleteCategory'), 'DELETE');
            strictEqual(getPath(CategoriesController, 'deleteCategory'), '/:categoryId');
        });

        /******************/
        it('should properly handle an invalid id', async () => {
            const response = await controller.deleteCategory(new Context({}), { categoryId: -1 });
            ok(isHttpResponseBadRequest(response), 'response should be an instance of isHttpResponseBadRequest.');
            ok(response.body, 'Nothing to delete');
        });

        /******************/
        it('should return a HttpResponseOK and properly delete a category id', async () => {
            // Execute
            const response = await controller.deleteCategory(new Context({}), { categoryId: 1 });
            ok(isHttpResponseOK(response), 'response should be an instance of HttpResponseOK.');

            // Verify that the element was properly deleted
            const responseGet = await controller.getCategory(new Context({}), { categoryId: 1 });
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
        it('should create a new category with a invalid input', async () => {
            const ctx = new Context({
                body: {
                    name: "New category"
                }
            });
            const response = await controller.createCategory(ctx);
            ok(isHttpResponseCreated(response), 'response should be an instance of isHttpResponseCreated.');

            var body = response.body;

            ok(body instanceof Object, 'The body of the response should be an object');
            ok(body.name == "New category", 'The name of the create category should be "New category"');

            // Verify that the element was properly created
            const responseGet = await controller.getCategory(new Context({}), { categoryId: body.id });
            ok(isHttpResponseOK(responseGet), 'Category should be properly created');
        });

    });

    /**
     * PUT /categories
     */
     describe('has a "updateCategory" method that', () => {

        /******************/
        it('should handle requests at PUT /categories', () => {
            strictEqual(getHttpMethod(CategoriesController, 'updateCategory'), 'PUT');
            strictEqual(getPath(CategoriesController, 'updateCategory'), '/');
        });

        /******************/
        it('should update a category with a valid input', async () => {
            var categories = await (await controller.getCategories()).body; // We don't check here but there should be some categories already
            const categoryToUpdate = categories[0];

            const ctx = new Context({
                body: {
                    id: categoryToUpdate.id,
                    name: "Updated category name"
                }
            });

            const response = await controller.updateCategory(ctx);
            ok(isHttpResponseOK(response), 'response should be an instance of isHttpResponseOK.');

            // Verify that the element was properly created
            const updatedCategory = await (await controller.getCategory(new Context({}), { categoryId: categoryToUpdate.id })).body[0];
            ok(updatedCategory.name === "Updated category name", "The category name should be properly updated");
        });

    });

});