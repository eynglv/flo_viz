export const raceCategories = {
    white_alone: "White",
    black_or_african_american_alone: "Black",
    asian_alone: "Asian",
    hispanic_or_latino_alone: "Hispanic",
    two_or_more: "Mixed",
    some_other_alone: "Other",
}
// total_population: 'Total Population'
// 'total_households_income_benefits': 'Total Households Income',


export const raceColorScale = {
    white_alone: ["bg-green-700", "#15803d"],
    black_or_african_american_alone: ["bg-indigo-800", "#3730a3"],
    asian_alone: ["bg-red-700", "#b91c1c"],
    some_other_alone: ["bg-fuchsia-500", "#d946ef"],
    two_or_more: ["bg-amber-400", "#fbbf24"],
    hispanic_or_latino_alone: ["bg-orange-400", "#fb923c"],
}

export const incomeCategories = {
    'less_than_10': 'Less than $10,000',
    '10_to_14': '$10,000 - $14,000',
    '15_to_24': '$15,000 - $24,000',
    '25_to_34': '$25,000 - $34,000',
    '35_to_49': '$35,000 - $49,000',
    '50_to_74': "$50,000 - $74,000",
    '75_to_99': '$75,000 - $99,000',
    '100_to_149': "$100,000 - $149,000",
    '150_to_199': "$150,000 - $199,000",
    '200_or_more': "$200,000 or more"
}

export const sexCategories = {
    "total_female_population": "Female",
    "total_male_population": "Male",
}

export const ageCategories = {
    "under_20": "Under 20 Years",
    "20_to_35": "20 To 35 Years",
    "35_to_60": "35 To 60 Years",
    "60_to_80": "60 To 80 Years",
    "80_and_over": "80 Years and Over",
}

export const incomeColorScale = {
    'less_than_10': ["bg-sky-50", '#edf8fb'],
    '10_to_14': ["bg-sky-50", '#edf8fb'],
    '15_to_24': ["bg-sky-100", '#b2e2e2'],
    '25_to_34': ["bg-sky-100", '#b2e2e2'],
    '35_to_49': ["bg-emerald-300", '#66c2a4'],
    '50_to_74': ["bg-emerald-300", '#66c2a4'],
    '75_to_99': ["bg-emerald-500", '#2ca25f'],
    '100_to_149': ["bg-emerald-500", '#2ca25f'],
    '150_to_199': ["bg-green-700", "#006d2c"],
    '200_or_more': ["bg-green-700", "#006d2c"]
}

export const coords = {
    Buffalo: [42.88765720808551, -78.87714806011604],
    Georgia: [33.7727648506865, -84.33690217118469],
    Illinois: [41.78467172371183, -87.59717366843768],
    Kentucky: [38.246547973753884, -85.76965140199106],
    Massachusetts: [42.3601, -71.0589],
    NYC: [40.73100603506714, -73.96420497576007],
    Rochester: [43.19069325202286, -77.616747206373],
    Wisconsin: [43.03870799408897, -87.90571684086169]
}

export const layers = {
    Race: { layer: 'race_layers', geojsonFilename: 'total_distribution.geojson', censusFilename: 'race_data.csv' },
    Income: { layer: 'income_layers', geojsonFilename: 'total_distribution.geojson', censusFilename: 'income_data.csv' },
    Sex: { layer: 'sex_layers', censusFilename: 'age_data.csv' },
    Age: { layer: 'sex_layers', censusFilename: 'age_data.csv' }
}


export const adjustedAgeBins = {
    "under_20": ["total_under_5", "total_5_to_9", "total_10_to_14", "total_15_to_19"],
    "20_to_35": ["total_20_to_24", "total_25_to_29", "total_30_to_34"],
    "35_to_60": ["total_35_to_39", "total_40_to_44", "total_45_to_49", "total_50_to_54", "total_55_to_59"],
    "60_to_80": ["total_60_to_64", "total_65_to_69", "total_70_to_74", "total_75_to_79"],
    "80_and_over": ["total_80_to_84", "total_85_and_over"],
};

export const referencer = {
    'race': { category: raceCategories, color: "#5778a4" },
    'income': { category: incomeCategories, color: "#e49444" },
    'gender': { category: sexCategories, color: "#d1615d" },
    'age': { category: ageCategories, color: "#85b6b2" }
}
