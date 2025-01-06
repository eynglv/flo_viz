import { Step, Scrollama } from "react-scrollama";
import { useState } from "react";

import Home from "./content/Home";
import AnimatedMap from "./components/AnimatedMap/AnimatedMap";
import { useMaps } from "./useMaps";
import { introduction } from "./helpers/text";

const Content = () => {
    const [currentStepIndex, setCurrentStepIndex] = useState(null);

    const { mapsData, loading, error } = useMaps();


    const onStepEnter = ({
        // element, // The DOM node of the step that was triggered
        data: stepIndex, // The data supplied to the step
        // direction, // 'up' or 'down'
        // entry, // the original `IntersectionObserver` entry
    }) => {
        setCurrentStepIndex({ stepIndex });
    };

    if (loading) {
        return <h1>Loading...</h1>;
    } else if (error) {
        return null;
    }

    return (
        <div className='w-full px-8'>
            <div className="flex">
                <div className='flex flex-col flex-1'>
                    <Scrollama offset={0.4} onStepEnter={onStepEnter} debug>
                        <Step data='1'>
                            <div><Home /></div>
                        </Step>
                        {Object.entries(introduction).map(([stepIndex, text]) => (
                            <Step data={stepIndex} key={stepIndex}>
                                <div className="h-[1000px]">
                                    <p className="text-4xl">
                                        {text}
                                    </p>
                                </div>
                            </Step>
                        ))}
                    </Scrollama>
                </div>
                <AnimatedMap parksData={mapsData["NYC"].parks} />
            </div>

            {/* The next section */}
            {/* <div className='flex flex-col flex-1'>
                <Scrollama offset={0.4} onStepEnter={onStepEnter} debug>
                    <Step data='1'>
                        <div><Home /></div>
                    </Step>
                    <Step data='2'>
                        <div className="h-[1000px]">Opening text:
                            FLO, known best for his epochal design of New York's
                            Central Park, is regarded as the father of American
                            landscape architecture
                        </div>
                    </Step>
                </Scrollama>
            </div> */}
        </div>
    );
}

export default Content;