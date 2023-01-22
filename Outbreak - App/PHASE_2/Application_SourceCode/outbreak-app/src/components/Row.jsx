import React, { useState } from "react";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import TableContainer from "@material-ui/core/TableContainer";

export default function Row(props) {
  let locations;
  if (props.reports == null) {
    locations = [];
  } else {
    locations = Object.keys(props.reports).sort();
  }

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };
  const handleCloseDialog = () => setDialogOpen(false);

  const renderDiseaseDialog = () => {
    return (
      <Dialog open={dialogOpen} onClose={handleCloseDialog} scroll="paper">
        <DialogContent dividers={true}>
          <Typography variant="h6" gutterBottom>
            All {props.name} cases in {props.country}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Location</TableCell>
                  <TableCell align="right">Headline</TableCell>
                  <TableCell align="right">Article Link</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locations.map((location) =>
                  props.reports[location].map((report) => (
                    <TableRow key={report["headline"]}>
                      <TableCell component="th" scope="row">
                        {location}
                      </TableCell>
                      <TableCell align="right">{report["headline"]}</TableCell>
                      <TableCell align="right">
                        <Button
                          href={report["url"]}
                          target="_blank"
                          variant="contained"
                          size="small"
                          color="default"
                        >
                          Article
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <TableRow>
        <TableCell component="th" scope="row">
          {props.name}
        </TableCell>
        <TableCell align="right">{props.count}</TableCell>
        <TableCell align="right">
          {props.freqlocation + " (" + props.freqCount + ")"}
        </TableCell>
        <TableCell>
          <IconButton onClick={handleOpenDialog}>
            <Button variant="outlined"> More Info </Button>
          </IconButton>
        </TableCell>
      </TableRow>
      {renderDiseaseDialog()}
    </>
  );
}
