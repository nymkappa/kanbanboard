import { controller } from '@foal/core';
import { CardsController } from './cards.controller';
import { CategoriesController } from './categories.controller';

export class ApiController {
    subControllers = [
        controller('/categories', CategoriesController),
        controller('/cards', CardsController),
    ];
}