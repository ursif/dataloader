const dataloader = require('./')

describe('@ursif/dataloader', () => {
    it('is a function', () => {
        expect(typeof dataloader).toBe('function')
    })

    it('returns an object with get', () => {
        expect(dataloader().get).toBeDefined()
    })

    it('loads a resource by id', async () => {
        const person = {}

        const config = {
            resolve: () => person
        }

        const personLoader = dataloader(config)
        const person1 = await personLoader.get(1)
        expect(person1).toBe(person)
    })

    it('loads a resource from the cache', async () => {
        const person = {}
        let count = 0
        const config = {
            resolve: () => {
                expect(count++).toBe(0)
                return person
            }
        }

        const personLoader = dataloader(config)
        const p1 = await personLoader.get(1)
        const p2 = await personLoader.get(1)

        expect(p1).toBe(p2)
    })

    it('loads a resource from cache in parallel', async () => {
        const person = {}
        let count = 0
        const config = {
            resolve: () => {
                expect(count++).toBe(0)
                return person
            }
        }

        const personLoader = dataloader(config)
        const [p1, p2] = await Promise.all([
            personLoader.get(1),
            personLoader.get(1)
        ])

        expect(p1).toBe(p2)
    })

    it('loads nested resoruces', async () => {
        const person = {
            name: 'tim',
            id: 1,
            posts: [1]
        }

        const post = {
            id: 1
        }

        const postsConfig = {
            resolve: () => post
        }

        const postLoader = dataloader(postsConfig)

        const personConfig = {
            resolve: async (id) => {
                const posts = await Promise.all(person.posts.map(postLoader.get))

                return ({
                    ...person,
                    posts
                })
            }
        }
        
        const personLoader = dataloader(personConfig)
        const p1 = await personLoader.get(1)
        expect(p1).toEqual({
            name: 'tim',
            id: 1,
            posts: [post]
        })
    })

    it('works with string as query', async () => {
        const data = {}
        const query = '/123?abc=true'
        const config = {
            // pretend HTTP query
            resolve: async query => Promise.resolve(data)
        }

        const personLoader = dataloader(config)
        const [p1, p2] = await Promise.all([
            personLoader.get(query),
            personLoader.get(query)
        ])

        expect(p1).toBe(p2)
    })

    it('works with object as query', async () => {
        const data = {}
        const query = {}
        let count = 0
        const config = {
            // pretend HTTP query
            resolve: query => {
                expect(count++).toBe(0)
                return data
            }
        }

        const personLoader = dataloader(config)
        const [p1, p2] = await Promise.all([
            personLoader.get(query),
            personLoader.get(query)
        ])

        expect(p1).toBe(p2)
    })

    it('works with the examples on the readme', async () => {
        const personConfig = {
            // given a query, return the resource
            resolve: query => Promise.resolve({
                _id: 1
            })
        }
        
        const personLoader = dataloader(personConfig)
        const person = await personLoader.get(1)

        expect(person).toEqual({ _id: 1 })
        
        
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
        const post = await postLoader.get(1)

        expect(post).toEqual({
            comments: [
                { message: 'comment' }
            ]
        })
    })

    it('allows you to drop keys from the cache', async () => {
        const person = {}
        let count = 0
        let hasSeen = false

        const config = {
            resolve: () => {
                if (hasSeen) {
                    expect(count).toBe(1)
                } else {
                    hasSeen = true
                    expect(count++).toBe(0)
                }

                return person
            }
        }

        const personLoader = dataloader(config)
        const p1 = await personLoader.get(1)
        await personLoader.drop(1)
        const p2 = await personLoader.get(2)

        expect(p1).toBe(p2)
    })
})