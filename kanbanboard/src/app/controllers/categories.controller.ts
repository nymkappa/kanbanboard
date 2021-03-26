import { HttpResponseBadRequest, ValidatePathParam } from '@foal/core';
import { Context, Delete, Get, HttpResponseOK } from '@foal/core';
import { Category } from '../entities/category.entity';

export class CategoriesController {

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