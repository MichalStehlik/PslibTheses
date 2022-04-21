import React from 'react';
import User from "../common/User";

export const DetailPageEvaluators = ({ data }) => {
    if (data) {
        return data.workRoleUsers.map((item, index) => (<User key={ index } image={item.user.iconImage ? <img src={"data:" + item.user.iconImageType + ";base64," + item.user.iconImage} alt={item.user.name} /> : ""} name={item.user.name} detail={item.user.email ? item.user.email : ""} to={"/users/" + item.userId} />))
    }
    return <span>?</span>
}

export default DetailPageEvaluators;