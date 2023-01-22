import React from 'react';
import NavBar from '../components/NavBar'
import Typography from '@material-ui/core/Typography';
import InputForm from '../components/InputForm'



export default function HomePage() {

    return (
        <>
        <NavBar />
        <Typography variant="h2" gutterBottom>
            Welcome to SafeTravels!
        </Typography>
        <Typography variant="h4" gutterBottom>
            Discover your dream destinations safely and disease free!
        </Typography>
        <Typography variant="h6" gutterBottom>
            Get started!
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
            Provide details of your trip below!
        </Typography>
        <InputForm />
        
        </>
    );

}