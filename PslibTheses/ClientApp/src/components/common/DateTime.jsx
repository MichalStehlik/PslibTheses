import React from 'react';

const DateTime = props => {
    let date = new Date(props.date);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = date.getHours().toString().padStart(2,"0");
    let minutes = date.getMinutes().toString().padStart(2,"0");
    let seconds = date.getSeconds().toString().padStart(2,"0");
    return <>{day + ". " + month + ". " + year + " " + hours + ":" + minutes + ":" + seconds}</>;
}

export default DateTime;