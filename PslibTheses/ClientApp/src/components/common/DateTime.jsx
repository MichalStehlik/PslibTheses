import React from 'react';

const DateTime = ({ date, showTime = true, showDate = true }) => {
    let fulldate = new Date(date);
    let year = fulldate.getFullYear();
    let month = fulldate.getMonth() + 1;
    let day = fulldate.getDate();
    let hours = fulldate.getHours().toString().padStart(2,"0");
    let minutes = fulldate.getMinutes().toString().padStart(2,"0");
    let seconds = fulldate.getSeconds().toString().padStart(2,"0");
    return <>{showDate ? (day + ". " + month + ". " + year) : ""} {showTime ? (hours + ":" + minutes + ":" + seconds) : ""}</>;
}

export default DateTime;