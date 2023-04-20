
import { useEffect, useState } from "react";
import { useGetUserQuery } from "../../features/users/usersApi";
import isValidEmail from "../../utils/isValidEmail";
import Error from '../ui/Error'
import { useDispatch, useSelector } from "react-redux";
import { conversationsApi, useAddConversationMutation, useEditConversationMutation } from "../../features/conversations/conversationsApi";







export default function Modal({ open, control }) {
    const [error, setError] = useState('')

    const { user: loggedInUser } = useSelector((state) => state.auth) || {}
    const { email: loggedInUserEmail } = loggedInUser

    const [to, setTo] = useState('')
    const [message, setMessage] = useState('')
    const [userCheck, setUserCheck] = useState(false)
    const { data: participant } = useGetUserQuery(to, {
        skip: !userCheck
    })
    const dispatch = useDispatch()
    const [conversation, setConversation] = useState(undefined)
    const [editConversation, { isSuccess: isEditConversationSuccess }] = useEditConversationMutation()
    const [addConversation, { isSuccess: isEditAddsationSuccess }] = useAddConversationMutation()




    useEffect(() => {
        if (participant?.length > 0 && participant[0]?.length !== loggedInUserEmail) {
            // check conversation exist 
            dispatch(conversationsApi.endpoints.getConversation.initiate({
                userEmail: loggedInUserEmail,
                participantEmail: to
            })).unwrap()
                .then(res => {
                    setConversation(res)
                    // console.log("conversation", conversation)

                })
                .catch(err => {
                    setError('There was a problem')
                })

        }

    }, [participant, loggedInUserEmail, dispatch, to, conversation])








    const debounceHandler = (fn, delay) => {
        let timeOutId
        return (value) => {
            clearTimeout(timeOutId)
            timeOutId = setTimeout(() => {
                fn(value)

            }, delay)

        }

    }
    const doSearch = (value) => {

        if (isValidEmail(value)) {
            setTo(value)
            setUserCheck(true)
            console.log(value)

        }
        else {
            console.log('inValid')

        }

    }

    const handleSearch = debounceHandler(doSearch, 1000)
    const handleSubmit = (e) => {
        e.preventDefault()




        if (conversation?.length > 0) {

            editConversation({
                id: conversation[0]?.id,
                data: {

                    participants: `${loggedInUserEmail}-${participant[0]?.email}`,
                    users: [
                        participant[0],
                        loggedInUser


                    ],
                    message,
                    timestamp: new Date().getTime()

                }

            })



        }
        else {
            // add conversation 
            console.log('addconversation')
            addConversation({

                participants: `${loggedInUserEmail}-${participant[0]?.email}`,
                users: [
                    participant[0],
                    loggedInUser


                ],
                message,
                timestamp: new Date().getTime()

            })

        }

        console.log('form submitted')

    }


    return (
        open && (
            <>
                <div
                    onClick={control}
                    className="fixed w-full h-full inset-0 z-10 bg-black/50 cursor-pointer"
                ></div>
                <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Send message
                    </h2>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit} >

                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="to" className="sr-only">
                                    To
                                </label>
                                <input
                                    id="to"
                                    name="to"
                                    type="email"
                                    onChange={(e) => handleSearch(e.target.value)}
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                                    placeholder="Send to"
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="sr-only">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                                    placeholder="Message"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                disabled={conversation === undefined || participant[0]?.length === loggedInUserEmail}
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                            >
                                Send Message
                            </button>
                        </div>


                        {
                            participant?.length === 0 && <Error message='This user does not exists !' />
                        }
                        {
                            (participant?.length > 0 && participant[0]?.email === loggedInUserEmail) && <Error message='You cannot send message to yourself !' />
                        }



                    </form>
                </div>
            </>
        )
    );
}
