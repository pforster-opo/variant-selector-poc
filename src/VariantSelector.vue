<script setup>
import { ref } from 'vue'
import searchResponse from './bp90036796-search.json'
import bp10004401Response from './bp10004401-variants.json'
import bp4227900Response from './bp4227900-variants.json'
import bp90038248Response from './bp90038248-variants.json'
import bp90036796Response from './bp90036796-variants.json'
import bp90036969Response from './bp90036969-variants.json'
import bp10027176Response from './bp10027176-variants.json'

const props = defineProps({
    bpCode: String
});

var variantsResponse = bp90036796Response;
if (props.bpCode == "bp10004401") { 
    variantsResponse = bp10004401Response;
}
if (props.bpCode == "bp4227900") { 
    variantsResponse = bp4227900Response;
}
if (props.bpCode == "bp90038248") { 
    variantsResponse = bp90038248Response;
}
if (props.bpCode == "bp90036796") { 
    variantsResponse = bp90036796Response;
}
if (props.bpCode == "bp90036969") { 
    variantsResponse = bp90036969Response;
}
if (props.bpCode == "bp10027176") { 
    variantsResponse = bp10027176Response;
}


/** USE SOLR AS SOURCE
const attributeMap = {};
searchResponse.products.forEach((product) => {
    product.classifications.forEach((classificationClass) => {
        classificationClass.features.forEach((feature) => {
            if(!attributeMap[feature.code]) {
                attributeMap[feature.code] = {
                    key: feature.code,
                    label: feature.name,
                    count: 0,
                    values: []
                };
            }
            attributeMap[feature.code].count++;

            feature.featureValues.forEach((featureValue) => {
                const val = featureValue.value.replaceAll("[", "").replaceAll("]","");
                if(attributeMap[feature.code].values.filter((value) => value.label == val).length == 0) {
                    const value = {
                        label: val,
                        selected: false
                    };
                    attributeMap[feature.code].values.push(value);
                }
            });

        });
    });
});

const articles = [];
searchResponse.products.forEach((product) => {
    const article = {};
    article.code = product.code;
    article.name = product.name;
    article.features = {};

    product.classifications.forEach((classificationClass) => {
        classificationClass.features.forEach((feature) => {
            const articleFeature = {};
            articleFeature.key = feature.code;
            articleFeature.label = feature.name;
            articleFeature.values = feature.featureValues.map((val) => val.value.replaceAll("[", "").replaceAll("]",""));
            articleFeature.match = false;

            article.features[feature.code] = articleFeature;
        });
    });

    Object.values(attributeMap).forEach((attribute) => {
        if(!article.features[attribute.key]) {
            const articleFeature = {};
            articleFeature.key = attribute.key;
            articleFeature.label = attribute.label;
            articleFeature.values = ["--"];
            articleFeature.match = false;

            article.features[attribute.key] = articleFeature;
        }
    })

    articles.push(article);
});
END USE SOLR AS SOURCE */

/** USE VARIANTS AS SOURCE */
const attributeMap = {};
variantsResponse.variants.forEach((variant) => {
    variant.attributes.forEach((feature) => {
        if(!attributeMap[feature.name]) {
            attributeMap[feature.name] = {
                key: feature.name,
                label: feature.name,
                count: 0,
                values: []
            };
        }
        attributeMap[feature.name].count++;

        const val = feature.value ? feature.value : "--";
        if(attributeMap[feature.name].values.filter((value) => value.label == val).length == 0) {
            const value = {
                label: val,
                selected: false
            };
            attributeMap[feature.name].values.push(value);
        }
    });
});

const articles = [];
variantsResponse.variants.forEach((variant) => {
    const article = {};
    article.code = variant.code;
    article.name = variant.name;
    article.features = {};

    variant.attributes.forEach((feature) => {
        const articleFeature = {};
        articleFeature.key = feature.name;
        articleFeature.label = feature.name;
        articleFeature.values = [feature.value ? feature.value : "--"]
        articleFeature.match = false;

        article.features[feature.name] = articleFeature;
    });

    Object.values(attributeMap).forEach((attribute) => {
        if(!article.features[attribute.key]) {
            const articleFeature = {};
            articleFeature.key = attribute.key;
            articleFeature.label = attribute.label;
            articleFeature.values = ["--"];
            articleFeature.match = false;

            article.features[attribute.key] = articleFeature;
        }
    })

    articles.push(article);
});
/** END USE VARIANTS AS SOURCE */

var useAutomaticConflictResolver = ref(true);

Object.values(attributeMap).forEach((filter) => {
    if(filter.count != articles.length) {
        const emptyValue = {
            label: "--",
            selected: false
        };
        filter.values.push(emptyValue);
    }
});

