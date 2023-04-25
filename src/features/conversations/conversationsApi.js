import { io } from "socket.io-client";
import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";

// "participants": "sumit@learnwithsumit.com-akash@learnwithsumit.com",

export const conversationsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query({
            query: (email) =>
                `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,
        }),




        getConversation: builder.query({
            query: ({ userEmail, participantEmail }) =>
                `/conversations?participants_like=${userEmail}-${participantEmail}&&participants_like=${participantEmail}-${userEmail}`,

            async onCacheEntryAdded(
                arg,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
            ) {
                // create socket
                const socket = io("http://localhost:9000", {
                    reconnectionDelay: 1000,
                    reconnection: true,
                    reconnectionAttemps: 10,
                    transports: ["websocket"],
                    agent: false,
                    upgrade: false,
                    rejectUnauthorized: false,
                });

                try {
                    await cacheDataLoaded;
                    socket.on("conversation", (data) => {
                        updateCachedData((draft) => {

                            console.log('dfina', draft)
                            const conversation = draft.find(
                                (c) => c.id == data?.data?.id
                            );

                            if (conversation?.id) {
                                console.log('I am at conversation')
                                console.log('conversation', conversation)
                                conversation.message = data?.data?.message;
                                conversation.timestamp = data?.data?.timestamp;
                            } else {
                                draft.push(data?.data)
                            }
                        });
                    });
                } catch (err) { }

                await cacheEntryRemoved;
                socket.close();
            },


        }),

        addConversation: builder.mutation({
            query: ({ sender, data }) => ({
                url: '/conversations',
                method: 'POST',
                body: data

            }),

            async onQueryStarted(arg, { dispatch, queryFulfilled }) {


                const patchResult2 = dispatch(apiSlice.util.updateQueryData('getConversations',
                    arg.sender, (draft) => {
                        // console.log('draft11', draft)
                        draft.push(arg.data)


                    }))

                try {

                    const { data } = await queryFulfilled
                    // console.log('data', data)
                    // console.log('arg', arg)

                    if (data?.id) {
                        // silent entry to the message table 

                        const { data } = await queryFulfilled
                        console.log('dataF', data)
                        // console.log('argg', arg)
                        if (data?.id) {
                            // silent entry to the message table 
                            const { timestamp, message, users } = data
                            const sender = users.find(user => user.email === arg.sender)
                            const receiver = users.find(user => user.email !== arg.sender)
                            dispatch(messagesApi.endpoints.addMessage.initiate({

                                conversationId: data?.id,
                                sender,
                                receiver,
                                message,
                                timestamp
                            }))

                        }

                    }




                }
                catch (err) {
                    console.log(err.message)
                    patchResult2.undo()

                }


            }





        }),

        editConversation: builder.mutation({
            query: ({ id, sender, data }) => ({
                url: `/conversations/${id}`,
                method: 'PATCH',
                body: data

            }),

            async onQueryStarted(arg, { dispatch, queryFulfilled }) {

                // client side  optimistic cashe  update start

                const patchResult1 = dispatch(apiSlice.util.updateQueryData('getConversations',
                    arg.sender, (draft) => {
                        const draftConversation = draft.find(c => c?.id == arg?.id)

                        draftConversation.message = arg.data.message
                        draftConversation.timestamp = arg.data.timestamp
                        console.log("draft", draftConversation)



                    }))


                // client side  optimistic cashe  update end
                try {

                    const { data } = await queryFulfilled
                    // console.log('data', data)
                    // console.log('argg', arg)
                    if (data?.id) {
                        // silent entry to the message table 
                        const { timestamp, message, users } = data
                        const sender = users.find(user => user.email === arg.sender)
                        const receiver = users.find(user => user.email !== arg.sender)



                        const res = await dispatch(messagesApi.endpoints.addMessage.initiate({

                            conversationId: data?.id,
                            sender,
                            receiver,
                            message,
                            timestamp
                        })).unwrap()



                        dispatch(apiSlice.util.updateQueryData('getMessages', res.conversationId.toString(),
                            (draft) => {
                                draft.push(res)

                            }))

                        // update messages cache pessimistically  start 

                    }




                }
                catch (err) {
                    console.log(err.message)
                    patchResult1.undo()

                }


            }



        })



    }),
});

export const { useGetConversationsQuery,
    useGetConversationQuery,
    useAddConversationMutation,
    useEditConversationMutation } = conversationsApi;
