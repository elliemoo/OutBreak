import React, { PureComponent } from 'react';
//import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

//Note: these are placeholders!
const data = [
  {
    name: '7 Days Ago',
    numCases1: 4000,
    numCases2: 2400,
    amt: 2400,
  },
  {
    name: '6 Days Ago',
    numCases1: 3000,
    numCases2: 1398,
    amt: 2210,
  },
  {
    name: '5 Days Ago',
    numCases1: 2000,
    numCases2: 9800,
    amt: 2290,
  },
  {
    name: '4 Days Ago',
    numCases1: 2780,
    numCases2: 3908,
    amt: 2000,
  },
  {
    name: '3 Days Ago',
    numCases1: 1890,
    numCases2: 4800,
    amt: 2181,
  },
  {
    name: '2 Days Ago',
    numCases1: 2390,
    numCases2: 3800,
    amt: 2500,
  },
  {
    name: '1 Days Ago',
    numCases1: 3490,
    numCases2: 4300,
    amt: 2100,
  },
];

const debug = false;


export default class Graph extends PureComponent {
//export default function Graph() {
  //static demoUrl = 'https://codesandbox.io/s/simple-line-chart-kec3v';
  static demoUrl = 'https://codesandbox.io/s/simple-bar-chart-tpz8r';
  render() {
    const props = this.props;
    console.log('props: ', props)

    let specifiedDisease = this.props.disease;
    // if (debug) console.log(specifiedDisease)

    //Helper Function: Groups and Add diseaseLocationList
    const groupAndAdd = (arr = []) => {
      //const result = new Map();
      let result = [];
      arr.forEach(el => {
          if(!Array.isArray(specifiedDisease) && specifiedDisease !== 'all'){ //if not default empty array
            if (specifiedDisease !== el.disease){ //check matching disease
              return;
            }
          }
          const found = result.findIndex(el1 => (el1.disease === el.disease && el1.location === el.location));
          // if (debug) console.log(found);
          if (found === -1) {
              result.push({disease: el.disease, location: el.location, count: 1 });
          } else {
            // if (debug) console.log(found)
              result[found].count++;
          }
      });
      if (debug) console.log(result)
      return result;
    };



    // console.log(this.props.diseases)
    if (debug) console.log(props)
    if (debug) console.log(Object.keys(props.diseaseLocations))
    // const diseasesList = Object.keys(props.diseaseLocations).map(x => ({diseaseName : x}))
    // const diseases = props.diseaseLocations.map(x.locations => ({diseaseName : x}))
    let diseaseLocationsList = [];
                    
    for (let disease in props.diseaseLocations) {
        for (let index in props.diseaseLocations[disease].locations) {
            //console.log(disease + '=>' + props.diseaseLocations[disease].locations[index])
            let location = props.diseaseLocations[disease].locations[index]
            diseaseLocationsList.push({disease, location})
        }
    }
    //Now we have a list of disease + locations

    if (debug) console.log(diseaseLocationsList)
    let mergedList = groupAndAdd(diseaseLocationsList)
    if (debug) console.log(mergedList)



    if (debug) console.log(this.props.diseaseLocations)
    return (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          width={500}
          height={300}
          data={mergedList}
          margin={{
            top: 5,
            right: 60,
            left: 0,
            bottom: 200,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="location" angle={40}  textAnchor="start" minTickGap={-200} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" name="Number of Outbreaks" fill="#8884d8" />
          <Legend wrapperStyle={{top: 0, left: 25}} verticalAlign="top" align="center"/>

        </BarChart>

      </ResponsiveContainer>
      
    );
  // render() {
  //   console.log(this.props.diseases)
  //   return (
  //     <ResponsiveContainer width="100%" height={500}>
  //       <BarChart
  //         width={500}
  //         height={300}
  //         data={this.props.diseases}
  //         margin={{
  //           top: 5,
  //           right: 60,
  //           left: 0,
  //           bottom: 200,
  //         }}
  //       >
  //         <CartesianGrid strokeDasharray="3 3" />
  //         <XAxis dataKey="name" angle={40}  textAnchor="start" minTickGap={-200} />
  //         <YAxis />
  //         <Tooltip />
  //         <Bar dataKey="count" name="Number of Outbreaks" fill="#8884d8" />
  //         <Legend wrapperStyle={{top: 0, left: 25}} verticalAlign="top" align="center"/>

  //       </BarChart>

  //     </ResponsiveContainer>
      
  //   );
    // return (
    //   <ResponsiveContainer width="105%" height={400}>
    //     <LineChart
    //       width={500}
    //       height={300}
    //       data={this.props.diseases}
    //       margin={{
    //         top: 5,
    //         right: 30+50,
    //         left: 20,
    //         bottom: 5,
    //       }}
    //     >
    //       <CartesianGrid strokeDasharray="3 3" />
    //       <XAxis dataKey="name" />
    //       <YAxis />
    //       <Tooltip />
    //       <Legend />
    //       <Line type="monotone" dataKey="count" name="Number of Cases" stroke="#8884d8" activeDot={{ r: 8 }} />
    //       <Line type="monotone" dataKey="numCases2" name="Disease 2" stroke="#82ca9d" />
    //     </LineChart>
    //   </ResponsiveContainer>
    // );
   }
}
