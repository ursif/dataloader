# @usrif/dataloader

[![codecov](https://codecov.io/gh/ursif/dataloader/branch/master/graph/badge.svg)](https://codecov.io/gh/ursif/dataloader)

[![CircleCI](https://circleci.com/gh/ursif/dataloader.svg?style=svg)](https://circleci.com/gh/ursif/dataloader)

## Usage

```js
import dataloader from '@ursif/dataloader'
/**
 * Simple Query
 */
const personConfig = {
    // given a query, return the resource
    resolve: query => Promise.resolve({
        _id: 1
    })
}

const personLoader = dataloader(personConfig)

personLoader.get(1)
    .then(console.log) // { _id: 1 }


/**
 * Nested Resolvers
 */
const commentConfig = {
    resolve: () => ({ message: 'comment' })
}

const commentLoader = dataloader(commentConfig)

const postConfig = {
    resolve: async (id) => {
        const post = await Promise.resolve({ comments: [1] })
        const comments = await Promise.all(post.comments.map(commentLoader.get))

        return ({
            ...post,
            comments
        })
    }
}

const postLoader = dataloader(postConfig)

postLoader.get(1)
    .then(console.log) // { comments: [{ message: 'comment' }] }
```