import React, { useEffect, useState, useContext } from 'react';
import { UserInputContext } from '../utils/context';
import NavBar from '../components/NavBar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Graph from '../components/Graph';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
// template code from:
// https://material-ui.com/components/tables/
// https://material-ui.com/components/cards/
// https://material-ui.com/components/tabs/

//Added Redirect Capability
import {Redirect} from "react-router-dom";
import GraphDropdown from '../components/GraphDropdown';

import symptomsJson from '../symptoms.json'

const useStyles = makeStyles((theme) => ({
    info: {
      paddingTop: '5vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    table: {
        width: '90%'
    },
    card: {
        width: '80%',
    },
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },
    tabs: {
        width: '80%',
    },
    textContainer: {
        maxWidth: '600px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
  }));

export default function PostPage() {
    const classes = useStyles();
    const input = useContext(UserInputContext)
    const {userInput, setUserInput} = input
    const {startDate, endDate, countriesInput} = userInput
    const [view, setView] = useState(0);

    // Replace United States of America with United States
    countriesInput.forEach((country, i) => {
        if (country === 'United States of America') countriesInput[i] = 'United States'
    })

    console.log('countries input: ', countriesInput)

    const handleViewChange = (event, newValue) => {
        setView(newValue);
    };
    const [diseaseRows, setDiseaseRows] = useState({});
    const [diseaseCount, setDiseaseCount] = useState({})
    const [dropdownDisease, setDropdownDisease] = useState([]);

    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogInfo, setDialogInfo] = useState({})
    const [currentCountry, setCurrentCountry] = useState(countriesInput[0])

    const handleOpenDialog = (row) => {
        setDialogOpen(true)
        setDialogInfo(row)
    }
    const handleCloseDialog = () => setDialogOpen(false)

    // user input will include the stage and country
    // ie. userInput = {
    //     country: eg. Australia, USA, etc
    //     startDate: '04/04/2021'
    //     endDate: '05/04/2021
    // }

    // you should be able to just wrap your api calls into a single useEffect
    // example below - the empty [] in the second parameter of the useEffect means it will only run once when the page first loads

    let request = {}
    let redirect = false;
    request['country'] = ''
    request['startDate'] = ''
    request['endDate'] = ''
    //On Refresh or Reload these are all reset so we redirect to home page
    if (currentCountry == null || startDate == null || endDate == null){
        redirect = (<Redirect to={`/`}></Redirect>)
    } else {

        request['country'] = currentCountry.toLowerCase()
        request['startDate'] = startDate.toISOString().replace('Z', '').split('.')[0]
        request['endDate'] = endDate.toISOString().replace('Z', '').split('.')[0]
    }
    
    const outbreakReportsAPIBaseUrl = 'https://6u977749j2.execute-api.ap-southeast-2.amazonaws.com/staging/reports/'
    
    
    const getMostFrequent = (array) => {
        const sortedArray = array.sort((a,b) =>
        array.filter(v => v===a).length - array.filter(v => v===b).length
        )
        return sortedArray[sortedArray.length - 1]
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // let diseaseCount = {}

    useEffect(() => {
        //if we need to redirect to home do it first
        if (redirect != false){
            return
        }
        // api call here
        // use the values returned from the api call to set a state for that variable
        
        for (const country of countriesInput) {
            const fetchUrl = encodeURI(`${outbreakReportsAPIBaseUrl}?location=${country.toLowerCase()}&start_date=${request.startDate}&end_date=${request.endDate}`)
            
            fetch(fetchUrl)
            .then(res => {
                if (res.status === 400) throw Error('Bad request')
                else if (res.status === 404) return ''
                else return res.json()
            })
            .then(result => {
                if (!result) return 

                diseaseCount[country] = {}
                
                // Count all disease occurrences in reports
                for (const article of result) {
                    if (article.logs) continue 
                    for (const report of article.reports) {
                        for (let disease of report.diseases) {
                            if (disease === 'unknown' || disease === 'other') continue 
                            disease = disease.toLowerCase()
                            
                            diseaseCount[country][disease] = (diseaseCount[country][disease] || {})
                            diseaseCount[country][disease]['caseCount'] = (diseaseCount[country][disease]['caseCount'] || 0) + 1
                            
                            for (const locations of report.locations) {
                                diseaseCount[country][disease]['locations'] = (diseaseCount[country][disease]['locations'] || [])
                                diseaseCount[country][disease]['locations'].push(locations.location.split(',')[0])
    
                                diseaseCount[country][disease]['allOccurrences'] = (diseaseCount[country][disease]['allOccurrences'] || [])
                                const occurrence = {
                                    location: locations.location.split(',')[0],
                                    date: Date.parse(article.date_of_publication),
                                    article: article.url
                                }
                                diseaseCount[country][disease]['allOccurrences'].push(occurrence)
                            }
    
                            if (!('latestReportDate' in diseaseCount[country][disease])) {
                                diseaseCount[country][disease]['latestReportDate'] = Date.parse(article.date_of_publication)
                                diseaseCount[country][disease]['latestReportLink'] = article.url
                            }
                            else if (Date.parse(article.date_of_publication) > diseaseCount[country][disease]['latestReportDate']) {
                                diseaseCount[country][disease]['latestReportDate'] = Date.parse(article.date_of_publication)
                                diseaseCount[country][disease]['latestReportLink'] = article.url
                            }
                            
                        }
                    }
                }
    
                console.log('disease count: ', diseaseCount)

                const thisCountryDiseaseRows = []
    
                for (const disease in diseaseCount[country]) {
                    const freqLocation = getMostFrequent(diseaseCount[country][disease]['locations'])
                    const freqLocationNumCases = diseaseCount[country][disease]['locations'].filter(loc => loc === freqLocation).length
                    const symptoms = symptomsJson.hasOwnProperty(disease.toLowerCase()) ? symptomsJson[disease.toLowerCase()] : ["Unknown symptoms"]
    
                    const newDiseaseRow = {
                        name: capitalizeFirstLetter(disease),
                        count: diseaseCount[country][disease]['caseCount'],
                        freqlocation: freqLocation,
                        freqLocationNumCases: freqLocationNumCases,
                        latestreport: diseaseCount[country][disease]['latestReportLink'],
                        symptoms: symptoms,
                        allOccurrences: diseaseCount[country][disease]['allOccurrences'].sort((a, b) => b.date - a.date)
                    }
    
                    // setDiseaseRows(existing => [...existing, newDiseaseRow])
                    thisCountryDiseaseRows.push(newDiseaseRow)
                }
                setDiseaseRows(existing => {
                    let newDiseaseRows = { ...existing }
                    newDiseaseRows[country] = [...thisCountryDiseaseRows.sort((a, b) => b.count - a.count || b.name - a.name)]
                    return newDiseaseRows
                })
            })
        }

    },[])

    // console.log('disease rows: ', diseaseRows)
    // console.log('current country: ', currentCountry)
    // console.log('disease current: ', diseaseRows[currentCountry])

    const renderRecentOutbreaks = () => {
        if (diseaseRows.hasOwnProperty(currentCountry) && diseaseRows[currentCountry].length > 0) {
            return (
                <div className={classes.info}>
                <Typography variant="h5" gutterBottom>
                    Recent Disease Outbreaks
                </Typography>
                <TableContainer component={Paper} className={classes.table}>
                <Table aria-label="simple table">
                    <TableHead>
                    <TableRow>
                        <TableCell>Disease</TableCell>
                        <TableCell align="right">Number of Outbreaks</TableCell>
                        <TableCell align="right">Most Frequent Case Location</TableCell>
                        <TableCell align="right">Symptoms</TableCell>
                        <TableCell align="right">Latest Report</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {diseaseRows.hasOwnProperty(currentCountry) && diseaseRows[currentCountry] && diseaseRows[currentCountry].map((row) => (
                        <TableRow key={row.name} hover={true} onClick={() => {handleOpenDialog(row)}} style={{cursor: 'pointer'}}>
                            <TableCell component="th" scope="row">
                                {row.name}
                            </TableCell>
                            <TableCell align="right">{row.count}</TableCell>
                            <TableCell align="right">{row.freqlocation} ({row.freqLocationNumCases})</TableCell>
                            <TableCell align="right">
                                <div className={classes.textContainer}>{row.symptoms}</div>
                            </TableCell>
                            <TableCell align="right">
                                <Button 
                                    variant="contained" 
                                    color="default" 
                                    size="small" 
                                    href={row.latestreport} 
                                    target="_blank"
                                >Article</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </TableContainer>
                </div>
            )
        } else return (
            <div className={classes.info}>
                <Typography variant="h5" gutterBottom>
                    No disease outbreaks in your selected time period
                </Typography>
            </div>
        )
    }
    const handleDropdownChange = (event, disease) => {
        event.preventDefault();  
        setDropdownDisease(disease);
    }
    const renderGraphs = () => {
        console.log('diseasecount in curr: ', diseaseCount)
        console.log('current country in render: ', currentCountry)
        console.log('disease count current: ', diseaseCount[currentCountry])
        if (diseaseRows[currentCountry].length > 0) {
            return(
                <div className={classes.info}>
                    <Typography variant="h5" gutterBottom>
                    Data Visualisation
                    </Typography>
                    <GraphDropdown diseases={diseaseRows[currentCountry]} diseaseLocations={diseaseCount[currentCountry]} onDropdownChange={(event, disease) => handleDropdownChange(event, disease.toLowerCase())}></GraphDropdown>
                    <Card className={classes.card}>
                        <CardContent>
                            <p>Number Of Outbreaks In Your Time Overseas</p>
                            <Graph diseases={diseaseRows[currentCountry]} diseaseLocations={diseaseCount[currentCountry]} disease={dropdownDisease} />
                        </CardContent>
                    </Card>
                            
                </div>  
            )
        } else {
            return null
        }
    }

    const renderDiseaseDialog = () => {
        return (
            <Dialog open={dialogOpen} onClose={handleCloseDialog} scroll="paper">
                <DialogTitle>
                    {dialogInfo.name}
                </DialogTitle>
                <DialogContent dividers={true}>
                    <Typography variant="h5">Symptoms</Typography>
                    <Typography variant="body1" gutterBottom>{dialogInfo.symptoms}</Typography>
                    <Typography variant="h6" gutterBottom>All occurrences</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Location</TableCell>
                                    <TableCell align="right">Date</TableCell>
                                    <TableCell align="right">Report</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dialogInfo.allOccurrences && dialogInfo.allOccurrences.map((occurrence) => {
                                    const date = new Date(occurrence.date);
                                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 
                                    'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                    const year = date.getFullYear();
                                    const month = months[date.getMonth()];
                                    const day = date.getDate();
                                    const printDate = day + '-' + month + '-' + year;

                                    return (
                                    <TableRow key={occurrence.url}>
                                        <TableCell>{occurrence.location}</TableCell>
                                        <TableCell align="right">{printDate}</TableCell>
                                        <TableCell align="right">
                                            <Button 
                                                variant="contained" 
                                                color="default" 
                                                size="small" 
                                                href={occurrence.article} 
                                                target="_blank"
                                            >Article</Button>
                                        </TableCell>
                                    </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
        )
    }

    const handleCountryChange = (event) => {
        setCurrentCountry(event.target.value)
    }

    const countryList = ['Australia', 'United states', 'India']

    return (
        <>
        <NavBar />
        <Grid container spacing={3} justify="flex-end">
            <Grid item xs={4}>
                <Typography variant="h2" gutterBottom>
                    {currentCountry}
                </Typography>
            </Grid>
            <Grid item xs={4} style={{marginTop: "10px"}}>
                <FormControl className={classes.formControl}>
                    <InputLabel id="select-country">Country</InputLabel>
                    <Select labelId="select-country" value={currentCountry} onChange={handleCountryChange} defaultValue={currentCountry}>
                        {countriesInput.map((country) => (
                            <MenuItem value={country}>{country}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
        <Typography variant="h4" gutterBottom>
            After you have travelled
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
            See if you may have been affected by any disease outbreaks in your time overseas
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
            Below you will find health and outbreak information for {currentCountry}
        </Typography>
        <div className={classes.root}>
        <Paper className={classes.tabs}>
            <Tabs
                value={view}
                onChange={handleViewChange}
                indicatorColor="primary"
                textColor="primary"
                centered
            >
                <Tab label="Summary" />
                <Tab label="Data" />
            </Tabs>
        </Paper>

        { view === 0 && renderRecentOutbreaks() }
        { view === 0 && renderDiseaseDialog() }
        </div>
        { view === 1 && renderGraphs() }
        
        { redirect }
        </>
    );

}