const filters = ref(Object.values(attributeMap).filter((attribute) => {
    return !(attribute.count == articles.length && attribute.values.length == 1);
}));

const clickedFilters = [];

function applyFilter(selectedFilter, selectedValue) {
    clickedFilters.push(selectedFilter);
    selectedFilter.values.forEach((value) => {
        value.selected = value.label == selectedValue.label;
    });
    filterArticles(filters);

    const matchingArticle = articles.find((article) => article.selected);
    if(useAutomaticConflictResolver.value && !matchingArticle) {
        resolveConflicts(filters, selectedFilter);
    }
}

function resetFilter(filter) {
    filter.values.forEach((value) => {
        value.selected = false;
    });
    filterArticles(filters);
}

function resolveConflicts(filters, selectedFilter) {
    const filtersToRelease = [];
    var append = true;
    filters.value.forEach((filter) => {
        if(filter.key == selectedFilter.key) {
            append = false;
        } else {
            if(append) {
                filtersToRelease.push(filter);
            } else {
                filtersToRelease.unshift(filter);
            }
        }
    });

    var numberOfReleasedFilters = 0;
    filtersToRelease.some((filter) => {
        resetFilter(filter);
        numberOfReleasedFilters++;
        const matchingArticle = articles.find((article) => article.selected);
        if(matchingArticle) {
            selectArticle(filters.value, matchingArticle);
            console.log("Released Filters", numberOfReleasedFilters);
        }
        return matchingArticle;
    });
}

function filterArticles(filters, inputArticles) {
    const articleList = articles ? articles : inputArticles;
    articleList.forEach((article) => {
        var matchingArticle = true;
        const filterList = filters.value ? filters.value : filters;
        filterList.forEach((filter) => {
            const selectedFilterValue = filter.values.find((value) => value.selected);
            const articleFeature = article.features[filter.key];
            articleFeature.match = selectedFilterValue && articleFeature.values.indexOf(selectedFilterValue.label) >= 0;
            if(selectedFilterValue) {
                matchingArticle = matchingArticle && articleFeature.match;
            }
        });
        article.selected = matchingArticle;
    });
}

function selectFirstArticle(filters, articles) {
    const selectedArticles = articles.filter((article) => article.selected);

    const firstArticle = selectedArticles[0] ? selectedArticles[0] : articles[0];
    selectArticle(filters, firstArticle);
}

function selectArticle(filters, article) {
    filters.forEach((filter) => {
        const articleValues = article.features[filter.key].values;
        filter.values.forEach((filterValue) => {
           filterValue.selected = articleValues.indexOf(filterValue.label) >= 0;
        });
    });
    filterArticles(filters, articles);
}

</script>

<template>
  <h1>Base Product: <a :href="'https://www.opo.ch/de/p/'+ props.bpCode" target="_blank">{{ props.bpCode }}</a></h1>
  <h2>Settings</h2>
  <div><button @click="selectFirstArticle(filters, articles)">Select First Article</button></div>
  <div>
    <label for="useAutomaticConflictResolver">Enable automatic conflict resolver</label>
    <input name="useAutomaticConflictResolver" type="checkbox" v-model="useAutomaticConflictResolver" />
  </div>
  <h2>Filter</h2>
  <div class="filter" v-for="filter in filters">
    <p><b>{{filter.label}}</b></p>
    <div class="filter-value" :class="{ selected: value.selected }" v-for="value in filter.values" @click="applyFilter(filter, value)">{{value.label}}</div>
    <button  @click="resetFilter(filter)" v-if="!useAutomaticConflictResolver">RESET</button>
  </div>
  <h2>Selected Variant(s)</h2>
  <table>
    <thead>
        <tr>
            <th>Article</th>
            <th v-for="attribute in Object.values(attributeMap)">{{attribute.label}}</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="article in articles" class="article" :class="{selected: article.selected}" >
            <td>{{article.code}}</td>
            <td v-for="attribute in Object.values(attributeMap)">
                <span  :class="{matched: article.features[attribute.key].match}">{{article.features[attribute.key].values.join(" / ")}}</span>
            </td>
        </tr>
    </tbody>
  </table>
</template>

<style scoped>
.filter-value {
    display: inline-block;
    padding: 5px;
    border: 1px solid gray;
    margin-right: 5px;
    cursor: pointer;
}

.filter-value.selected {
    background-color: red;
}

.article.selected {
    background-color: green;
}

.article .matched {
    background-color: red;
}

td,th {
    border: 1px solid gray;
}
</style>
