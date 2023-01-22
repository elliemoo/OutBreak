import React, {useState} from 'react';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { CardActions, IconButton, Collapse } from '@material-ui/core';

export default function InfoCard(props) {
    const [opened, setOpen] = useState(false);
    
    return (
        <Card>
            <CardContent style = {{paddingTop : '0', paddingBottom: '0'}}>
                <Typography variant="h6">
                    {props.category}
                </Typography>
            </CardContent>
            <Collapse in={opened} collapsedHeight = '75px' timeout="auto">
                <CardContent>
                    <Typography variant="body2">
                        {props.description}
                    </Typography>
                </CardContent>
            </Collapse>
            <CardActions style = {{paddingTop : '0', paddingBottom: '0'}}>
                <IconButton style = {{marginLeft: 'auto', marginRight: 'auto'}} onClick = {() => setOpen(!opened)}>
                    {opened ? <ExpandLessIcon /> : <MoreHorizIcon/>}
                </IconButton>
            </CardActions>
        </Card>
    )
}