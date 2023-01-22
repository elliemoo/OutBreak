import React, { useEffect, useState, useContext } from "react";
import { UserInputContext } from "../utils/context";
import NavBar from "../components/NavBar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';

import InfoCard from "../components/InfoCard";
import Row from "../components/Row";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ISOCODES from "../components/IsoCodes"

const useStyles = makeStyles((theme) => ({
  info: {
    paddingTop: "5vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  table: {
    width: "50%",
  },
  card: {
    width: "50%",
  },
}));

export default function PrePage() {
  const classes = useStyles();
  const input = useContext(UserInputContext);
  const { userInput, setUserInput } = input;
  const { countriesInput } = userInput;
  const [diseaseRows, setDiseaseRows] = useState([]);
  const [vaccineInfo, setVaccineInfo] = useState([]);
  const [travelAdvice, setTravelAdvice] = useState([]);
  const [detailedInfo, setDetailedInfo] = useState({});
  const [currentCountry, setCurrentCountry] = useState(countriesInput[0])

  countriesInput.forEach((country, i) => {
    if (country === 'United States of America') countriesInput[i] = 'United States'
  })

  const [view, setView] = useState(0);

  const handleViewChange = (event, newValue) => {
      setView(newValue);
  }; 

  const handleCountryChange = (event) => {
    setCurrentCountry(event.target.value)
  } 

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  console.log(countriesInput);

  useEffect(() => {
    fetch(
      encodeURI(
        `https://6u977749j2.execute-api.ap-southeast-2.amazonaws.com/staging/reports/?location=${currentCountry}`
      )
    )
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        
        let reports = {};
        let detailedReports = {};

        for (var i = 0; i < result.length - 1; i++) {
          let article = result[i];
          let report = article["reports"][0];
          let locations = report["locations"];
          let diseases = report["diseases"];

          diseases
            .filter((disease) => disease !== "unknown" && disease !== "other")
            .forEach((disease) => {
              locations.forEach((location) => {
                let locale = location["location"].split(",")[0];

                // Data processing for initial infomation
                if (!reports.hasOwnProperty(disease)) {
                  reports[disease] = {};
                }

                if (!reports[disease].hasOwnProperty(locale)) {
                  reports[disease][locale] = 0;
                }

                reports[disease][locale] += 1;

                let capitalised_disease = capitalizeFirstLetter(disease);
                // Data processiong for detailed information
                if (!detailedReports.hasOwnProperty(capitalised_disease)) {
                  detailedReports[capitalised_disease] = {};
                }

                if (
                  !detailedReports[capitalised_disease].hasOwnProperty(locale)
                ) {
                  detailedReports[capitalised_disease][locale] = [];
                }

                detailedReports[capitalised_disease][locale].push({
                  headline: article["headline"],
                  url: article["url"],
                });
              });
            });
        }

        let finalReports = [];

        console.log(detailedReports);

        setDetailedInfo(detailedReports);

        for (let [disease, diseaseReports] of Object.entries(reports)) {
          let diseasesSorted = [];

          for (let disease in diseaseReports) {
            diseasesSorted.push([disease, diseaseReports[disease]]);
          }

          diseasesSorted.sort(function (a, b) {
            return b[1] - a[1];
          });

          let totalCount = 0;
          diseasesSorted.forEach((diseaseReport) => {
            totalCount += diseaseReport[1];
          });

          let mostFreq = diseasesSorted[0][0];
          let mostFreqCount = diseasesSorted[0][1];

          finalReports.push({
            name: capitalizeFirstLetter(disease),
            count: totalCount,
            freqlocation: mostFreq,
            freqCount: mostFreqCount,
          });
        }
        setDiseaseRows(finalReports);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [currentCountry]);

  useEffect(() => {
    // Get ISO Code of Country
    fetch(`https://api.tugo.com/v1/travelsafe/countries/${ISOCODES[currentCountry]}`, {
      headers: {
        "X-Auth-API-Key": "aama5f7gjms6cwfva4udjtex",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        let vaccines =
          response["health"]["diseasesAndVaccinesInfo"]["Vaccines"];
        setVaccineInfo(vaccines);

        let travelAdvice = response["health"]["healthInfo"];
        setTravelAdvice(travelAdvice);
      })
      .catch((error) => console.error(error));
  }, [currentCountry]);

  return (
    <>
      <NavBar />
      <Grid container spacing={3} justify="flex-end">
          <Grid item xs={4} style={{marginTop: "10px"}}>
              <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="age-native-simple">Country</InputLabel>
                  <Select native value={currentCountry} onChange={handleCountryChange} label="Country" defaultValue={currentCountry}>
                      {countriesInput.map((country) => (
                          <option value={country}>{country}</option>
                      ))}
                  </Select>
              </FormControl>
          </Grid>
      </Grid>
      <Typography variant="h1" gutterBottom>
        {currentCountry}
      </Typography>
      <Typography variant="h2" gutterBottom>
        Before you travel
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Below you will find health and outbreak information for {currentCountry}
      </Typography>
      <Paper className={classes.tabs}>
          <Tabs
              value={view}
              onChange={handleViewChange}
              indicatorColor="primary"
              textColor="primary"
              centered
          >
              <Tab label="Summary" />
              <Tab label="Vaccinations" />
              <Tab label="Travel Advice" />
          </Tabs>
      </Paper>
      {view === 0 && 
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
                <TableCell />
            </TableRow>
            </TableHead>
            <TableBody>
            {diseaseRows && diseaseRows.sort((a, b) => b.count - a.count || b.name - a.name).map((row) => (
                <Row
                  key={row.name}
                  name={row.name}
                  count={row.count}
                  freqlocation={row.freqlocation}
                  freqCount={row.freqCount}
                  reports={detailedInfo[row.name]}
                  country={currentCountry}
                />
            ))}
            </TableBody>
        </Table>
        </TableContainer>
        </div>
      }
      {view === 1 &&
        <div className={classes.info}>
            <Typography variant="h5" gutterBottom>
                Vaccinations
            </Typography>
            <Card className={classes.card}>
            <CardContent>
                {vaccineInfo.map((vaccine) => (
                    <div key = {vaccine['category']}>
                      <InfoCard
                        description={vaccine["description"]}
                        category={vaccine["category"]}
                      />
                    </div>
                ))}
            </CardContent>
            </Card>
        </div>
      }
      {view === 2 &&
        <div className={classes.info}>
            <Typography variant="h5" gutterBottom>
                Travel Advice
            </Typography>
            <Card className={classes.card}>
            <CardContent>
                {travelAdvice.map((advice) => (
                    <div key = {advice['category']}>
                      <InfoCard
                        category={advice["category"]}
                        description={advice["description"]}
                      />
                    </div>
                ))}
            </CardContent>
            </Card>
        </div>
        }
    </>
  );
}
