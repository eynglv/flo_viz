import { Step, Scrollama } from "react-scrollama";
import { useState } from "react";

import Home from "./content/Home";

const Content = () => {
    const [currentStepIndex, setCurrentStepIndex] = useState(null);

    const onStepEnter = ({
        // element, // The DOM node of the step that was triggered
        data: stepIndex, // The data supplied to the step
        // direction, // 'up' or 'down'
        // entry, // the original `IntersectionObserver` entry
    }) => {
        setCurrentStepIndex({ stepIndex });
    };
    return (
        <Scrollama offset={0.5} onStepEnter={onStepEnter} debug>
            <Step data='1'>
                <div><Home /></div>
            </Step>
        </Scrollama>
    );
}

export default Content;