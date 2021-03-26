import { HttpResponseBadRequest, HttpResponseCreated, Post, Put, ValidateBody, ValidatePathParam } from '@foal/core';
import { Context, Delete, Get, HttpResponseOK } from '@foal/core';
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
        category.name = ctx.request.body.name;
        category.order = 0;

        let createdCategory = await category.save();

        return new HttpResponseCreated(createdCategory);
    }

    /**
     * Update a category name
     */
    @Put('/')
    @ValidateBody({
        additionalProperties: false,
        properties: {
            id: { type: 'interger' },
            name: { type: 'string' },
        },
        required: ['id', 'name'],
        type: 'object',
    })
    async updateCategory(ctx: Context) {
        let categoryId = ctx.request.body.id;
        let newCategoryName = ctx.request.body.name;

        let category = await Category.findOne({ id: categoryId });
        if (!category) {
            return new HttpResponseBadRequest("This category id does not exists");
        } else {
            category.name = newCategoryName;
            await category.save();
            return new HttpResponseOK();
        }
    }

    /**
   * Get all categories
   */
    @Get('/')
    async getCategories() {
        let categories = await Category.find();
        return new HttpResponseOK(categories);
    }

    /**
    * Get one category
    */
    @Get('/:categoryId')
    @ValidatePathParam('categoryId', { type: 'integer' })
    async getCategory(ctx: Context, { categoryId }) {
        let category = await Category.findOne({ id: categoryId });
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
        let res = await Category.delete({ id: categoryId });
        if (res.affected != 1) {
            return new HttpResponseBadRequest("This category id does not exists");
        } else {
            return new HttpResponseOK();
        }
    }

}