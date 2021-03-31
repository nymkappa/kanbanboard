# Kanbanboard

Typescript implementation of a Kanban baord using FoalTS for the backend and VueJS for the front-end

# How to run the backend

1. `cd kanbanboard`
2. `docker build --tag kanbanboard .`
3. `docker run --publish 3001:3001 kanbanboard`

Verify that the server is running at http://localhost:3001/api/categories/

# How to tests for the backend

1. `cd kanbanboard`
2. `npm run test`

