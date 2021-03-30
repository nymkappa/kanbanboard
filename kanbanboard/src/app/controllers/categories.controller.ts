import { HttpResponseBadRequest, HttpResponseCreated, HttpResponseInternalServerError, Post, Put, ValidateBody, ValidatePathParam } from '@foal/core';
import { Context, Delete, Get, HttpResponseOK } from '@foal/core';
import { Equal, getConnection, Not } from 'typeorm';
import { Category } from '../entities/category.entity';

export class CategoriesController {

    /**
     * Create a new category
     */
    @Post('/')
    @ValidateBody({
        additionalProperties: false,
        properties: {
            name: { type: 'string' },
        },
        required: ['name'],
        type: 'object',
    })
    async createCategory(ctx: Context) {
        const category = new Category();
        category.name = ctx.request.body.name ?? null;

        try {
            var createdCategory: Category = await category.save();
            return new HttpResponseCreated(createdCategory);
        } catch (e) {
            return new HttpResponseInternalServerError("Unable to create the new category");
        }
    }

    /**
     * Update a category name
     */
    @Put('/:categoryId')
    @ValidateBody({
        additionalProperties: false,
        properties: {
            name: { type: 'string' },
        },
        required: ['name'],
        type: 'object',
    })
    async updateCategory(ctx: Context, { categoryId }) {
        var newCategoryName = ctx.request.body.name ?? null;

        try {
            var category: Category = await Category.findOneOrFail({ id: categoryId });
        } catch (e) {
            return new HttpResponseBadRequest("This category id does not exists");
        }

        try {
            category.name = newCategoryName;
            await category.save();
            return new HttpResponseOK();
        } catch (e) {
            return new HttpResponseInternalServerError("Unable to update the new category");
        }
    }

    /**
     * Reorder a category
     */
    @Put('/reorder/:categoryId')
    @ValidateBody({
        additionalProperties: false,
        properties: {
            order: { type: 'integer' },
        },
        required: ['order'],
        type: 'object',
    })
    async reorderCategory(ctx: Context, { categoryId }) {
        var newCategoryOrderIndex: number = ctx.request.body.order ?? 0;
        if (!newCategoryOrderIndex || newCategoryOrderIndex < 1) {
            return new HttpResponseBadRequest("Invalid category order index");
        }

        // Find the category matching the id
        try {
            var categoryToUpdate: Category = await Category.findOneOrFail({ id: categoryId });
        } catch (e) {
            return new HttpResponseBadRequest("This category id does not exists");
        }

        // Get all categories and reorder all of them properly
        try {
            // NOTE: Maybe we could avoid this process by having an extra db field "order_updated_at" which would
            // allow us to manage conflicting order index.
            //
            // In the following example, even though categoryA and categoryB have the same order index, we
            // could still sort them properly based on their "order_updated_at" field:
            //
            // categoryC { order: 1, order_updated_at: .......... }
            // categoryB { order: 2, order_updated_at: 1616812153 } <- Category B is shown first before its "order_updated_at" was updated last
            // categoryA { order: 2, order_updated_at: 1516812153 }
            // categoryD { order: 3, order_updated_at: .......... }

            // Get all categories but the one we just updated
            var categories: Category[] = await Category.find({ where: { id: Not(Equal(categoryToUpdate.id)) }, order: { "order": "ASC" } });

            // Insert the category we've updated at the desired position
            categories.splice(newCategoryOrderIndex - 1, 0, categoryToUpdate);

            // Update all order index and save all entities in the db
            categories.forEach((entity, newOrderIndex) => {
                entity.order = newOrderIndex + 1;
            })
            var connection = await getConnection();
            await connection.manager.save(categories);

            return new HttpResponseOK();
        } catch (e) {
            return new HttpResponseInternalServerError("Unable to update the new category");
        }
    }

    /**
     * Get all categories
     */
    @Get('/')
    async getCategories() {
        var categories: Category[] = await Category.find({ order: { order: 'ASC' } });
        return new HttpResponseOK(categories);
    }

    /**
    * Get one category
    */
    @Get('/:categoryId')
    @ValidatePathParam('categoryId', { type: 'integer' })
    async getCategory(ctx: Context, { categoryId }) {
        var category: Category|undefined = await Category.findOne({ id: categoryId });
        if (!category) {
            return new HttpResponseBadRequest("This category id does not exists");
        } else {
            return new HttpResponseOK([category]);
        }
    }

    /**
     * Delete one category
     */
    @Delete('/:categoryId')
    @ValidatePathParam('categoryId', { type: 'integer' })
    async deleteCategory(ctx: Context, { categoryId }) {
        var res = await Category.delete({ id: categoryId });
        if (res.affected != 1) {
            return new HttpResponseBadRequest("This category id does not exists");
        } else {
            return new HttpResponseOK();
        }
    }

}