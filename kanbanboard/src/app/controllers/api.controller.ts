import { controller } from '@foal/core';
import { CategoriesController } from './categories.controller';

export class ApiController {
    subControllers = [
        controller('/categories', CategoriesController),
    ];
}