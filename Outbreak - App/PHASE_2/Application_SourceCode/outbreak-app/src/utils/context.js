import React, {useState, createContext} from 'react';

export const UserInputContext = createContext(null)

export default function UserContext() {
    const [userInput, setUserInput] = useState({})

    return {userInput, setUserInput}
}
