import { Step, Scrollama } from "react-scrollama";
import { useState, useRef, useLayoutEffect } from "react";

import Home from "./content/Home";
import AnimatedMap from "./components/AnimatedMap/AnimatedMap";
import { useMaps } from "./useMaps";
import { useHome } from "./useHome";
import { introduction, newYorkText } from "./helpers/text";
import { BaseMap, StackedBarChart, DotDistribution, BoxPlot } from "./plots";
import TransitionMap from "./TransitionMap";
import MainMap from "./components/MainMap";

const Content = () => {
    const [currentStepIndex, setCurrentStepIndex] = useState(null);

    const { mapsData, loading, error } = useMaps();
    const { censusData, loading: censusLoading, error: censusError } = useHome()

    const onStepEnter = ({
        // element, // The DOM node of the step that was triggered
        data: stepIndex, // The data supplied to the step
        // direction, // 'up' or 'down'
        // entry, // the original `IntersectionObserver` entry
    }) => {
        setCurrentStepIndex({ stepIndex });
    };

    const onStepExit = ({
        // element, // The DOM node of the step that was triggered
        data: stepIndex, // The data supplied to the step
        // direction, // 'up' or 'down'
        // entry, // the original `IntersectionObserver` entry
    }) => {
        // console.log(entry)
        setCurrentStepIndex({ stepIndex });
    };

    const onStepProgress = ({
        element, // The DOM node of the step that was triggered
        data, // The data supplied to the step
        progress, // The percent of completion of the step (0 to 1)
        direction, // 'up' or 'down'
        entry, // the original `IntersectionObserver` entry
    }) => {
        console.log(progress)
    }

    if (loading || censusLoading) {
        return <h1>Loading...</h1>;
    } else if (error || censusError) {
        return null;
    }


    return (
        <div className='w-full px-8'>
            <div className="flex mb-10">
                <div className='flex flex-col flex-1'>
                    <Scrollama
                        offset={0.8}
                        onStepEnter={onStepEnter}
                    >
                        <Step data='1'>
                            <div><Home /></div>
                        </Step>
                        {Object.entries(introduction).map(([stepIndex, text]) => (
                            <Step data={stepIndex} key={stepIndex}>
                                <div className="h-[800px]">
                                    {text}
                                </div>
                            </Step>
                        ))}
                    </Scrollama>
                </div>
                <AnimatedMap parksData={mapsData["NYC"].parks} />
            </div>
            {/* The next section */}
            <div className='flex flex-col flex-1'>
                <Scrollama offset={0.5} onStepEnter={onStepEnter} >
                    <Step data='1'>
                        <div className="h-[200px]">
                            <p className="text-3xl">
                                {/* TODO CHANGE THE LAST SENTENCE */}
                                Olmsted began his park designing career in <span className="font-bold">New York </span> and in his life completed 9 other park projects in the city. This is the racial distribution of the neighborhoods that are within a 10 minute walk from his parks.
                            </p>
                        </div>
                    </Step>
                    <Step data='2'>
                        <div>
                            <TransitionMap data={mapsData['NYC']} state="NYC" distributionData={censusData} />
                        </div>
                    </Step>
                    <Step data='3'>
                        <div className="mt-[1000px] w-full h-screen pb-5">
                            <MainMap mapsData={mapsData} censusData={censusData} />
                        </div>
                    </Step>
                    {/* <Step data='3'>
                        <div className={`mt-[1000px]`}>
                            <div className="flex">
                                <BaseMap data={mapsData['Georgia']} state="Georgia" />
                                <div className="w-1/2">
                                    <DotDistribution data={censusData} state={"NYC"} legend={false} layers={["race"]} />
                                </div>
                            </div>
                        </div>
                    </Step> */}
                </Scrollama>
            </div>
        </div>
    );
}

export default Content;
