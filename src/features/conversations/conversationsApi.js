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
        }),

        addConversation: builder.mutation({
            query: ({ sender, data }) => ({
                url: '/conversations',
                method: 'POST',
                body: data

            }),

            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {

                    const { data } = await queryFulfilled
                    console.log('data', data)
                    console.log('arg', arg)

                    if (data?.id) {
                        // silent entry to the message table 

                        const { data } = await queryFulfilled
                        // console.log('data', data)
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


                        dispatch(messagesApi.endpoints.addMessage.initiate({


                        },))




                    }




                }
                catch (err) {
                    console.log(err.message)

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
                try {

                    const { data } = await queryFulfilled
                    // console.log('data', data)
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
                catch (err) {
                    console.log(err.message)

                }


            }



        })



    }),
});

export const { useGetConversationsQuery,
    useGetConversationQuery,
    useAddConversationMutation,
    useEditConversationMutation } = conversationsApi;
