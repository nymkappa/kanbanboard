import {
    Context, Delete, Get, HttpResponseCreated, HttpResponseNoContent,
    HttpResponseNotFound, HttpResponseOK, Post
} from '@foal/core';

import { Category } from '../entities';

export class ApiController {

    @Get('/categories')
    async getCategories() {
        const categories = await Category.find();
        return new HttpResponseOK(categories);
    }

}