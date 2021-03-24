import {
    Context, Delete, Get, HttpResponseCreated, HttpResponseNoContent,
    HttpResponseNotFound, HttpResponseOK, Post
} from '@foal/core';

import { Card } from '../entities';

export class ApiController {

    @Get('/todos')
    async getTodos() {
        const cards = await Card.find();
        return new HttpResponseOK(cards);
    }

}