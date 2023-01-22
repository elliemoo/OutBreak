import React, { memo, useState } from "react";
import {
  ComposableMap,
  ZoomableGlobe,
  Geographies,
  Geography
} from "react-simple-maps";

// import * as Constants from "./places";

const mapStyles = {
  width: "70%",
  margin: "0 auto",
  display: "block",
  height: "auto"
};


const Map = ({ setTooltipContent }) => {
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
 
  function handleMoveEnd(position) {
    setPosition(position);
  }

  return (
    <div style={{ width: "40%" }}>
    
      <ComposableMap
        width={500}
        height={500}
        projection="orthographic"
        projectionConfig={{ scale: 220 }}
        style={mapStyles}
        data-tip="aaaa"
      >
       
        <ZoomableGlobe
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
        >
          <circle cx={250} cy={250} r={220} fill="transparent" stroke="#CFD8DC"/> 
                <Geographies
                    disableOptimization
                    geography="https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json"
                >
                    {(geos, proj) =>
                    geos.map((geo, i) => (
                        <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        projection={proj}
                        // onMouseEnter={() => {
                        //     const { NAME } = geo.properties;
                        //     setTooltipContent(`${NAME}`);
                        // }}
                        // onMouseLeave={() => {
                        //     setTooltipContent("");
                        // }}
                        onClick={() => {
                            const { NAME } = geo.properties;
                            setTooltipContent(`${NAME}`);
                        }}
                
                        style={{
                            default: {
                            fill: "#D6D6DA",
                            outline: "#000000"
                            },
                            hover: {
                            fill: "#F53",
                            outline: "#000000"
                            },
                            pressed: {
                            fill: "#E42",
                            outline: "none"
                            }
                        }}
                        />
                    ))
                    }
                </Geographies>
        </ZoomableGlobe>
      </ComposableMap>
    </div>
  );
};


 export default memo(Map);




