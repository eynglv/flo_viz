import * as d3 from "d3";
import { useEffect, useRef } from "react";
import {
  incomeCategories,
  raceCategories,
  sexCategories,
  referencer,
  adjustedAgeBins,
  layers,
} from "../helpers/constants";

// Helper functions
const filterRelevantData = (data, referenceKey, reference) => {
  return data.reduce((accumulator, currVal) => {
    const { id, TRACTCE: tract } = currVal;
    const uniqueKey = id + "&" + tract;

    const stats = Object.fromEntries(
      referenceKey.map((key) => {
        const referenceKey = reference + "." + key;
        if (currVal[key] < 0) {
          return [];
        }
        return [referenceKey, currVal[key]];
      })
    );
    return {
      ...accumulator,
      [uniqueKey]: stats,
    };
  }, {});
};

const findKeyIntersection = (dataset) => {
  if (dataset.length === 0) return [];

  return dataset.reduce((commonKeys, currentDataset) => {
    const currentKeys = Object.keys(currentDataset);
    return commonKeys.filter((key) => currentKeys.includes(key));
  }, Object.keys(dataset[0]));
};

const capitalizeFirstLetter = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Data Wrangling
const generateHierarchy = (data, categories = ["income", "race", "gender"]) => {
  const incomeKeys = Object.keys(incomeCategories);
  const raceKeys = Object.keys(raceCategories);
  const genderKeys = Object.keys(sexCategories);

  const {
    income_data: incomeData,
    race_data: raceData,
    age_data: ageData,
  } = data;

  let genderReferencer,
    incomeReferencer,
    raceReferencer,
    totalPopulationReferencer,
    ageReferencer,
    convertedIncomeValues;

  totalPopulationReferencer = ageData.reduce((accumulator, currVal) => {
    const { id, TRACTCE: tract, total_population: totalPopulation } = currVal;
    const uniqueKey = id + "&" + tract;
    return {
      ...accumulator,
      [uniqueKey]: totalPopulation,
    };
  }, {});

  if (categories.includes("income")) {
    incomeReferencer = filterRelevantData(incomeData, incomeKeys, "income");
  }

  if (categories.includes("race")) {
    raceReferencer = filterRelevantData(raceData, raceKeys, "race");
  }

  if (categories.includes("gender")) {
    genderReferencer = filterRelevantData(ageData, genderKeys, "gender");
  }

  if (categories.includes("gender")) {
    ageReferencer = ageData.reduce((accumulator, currVal) => {
      const { id, TRACTCE: tract } = currVal;
      const uniqueKey = id + "&" + tract;

      const stats = Object.fromEntries(
        Object.entries(adjustedAgeBins).map(([bin, keys]) => {
          const referenceKey = "age." + bin;
          let sum = 0;
          for (const key of keys) {
            sum += parseFloat(currVal[key]);
          }
          return [referenceKey, sum];
        })
      );
      return {
        ...accumulator,
        [uniqueKey]: stats,
      };
    }, {});
  }
  if (categories.includes("income")) {
    convertedIncomeValues = Object.fromEntries(
      Object.entries(incomeReferencer).map(([id, stats]) => {
        const totalPopulation = parseFloat(totalPopulationReferencer[id]);

        const recalculatedValues = Object.fromEntries(
          Object.entries(stats).map(([key, percentage]) => [
            key,
            parseInt((parseFloat(percentage) / 100) * totalPopulation),
          ])
        );
        return [id, recalculatedValues];
      })
    );
  }

  const aggregateData = [];

  if (categories.includes("race")) aggregateData.push(raceReferencer);
  if (categories.includes("income")) aggregateData.push(convertedIncomeValues);
  if (categories.includes("gender")) aggregateData.push(genderReferencer);
  if (categories.includes("gender")) aggregateData.push(ageReferencer);

  const intersectionKeys = findKeyIntersection(aggregateData);

  const intersection = intersectionKeys.map((key) => {
    const result = {};

    if (raceReferencer && raceReferencer[key]) {
      Object.assign(result, raceReferencer[key]);
    }

    if (convertedIncomeValues && convertedIncomeValues[key]) {
      Object.assign(result, convertedIncomeValues[key]);
    }

    if (genderReferencer && genderReferencer[key]) {
      Object.assign(result, genderReferencer[key]);
    }

    if (ageReferencer && ageReferencer[key]) {
      Object.assign(result, ageReferencer[key]);
    }

    return result;
  });

  const sumValues = intersection.reduce((accumulator, currVal) => {
    for (const key in currVal) {
      if (key !== "totalPopulation") {
        accumulator[key] =
          (parseFloat(accumulator[key]) || 0) + parseFloat(currVal[key]);
      }
    }
    return accumulator;
  }, {});

  const result = Object.entries(sumValues)
    .map(([key, value]) => {
      return { id: key, value };
    })
    .filter(({ id, value }) => !!value);

  return result;
};

// Main Component
const DotDistribution = ({
  data: fullData,
  width = 1200,
  height = 1000,
  margin = 20,
  state,
  selectedPark = "all",
  layer,
}) => {
  const ref = useRef();

  const data = fullData[state];
  let selectedParkData;

  if (selectedPark !== "all") {
    selectedParkData = Object.entries(data).reduce((accumulator, currVal) => {
      const [dataType, data] = currVal;
      return {
        ...accumulator,
        [dataType]: data.filter((row) => row["name_2"] === selectedPark),
      };
    }, {});
  }

  const finalData = selectedPark === "all" ? data : selectedParkData;

  const hierarchy = generateHierarchy(finalData, ["gender"]);

  const group = (d) => d.id.split(".")[0];
  const name = (d) => d.id.split(".")[1];

  const color = d3.scaleOrdinal(d3.schemeTableau10);

  useEffect(() => {
    const svgElement = d3.select(ref.current);

    const root = d3
      .pack()
      .size([width - 2 * margin, height - 2 * margin])
      .padding(3)(d3.hierarchy({ children: hierarchy }).sum((d) => d.value));

    const node = svgElement
      .attr("viewBox", [-margin, -margin, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
      .attr("text-anchor", "middle")
      .append("g")
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    node
      .append("circle")
      .attr("fill-opacity", 0.7)
      .attr("fill", (d) => color(group(d.data)))
      .attr("r", (d) => d.r);

    node
      .append("text")
      .text((d) => {
        const key = name(d.data);
        const category = group(d.data);
        const displayName = referencer[category]["category"][key];
        return displayName;
      })
      .attr("dy", "0.3em")
      .style("font-size", (d) => `${Math.min(d.r / 3, 13)}px`)
      .style("fill", "#fff")
      .style("text-anchor", "middle")
      .attr("clip-path", (d) => `circle(${d.r})`);

    node
      .append("text")
      .text((d) => d.value.toLocaleString())
      .attr("x", 0)
      .attr("y", "2em")
      .style("font-size", "10px")
      .style("fill", "#fff");
  }, [color, height, hierarchy, margin, width]);

  return (
    <div className='w-full h-full flex flex-col items-center'>
      <svg width={width} height={height} ref={ref} />
      <div className='w-3/4 flex justify-center'>
        {Object.entries(referencer).map(([key, values]) => {
          const { color } = values;
          return (
            <div key={key} className='flex flex-wrap items-center'>
              <div className='w-4 h-4' style={{ backgroundColor: color }} />
              <div className='mr-1' />
              <p className='text-center'>{capitalizeFirstLetter(key)}</p>
              <div className='mr-4' />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DotDistribution;
