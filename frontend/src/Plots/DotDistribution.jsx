import * as d3 from "d3";
import { useEffect, useRef } from "react";
import {
  incomeCategories,
  raceCategories,
  sexCategories,
  referencer,
  adjustedAgeBins,
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

// Data Wrangling
const generateHierarchy = (data) => {
  const incomeKeys = Object.keys(incomeCategories);
  const raceKeys = Object.keys(raceCategories);
  const genderKeys = Object.keys(sexCategories);

  const {
    income_data: incomeData,
    race_data: raceData,
    age_data: ageData,
  } = data;

  const genderReferencer = filterRelevantData(ageData, genderKeys, "gender");
  const incomeReferencer = filterRelevantData(incomeData, incomeKeys, "income");
  const raceReferencer = filterRelevantData(raceData, raceKeys, "race");

  const totalPopulationReferencer = ageData.reduce((accumulator, currVal) => {
    const { id, TRACTCE: tract, total_population: totalPopulation } = currVal;
    const uniqueKey = id + "&" + tract;
    return {
      ...accumulator,
      [uniqueKey]: totalPopulation,
    };
  }, {});

  const ageReferencer = ageData.reduce((accumulator, currVal) => {
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

  const convertedIncomeValues = Object.fromEntries(
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

  const aggregateData = [
    raceReferencer,
    convertedIncomeValues,
    genderReferencer,
    ageReferencer,
  ];

  const intersectionKeys = findKeyIntersection(aggregateData);

  const intersection = intersectionKeys.map((key) => {
    return {
      ...raceReferencer[key],
      ...convertedIncomeValues[key],
      ...genderReferencer[key],
      ...ageReferencer[key],
    };
  });

  const sumValues = intersection.reduce((accumulator, currVal) => {
    for (const key in currVal) {
      if (key !== "totalPopulation") {
        accumulator[key] = (accumulator[key] || 0) + parseFloat(currVal[key]);
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
}) => {
  const ref = useRef();

  const data = fullData[state];
  const hierarchy = generateHierarchy(data);

  const group = (d) => d.id.split(".")[0];
  const name = (d) => d.id.split(".")[1];

  const color = d3.scaleOrdinal(d3.schemePaired);

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
        const displayName = referencer[category][key];

        return displayName;
      })
      .attr("dy", "0.3em")
      .style("font-size", (d) => `${Math.min(d.r / 3, 13)}px`)
      .style("fill", "#fff")
      .style("text-anchor", "middle");

    node
      .append("text")
      .text((d) => d.value.toLocaleString())
      .attr("x", 0)
      .attr("y", "2em")
      .style("font-size", "10px")
      .style("fill", "#fff");
  }, [color, height, hierarchy, margin, width]);

  useEffect(() => {
    const svgElement = d3.select(ref.current);

    svgElement
      .append("text")
      .text((d) => state)
      .attr("x", width / 2)
      .attr("y", margin / 5)
      .attr("font-size", "34px");
  }, [height, margin, state, width]);

  return <svg width={width} height={height} ref={ref} />;
};

export default DotDistribution;
