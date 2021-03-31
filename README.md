# Kanbanboard

Typescript implementation of a Kanban baord using FoalTS.

# How to run the backend

1. `npm install`
2. `npm run build`
2. `npm run migrations`
3. `docker build --tag kanbanboard .`
3. `docker volume create db.sqlite3`
4. `docker run --publish 3001:3001 -v db.sqlite3:/app kanbanboard`

Verify that the server is running at http://localhost:3001/api/categories/

# How to tests for the backend

1. `npm run test`

A [Postman collection](https://github.com/jorisvial/kanbanboard/blob/master/Kanbanboard%20Joris.postman_collection.json) is also provided to make testing the API easier.
