---
layout: page
title: "Search"
---
<input type="text" id="search-input" placeholder="Search posts...">
<ul id="results-container"></ul>

<script src="https://unpkg.com/simple-jekyll-search/dest/simple-jekyll-search.min.js"></script>
<script>
  SimpleJekyllSearch({
    searchInput: document.getElementById('search-input'),
    resultsContainer: document.getElementById('results-container'),
    json: '/search.json'
  })
</script>
