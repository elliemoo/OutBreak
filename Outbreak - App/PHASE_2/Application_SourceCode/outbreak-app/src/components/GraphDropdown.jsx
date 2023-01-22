import React, { useState, useEffect, useContext } from 'react';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import {Redirect} from "react-router-dom";
import {UserInputContext} from '../utils/context'

const debug = false;

export default function GraphDropdown(props) {
    const input = useContext(UserInputContext)
    const {userInput, setUserInput} = input
    const [disease, setDisease] = useState('Select')
    const [complete, setComplete] = useState(false)

    //GET DISEASE LIST FOR DROPDOWN:
    //console.log(props.diseases)
    let diseases = [{value: 'All', label: 'All'}];
    for (let index in props.diseases) {
        let disease = props.diseases[index].name;
        diseases.push({value: disease, label: disease})
    }
    if (debug) console.log(diseases);


    const handleDiseaseChange = (event) => {
        setDisease(event.target.value);
    } 

    // const validate = () => {
    //     console.log(disease)
    //     //Handle null disease
    //     if (disease == 'Select'){
    //         alert('Destination Field Is Empty')
    //     } 
    //     else {
    //         const result = {
    //             disease
    //         }
    //         setUserInput(result)
    //         setComplete(true)
    //     }
    // }

    useEffect(() => {
        console.log(userInput)
    },[userInput])

    return (
        <>
            <div style={{display: 'flex', flexDirection: 'column', 'alignItems': 'center', paddingBottom: '2vh'}}>
                <FormControl component="fieldset">
                    <TextField
                        id="selectdisease"
                        select
                        label="Select"
                        value={disease}
                        onChange={handleDiseaseChange}
                        helperText="Please select disease filter"
                    >
                        {diseases.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                            {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button variant="contained" color="primary" onClick={(event)=>props.onDropdownChange(event, disease)}>
                        Show Locations for Disease
                    </Button>
                </FormControl>
                {/* {complete && <Redirect to={`/${disease}`} /> } */}
            </div>
        </>
    );

}