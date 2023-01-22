import React, { useState, useEffect, useContext } from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import DatePicker from 'react-date-picker';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import {Redirect} from "react-router-dom";
import {UserInputContext} from '../utils/context';
import Map from './Map';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';

// template code from:
// https://material-ui.com/components/radio-buttons/
// https://material-ui.com/components/text-fields/
// https://material-ui.com/components/chips/

// react-date-picker from:
// https://github.com/wojtekmaj/react-date-picker#readme

export default function InputForm() {
    const input = useContext(UserInputContext)
    const {userInput, setUserInput} = input
    const [stage, setStage] = useState('pre')
    const [country, setCountry] = useState('Select')
    const now = new Date(Date.now())
    const [startDate, setStartDate] = useState(now)
    const [endDate, setEndDate] = useState(now)
    const [complete, setComplete] = useState(false)
    const [countriesInput, setCountriesInput] = useState([])

    const countries = [
        {
            value: 'Australia',
            label: 'Australia'
        },
        {
            value: 'United States',
            label: 'United States'
        },
        {
            value: 'Canada',
            label: 'Canada'
        },
        {
            value: 'India',
            label: 'India'
        },
        {
            value: 'Thailand',
            label: 'Thailand'
        }
    ]

    

    const handleStageChange = (event) => {
        setStage(event.target.value);
    } 
    const handleCountryChange = (event) => {
        setCountry(event.target.value);
        setCountriesInput((prevState) => [...prevState, event.target.value])
    } 

    const handleCountryDelete = (delCountry) => {
        const newArr = countriesInput.slice()
        const filtered = newArr.filter(country => country !== delCountry)
        setCountriesInput(filtered)
    }

    const validate = () => {
        console.log(startDate)
        //Handle null country
        if (countriesInput.length === 0){
            alert('Destination Field Is Empty')
        } 
        //handle null dates
        else if (startDate == null){
            alert('Start Date Field Is Empty')
        } 
        else if (endDate == null){
            alert('End Date Field Is Empty')
        }
        //Handle Invalid Dates
        else if (endDate < startDate){
            alert('End Date Is Before Start Date')
        } 
        else {
            const result = {
                stage,
                countriesInput,
                country,
                startDate,
                endDate
            }
            setUserInput(result)
            setComplete(true)
        }
    }

    useEffect(() => {
        console.log(userInput)
    },[userInput])

    useEffect(() => {
        console.log(countriesInput)
    }, [countriesInput])
    const [Locations, setLocation] = useState([]);
    const [content, setContent] = useState("");
    return (
        <>
            <div style={{display: 'flex', flexDirection: 'column', 'alignItems': 'center', paddingBottom: '2vh'}}>
                {/* <SimpleMap/> */}

                <Map setTooltipContent={setContent} />
                <h3 style={{marginTop: "0px"}}>Selected country: {content}</h3>
                <Button variant="contained" color="primary" 
                    onClick={(event)=> {
                        // setLocation([...Locations, `${content}`])
                        setCountriesInput((prevState) => {
                            if (!countriesInput.includes(`${content}`)) return [...prevState, `${content}`]
                            else return [...prevState]
                        })
                    }}
                >
                    ADD
                </Button>
                <br />
                {countriesInput && countriesInput.map((country) => {
                    return (<Chip
                    avatar={<Avatar>{country.charAt(0)}</Avatar>}
                    label={country}
                    onDelete={() => handleCountryDelete(country)}
                    variant="outlined"
                    style={{marginBottom: "5px"}}
                />)})
                }
                <br />
                <FormControl component="fieldset">
                    <FormLabel component="legend">What stage of your travel are you currently at?</FormLabel>
                    <RadioGroup aria-label="gender" name="gender1" value={stage} onChange={handleStageChange}>
                        <FormControlLabel value="pre" control={<Radio />} label="Pre-Travel" />
                        <FormControlLabel value="post" control={<Radio />} label="Post-Travel" />
                    </RadioGroup>
                    {stage === 'post' && (
                        <>
                        <Typography variant="subtitle1" gutterBottom>
                            <b>When were you in this country?</b>
                        </Typography>
                        <DatePicker
                        value={startDate}
                        onChange={setStartDate}
                        />
                        <DatePicker
                        value={endDate}
                        onChange={setEndDate}
                        />
                        </>
                    )}
                    <br />
                    <Button variant="contained" color="primary" onClick={validate}>
                        Submit
                    </Button>
                </FormControl>
                {complete && <Redirect to={`/${stage}`} /> }
            </div>
        </>
    );

}