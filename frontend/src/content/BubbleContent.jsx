import { useEffect, useMemo, useState } from "react";

import { PillGroup } from "../components/Pill";
import { DotDistribution } from "../plots";

const BubbleContent = ({ censusData, state, selectedPark }) => {
  const [parks, setParks] = useState(selectedPark);
  const [activePills, setActivePills] = useState(["race"]);

  useEffect(() => {
    if (activePills.includes(state)) {
      setParks("all");
    } else {
      setParks(selectedPark);
    }
  }, [activePills, selectedPark, state]);

  const layers = useMemo(
    () =>
      activePills.filter((pill) => {
        return pill !== state;
      }),
    [activePills, state]
  );

  const handleOptionToggle = (option) => {
    setActivePills((prev) => {
      if (prev.includes(option)) {
        // If only one pill is left, prevent deselection
        if (prev.length === 1) {
          return prev;
        }
        // Otherwise, remove the pill
        return prev.filter((item) => item !== option);
      } else {
        // Add the pill if it's not already selected
        return [...prev, option];
      }
    });
  };

  return (
    <div className='flex flex-col w-full h-full'>
      <PillGroup
        options={[
          {
            label: "Race",
            value: "race",
          },
          {
            label: "Income",
            value: "income",
          },
          {
            label: "Gender & Age",
            value: "gender",
          },
          {
            label:
              parks === "all"
                ? `${selectedPark} Overview`
                : `${state} Overview`,
            value: state,
          },
        ]}
        activeOptions={activePills}
        onOptionToggle={handleOptionToggle}
      />
      <DotDistribution
        data={censusData}
        state={state}
        showBottomTitle={
          <h1 className='text-left text-xl text-slate-950 self-end'>
            {selectedPark}
          </h1>
        }
        legend
        layers={layers}
        selectedPark={parks}
        margin={10}
      />
    </div>
  );
};

export default BubbleContent;
