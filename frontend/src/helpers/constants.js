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
    NYC: [40.71187578160734, -73.9970154053288],
    Rochester: [43.19069325202286, -77.616747206373],
    Wisconsin: [43.03870799408897, -87.90571684086169]
}

export const layers = {
    Race: 'race_layers',
    Income: 'income_layers',
    Hex: 'hex'
}


export const adjustedBins = {
    "less_than_50k": ["less_than_10", "10_to_14", "15_to_24", "25_to_34"],
    "50k_to_99k": ["35_to_49", "50_to_74", "75_to_99"],
    "100k_to_149k": ["100_to_149"],
    "150k_to_199k": ["150_to_199"],
    "200k_plus": ["more_than_200"],
};